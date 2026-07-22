# Nightly Multi-Agent Directional Bias — Design Spec

Date: 2026-07-22

## Problem

The existing `/api/admin/trading-analysis` signal generator is a **single LLM call**: one prompt, one pass over Yahoo Finance indicator data, one confluence-framework system prompt (`lib/trading/indicators.ts` `SYSTEM_PROMPT`), producing entry/SL/TP signals stored in `trading_signals` and shown to clients via the `signals` table at `/dashboard/signals`. Win rate on these signals (graded by `/admin/tools/trade-review`) has been low. There is no adversarial check on a signal before it ships — no bull/bear debate, no risk-team pushback, no research manager sign-off.

[TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents) is an open-source multi-agent LLM trading framework (LangGraph/Python) that structures a trading decision as: analysts → bull/bear researcher debate → research manager → trader → risk-team debate → portfolio manager. Verified during exploration (cloned to a scratchpad, installed, ran against live Yahoo Finance data) that its symbol normalization correctly handles forex/metals/indices (`EURUSD` → `EURUSD=X`, `XAUUSD` → `GC=F`, `US30` → `^DJI`), confirming the debate *pattern* is applicable to Eleusis's instrument set even though the project itself is a Python package not directly embeddable in this Next.js/Vercel stack.

## Goal

Ship a **separate, supplementary** signal: a nightly, per-instrument directional bias (Buy/Overweight/Hold/Underweight/Sell) produced by a debate-structured pipeline, surfaced on a new dashboard route — without replacing or touching the existing `trading-analysis` → `trading_signals` → `/dashboard/signals` pipeline. This lets Eleusis compare the debate approach's real hit rate against the current single-shot approach's hit rate over time.

## Decisions made

1. **Engine: port the debate *pattern* to TypeScript**, not run the actual Python/LangGraph package. Reuses the existing Next.js/Vercel/Supabase stack, the existing OpenRouter free-model fallback chain, and the existing cost-tracking (`lib/api-cost-tracking`) — no second language/runtime/deploy target. Trade-off: loses TradingAgents' own checkpointing and upstream bug fixes; Eleusis owns the prompts outright.
2. **Instrument scope: all 16** — the same `FOREX_PAIRS` (12) + `CRYPTO_PAIRS` (4) already defined in `lib/trading/indicators.ts`.
3. **Publish gate: admin approval required.** Cron writes rows as `pending_review`; an admin approves before clients see them. Mirrors the existing articles publish/unpublish pattern. Meaningful given this is real-money, prop-firm-evaluation context.
4. **Model tier: same free-tier chain as today** — `qwen/qwen3-next-80b-a3b-instruct:free` → `meta-llama/llama-3.3-70b-instruct:free` → paid `anthropic/claude-sonnet-5` fallback. Zero incremental cost at steady state.
5. **Outcome tracking: yes**, extending the trade-review pattern to grade `agent_bias` rows against realized price movement, so the debate approach's win rate is directly comparable to the existing signal's win rate.

## Architecture

### Pipeline (per instrument)

Adapted from TradingAgents' agent roles, dropping the Fundamentals Analyst (Yahoo has no meaningful balance-sheet data for FX/crypto — TradingAgents itself drops fundamentals in its own crypto mode for the same reason):

1. **Market Analyst** + **Sentiment Analyst** + **News Analyst** (parallel) — each writes a short report. Market analyst consumes `fetchMarketTA([pair])` (existing helper, `lib/trading/indicators.ts`, called with a single-element array). Sentiment/News analysts use a lightweight headline fetch (new, minimal — reuse whatever's cheapest; does not need to match TradingAgents' StockTwits/Reddit sourcing).
2. **Bull Researcher vs Bear Researcher** — one debate round, each arguing from the analyst reports.
3. **Research Manager** — picks a side, writes an investment plan.
4. **Trader** — turns the plan into action + optional entry price / stop-loss / position sizing.
5. **Risk debate** (aggressive / conservative / neutral, one round) — stress-tests the trader's proposal.
6. **Portfolio Manager** — final structured rating: Buy / Overweight / Hold / Underweight / Sell + executive summary.

Total ≈ 8-10 LLM calls per instrument, ≈ 130-160 calls/night across 16 instruments.

### Cron mechanics

A single Vercel Function cannot run all 16 instruments sequentially within the execution time budget (300s default), since each instrument's critical path (parallel analysts → sequential debate/risk/PM steps) takes roughly 1-2 minutes on free-tier models. Fan-out, not a batch loop:

- **Dispatcher**: `GET /api/cron/agent-bias` — triggered nightly by Vercel Cron (`vercel.json` `crons` entry). Verifies the `CRON_SECRET` bearer auth Vercel sends automatically. First resolves any `pending` outcomes from prior nights (see Outcome tracking below), then fans out via `Promise.allSettled` to the worker route for all 16 instruments in parallel. Dispatcher's own wall-clock is bounded by the slowest single instrument, not the sum.
- **Worker**: `POST /api/cron/agent-bias/run` — body `{ instrument }`. Also checks `CRON_SECRET` (not just called by the dispatcher — must reject unauthenticated hits so the free-tier OpenRouter quota can't be burned by an outside caller). Runs the full per-instrument pipeline, inserts one row into `agent_bias`.

### Data model

New table, `agent-bias-migration.sql`:

```sql
CREATE TABLE IF NOT EXISTS agent_bias (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now(),
  run_date         date        NOT NULL,
  instrument       text        NOT NULL,   -- canonical Yahoo symbol, e.g. EURUSD=X
  display_pair     text        NOT NULL,   -- EUR/USD
  rating           text        NOT NULL,   -- Buy | Overweight | Hold | Underweight | Sell
  executive_summary text       NOT NULL,
  bull_case        text,
  bear_case        text,
  trader_action    text,                   -- Buy | Hold | Sell
  entry_price      numeric,
  stop_loss        numeric,
  position_sizing  text,
  full_debate      jsonb,                  -- full per-role transcript, for admin review + transparency
  status           text        NOT NULL DEFAULT 'pending_review',  -- pending_review | published | rejected
  reviewed_by      uuid        REFERENCES auth.users(id),
  reviewed_at      timestamptz,
  outcome          text        DEFAULT 'pending',   -- pending | correct | incorrect | invalidated
  outcome_checked_at timestamptz,
  UNIQUE (run_date, instrument)
);

ALTER TABLE agent_bias ENABLE ROW LEVEL SECURITY;

-- Admins: full access. Clients: read-only, published rows only.
CREATE POLICY "Admins manage agent_bias" ON agent_bias
  FOR ALL USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
CREATE POLICY "Clients read published agent_bias" ON agent_bias
  FOR SELECT USING (status = 'published');
```

### Admin review UI

New page `/admin/tools/agent-bias`, following the existing articles publish/unpublish and past-clients edit patterns: lists the current `run_date`'s `pending_review` rows, rating badge + executive summary + an expandable panel rendering `full_debate` (bull case / bear case / risk debate transcript). Approve/Reject buttons call `PATCH /api/admin/agent-bias/[id]` to flip `status` (and set `reviewed_by`/`reviewed_at`).

### Client dashboard UI

New route `/dashboard/agent-bias`, added to `DashboardShell`'s sidebar nav. Card grid, one card per instrument: color-coded rating badge (`#22c55e` bullish / `#ef4444` bearish / neutral gray for Hold, matching existing conventions), the Portfolio Manager's executive summary, and a collapsible "why" section showing bull case / bear case highlights. A persistent disclaimer banner: "Experimental — a supplementary directional bias, not a trade instruction," kept visually and functionally separate from the paid `/dashboard/signals` product.

### Outcome tracking

A step in the same nightly cron (runs before generating the new night's batch, mirroring TradingAgents' own "resolve pending entries first" pattern): for `agent_bias` rows with `outcome = 'pending'` and `run_date` at least N days old (N = holding period, e.g. 5 trading days — matches TradingAgents' default), fetch realized Yahoo Finance price movement for the instrument and mark `outcome` as `correct` (price moved with the rating direction), `incorrect` (moved against it), or `invalidated` (price data unavailable / delisted — retry next run). This is what makes the debate approach's hit rate directly comparable to the existing `trading_signals` win rate over time.

## Out of scope (for this pass)

- No changes to `/api/admin/trading-analysis`, `trading_signals`, `signals`, or `/dashboard/signals` — this ships alongside, not instead of.
- No Telegram/Discord posting for `agent_bias` (that's the existing signal product's distribution channel).
- No paid-model tier — free-tier chain only, per the model-tier decision above. Revisit if free-tier reliability/quality proves insufficient after real-world runs.
- No intraday cadence — this is a daily/swing bias, same cadence as TradingAgents itself, not a scalping signal.
