# Nightly Multi-Agent Directional Bias Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a nightly, per-instrument multi-agent "directional bias" (Buy/Overweight/Hold/Underweight/Sell) as a supplementary signal on a new admin-reviewed, client-facing dashboard route — alongside, not replacing, the existing single-shot `trading-analysis` → `trading_signals` pipeline.

**Architecture:** A TypeScript port of TradingAgents' debate pattern (analysts → bull/bear debate → research manager → trader → risk debate → portfolio manager), run per-instrument via chained OpenRouter calls. Vercel Cron triggers a dispatcher route nightly, which fans out to a per-instrument worker route (one Vercel Function invocation per instrument, run in small parallel batches) so total wall-clock stays bounded by the slowest single instrument rather than the sum of all 16. Results land in a new `agent_bias` table as `pending_review`; an admin approves before clients see them on `/dashboard/agent-bias`.

**Tech Stack:** Next.js 16.2.4 (App Router) + TypeScript, `openai` SDK (^6.38.0) pointed at OpenRouter, Supabase (`@supabase/supabase-js` ^2.104.1), Vercel Cron. No new dependencies.

## Global Constraints

- No test suite is configured in this repo (confirmed: no jest/vitest/playwright, no `test` script). Every task below substitutes automated tests with: `npx tsc --noEmit` (typecheck), `npm run lint`, and a manual verification step (curl against `npm run dev`, or a check in the Supabase SQL Editor / Table Editor) with an exact expected result. This is a deliberate adaptation of the skill's default TDD shape to match this codebase's actual conventions — do not introduce a test framework as a side effect of this feature.
- No `zod` or other schema-validation library is installed. Request-body validation is manual field checks, matching every existing API route in this repo (see `app/api/admin/metrics/route.ts`, `app/api/past-clients/route.ts`).
- Admin API routes check auth with `getSupabaseServerClient().auth.getUser()` + `user.app_metadata?.role !== "admin"` → `NextResponse.json({ error: "Forbidden" }, { status: 403 })`. This is the majority pattern (3 of 4 sampled existing routes) — use it, not the `401`/`"Unauthorized"` variant.
- Admin writes always go through `getSupabaseAdminClient()` (service role, bypasses RLS) — never rely on an RLS policy for admin-side writes, matching every existing admin route in this repo. RLS on the new table only needs to cover the client-facing read.
- Dynamic API route params are async in this Next.js version: `{ params }: { params: Promise<{ id: string }> }`, then `const { id } = await params;` — confirmed from `app/api/dashboard/notifications/[id]/route.ts:4-9`.
- Styling is inline `style={{ ... }}` objects, dark theme (`#08090f` panel background, `rgba(255,255,255,0.06)` borders, `#4f8ef7` blue accent, `#22c55e` green, `#ef4444` red, `var(--font-syne), Syne, sans-serif` for headings). No `<img>` tags, no glyph icons (stroked SVG only, strokeWidth 2.5-3) — match `CLAUDE.md`'s documented conventions.
- `OPENROUTER_API_KEY` is the exact existing env var name (already set in Vercel — reused, not new). `CRON_SECRET` and the `crons` entry in `vercel.json` are new to this repo — there is no existing bearer-auth pattern to copy; Task 7 introduces it fresh, following the standard Vercel Cron convention (Vercel sends `Authorization: Bearer $CRON_SECRET` automatically to routes listed in `vercel.json`'s `crons` array).
- Reuse `FOREX_PAIRS`, `CRYPTO_PAIRS`, and `fetchMarketTA` from `lib/trading/indicators.ts` as-is — do not modify that file. It is shared with the existing, unrelated `trading-analysis` pipeline.
- Out of scope (do not touch): `/api/admin/trading-analysis`, `/api/trading-analysis`, `trading_signals`, `signals` tables, `/dashboard/signals`, Telegram/Discord posting.

---

### Task 1: Database migration — `agent_bias` table

**Files:**
- Create: `agent-bias-migration.sql` (repo root, matching the existing `<feature>-migration.sql` naming convention — see `trading-signals-migration.sql`, `client-dashboard-migration.sql`)

**Interfaces:**
- Produces: table `agent_bias` with columns `id, created_at, run_date, instrument, display_pair, rating, executive_summary, bull_case, bear_case, trader_action, entry_price, stop_loss, position_sizing, full_debate, status, reviewed_by, reviewed_at, outcome, outcome_checked_at`. `UNIQUE (run_date, instrument)`. RLS policy allowing `SELECT` where `status = 'published'` (anon/authenticated read, for the client dashboard page in Task 9). No RLS policy for writes — all writes go through the service-role client (see Global Constraints).

- [ ] **Step 1: Write the migration file**

```sql
-- Nightly multi-agent directional bias — one row per instrument per night
-- Supplementary to trading_signals; run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS agent_bias (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at         timestamptz DEFAULT now(),
  run_date           date        NOT NULL,
  instrument         text        NOT NULL,   -- canonical Yahoo symbol, e.g. EURUSD=X
  display_pair       text        NOT NULL,   -- EUR/USD
  rating             text        NOT NULL,   -- Buy | Overweight | Hold | Underweight | Sell
  executive_summary  text        NOT NULL,
  bull_case          text,
  bear_case          text,
  trader_action      text,                   -- Buy | Hold | Sell
  entry_price        numeric,
  stop_loss          numeric,
  position_sizing    text,
  full_debate        jsonb,                  -- per-role transcript, for admin review + transparency
  status             text        NOT NULL DEFAULT 'pending_review',  -- pending_review | published | rejected
  reviewed_by        uuid        REFERENCES auth.users(id),
  reviewed_at        timestamptz,
  outcome            text        DEFAULT 'pending',  -- pending | correct | incorrect
  outcome_checked_at timestamptz,
  UNIQUE (run_date, instrument)
);

ALTER TABLE agent_bias ENABLE ROW LEVEL SECURITY;

-- Clients (and the public dashboard read) only ever see published rows.
-- Admin reads/writes go through the service-role client, which bypasses RLS
-- entirely — see every existing admin route in this repo — so no admin
-- policy is needed here.
CREATE POLICY "Clients read published agent_bias" ON agent_bias
  FOR SELECT USING (status = 'published');

NOTIFY pgrst, 'reload schema';
```

- [ ] **Step 2: Run it in Supabase SQL Editor**

Open the Supabase project's SQL Editor, paste the full contents of `agent-bias-migration.sql`, run it.

Expected: `Success. No rows returned.` Then confirm in Table Editor: a new `agent_bias` table exists with all 18 columns listed above and RLS shown as enabled.

- [ ] **Step 3: Commit**

```bash
git add agent-bias-migration.sql
git commit -m "feat: add agent_bias table for nightly multi-agent directional bias"
```

---

### Task 2: Shared instrument list and LLM client helper

**Files:**
- Create: `lib/agent-bias/instruments.ts`
- Create: `lib/agent-bias/llmClient.ts`

**Interfaces:**
- Consumes: `FOREX_PAIRS`, `CRYPTO_PAIRS` from `@/lib/trading/indicators` (each element `{ label: string; yahoo: string }`).
- Produces:
  - `instruments.ts`: `interface Instrument { display: string; yahoo: string; assetType: "forex" | "crypto" }`, `const AGENT_BIAS_INSTRUMENTS: Instrument[]` (16 entries), `function findInstrument(yahoo: string): Instrument | undefined`.
  - `llmClient.ts`: `interface AgentCallResult { content: string; model: string }`, `async function callAgentLLM(systemPrompt: string, userPrompt: string): Promise<AgentCallResult>` — throws if every model in the fallback chain fails or returns empty content.

- [ ] **Step 1: Write `lib/agent-bias/instruments.ts`**

```typescript
import { FOREX_PAIRS, CRYPTO_PAIRS } from "@/lib/trading/indicators";

export interface Instrument {
  display: string;
  yahoo: string;
  assetType: "forex" | "crypto";
}

export const AGENT_BIAS_INSTRUMENTS: Instrument[] = [
  ...FOREX_PAIRS.map((p) => ({ display: p.label, yahoo: p.yahoo, assetType: "forex" as const })),
  ...CRYPTO_PAIRS.map((p) => ({ display: p.label, yahoo: p.yahoo, assetType: "crypto" as const })),
];

export function findInstrument(yahoo: string): Instrument | undefined {
  return AGENT_BIAS_INSTRUMENTS.find((i) => i.yahoo === yahoo);
}
```

- [ ] **Step 2: Write `lib/agent-bias/llmClient.ts`**

Adapted directly from the existing free-tier fallback chain in `app/api/admin/trading-analysis/route.ts:90-165` — same model candidates, same "empty content means try next model" logic, same `reasoning: { enabled: false }` extension — but non-streaming (this is called ~10x per instrument internally, not once per user-facing request).

```typescript
import OpenAI from "openai";

const MODEL_CANDIDATES = [
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "anthropic/claude-sonnet-5",
];

export interface AgentCallResult {
  content: string;
  model: string;
}

export async function callAgentLLM(systemPrompt: string, userPrompt: string): Promise<AgentCallResult> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not set");
  }

  const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    maxRetries: 0,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://eleusisfx.com",
      "X-Title": "Eleusis FX Agent Bias",
    },
  });

  let lastErr: unknown;
  for (const model of MODEL_CANDIDATES) {
    try {
      const completion = await openrouter.chat.completions.create({
        model,
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        ...({ reasoning: { enabled: false } } as object),
      });
      const content = completion.choices[0]?.message?.content ?? "";
      if (content.trim().length > 0) {
        return { content, model };
      }
      console.warn(`[AgentBias] ${model} returned empty content, trying next model`);
    } catch (err) {
      lastErr = err;
      console.warn(`[AgentBias] ${model} failed, trying next model`, err);
    }
  }
  throw lastErr ?? new Error("All models failed or returned empty content");
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/agent-bias/instruments.ts` or `lib/agent-bias/llmClient.ts`.

- [ ] **Step 4: Manual smoke test**

```bash
node --experimental-strip-types -e "
const { AGENT_BIAS_INSTRUMENTS, findInstrument } = require('./lib/agent-bias/instruments.ts');
console.log(AGENT_BIAS_INSTRUMENTS.length, findInstrument('EURUSD=X'));
" 2>&1 || echo "If this fails due to ESM/TS loader mismatch, instead verify via Task 5's worker-route curl test — this file has no side effects to test in isolation beyond the typecheck above."
```

(This repo has no direct TS execution script; the authoritative verification for these two files is the typecheck in Step 3 plus their actual use inside the worker route in Task 5.)

- [ ] **Step 5: Commit**

```bash
git add lib/agent-bias/instruments.ts lib/agent-bias/llmClient.ts
git commit -m "feat: add instrument list and OpenRouter fallback client for agent bias"
```

---

### Task 3: Debate prompts

**Files:**
- Create: `lib/agent-bias/prompts.ts`

**Interfaces:**
- Consumes: `Instrument` from `@/lib/agent-bias/instruments`.
- Produces: `interface PromptPair { system: string; user: string }`, `interface AnalystReports { market: string; sentiment: string; news: string }`, `type RiskStance = "aggressive" | "conservative" | "neutral"`, and functions: `marketAnalystPrompt(instrument, indicatorText)`, `sentimentAnalystPrompt(instrument)`, `newsAnalystPrompt(instrument)`, `bullResearcherPrompt(instrument, reports)`, `bearResearcherPrompt(instrument, reports)`, `researchManagerPrompt(instrument, bullCase, bearCase)`, `traderPrompt(instrument, investmentPlan)`, `riskDebatorPrompt(stance, instrument, traderPlan)`, `portfolioManagerPrompt(instrument, traderPlan, riskDebate)` — all return `PromptPair`.

Sentiment and News analysts have no live data source wired up (no news/social API key exists in this repo's env vars). Their prompts explicitly forbid fabricating specific headlines/events/dates and instead reason qualitatively — this is a deliberate anti-hallucination guard, not a placeholder; TradingAgents' own changelog (`CHANGELOG.md` #781, explored during the design phase) documents exactly this failure mode when an agent is allowed to free-associate over ungrounded data.

- [ ] **Step 1: Write `lib/agent-bias/prompts.ts`**

```typescript
import type { Instrument } from "./instruments";

export interface PromptPair {
  system: string;
  user: string;
}

const BASE_DISCLAIMER =
  "This is a research analysis, not financial advice. Reason only from the data given; never invent specific news headlines, dates, or figures you were not given.";

export function marketAnalystPrompt(instrument: Instrument, indicatorText: string): PromptPair {
  return {
    system: `You are the Market Analyst on a trading desk, specializing in technical analysis of ${instrument.assetType} instruments. ${BASE_DISCLAIMER} Write a concise technical report (150-250 words) covering trend (via EMA50/EMA200), momentum (RSI, MACD), and volatility (ATR). End with a one-line technical bias: Bullish, Bearish, or Neutral.`,
    user: `Instrument: ${instrument.display}\n\nLive indicator data (Yahoo Finance daily OHLCV):\n${indicatorText}\n\nWrite your technical report.`,
  };
}

export function sentimentAnalystPrompt(instrument: Instrument): PromptPair {
  return {
    system: `You are the Sentiment Analyst on a trading desk. You do not have access to a live news or social feed for this run. ${BASE_DISCLAIMER} Reason qualitatively about typical positioning and sentiment dynamics for this instrument type and current session, and be explicit that you are reasoning generally, not from live sources. Keep it to 100-150 words. End with a one-line sentiment bias: Bullish, Bearish, or Neutral.`,
    user: `Instrument: ${instrument.display} (${instrument.assetType}). Write your sentiment assessment.`,
  };
}

export function newsAnalystPrompt(instrument: Instrument): PromptPair {
  return {
    system: `You are the News/Macro Analyst on a trading desk. You do not have access to a live news feed for this run. ${BASE_DISCLAIMER} Reason qualitatively about the macro backdrop typically relevant to this instrument (e.g. central bank policy divergence for FX pairs, risk-on/risk-off flows for crypto), and be explicit that you are reasoning generally, not from live sources. Keep it to 100-150 words. End with a one-line macro bias: Bullish, Bearish, or Neutral.`,
    user: `Instrument: ${instrument.display} (${instrument.assetType}). Write your macro assessment.`,
  };
}

export interface AnalystReports {
  market: string;
  sentiment: string;
  news: string;
}

export function bullResearcherPrompt(instrument: Instrument, reports: AnalystReports): PromptPair {
  return {
    system: `You are the Bull Researcher. Build the strongest honest case FOR a long/bullish position on ${instrument.display}, grounded only in the analyst reports below. ${BASE_DISCLAIMER} If the evidence is weak, say so rather than overstating it. 120-180 words.`,
    user: `Market Analyst report:\n${reports.market}\n\nSentiment Analyst report:\n${reports.sentiment}\n\nNews/Macro Analyst report:\n${reports.news}\n\nMake the bull case.`,
  };
}

export function bearResearcherPrompt(instrument: Instrument, reports: AnalystReports): PromptPair {
  return {
    system: `You are the Bear Researcher. Build the strongest honest case AGAINST a long position (i.e. for short/bearish or staying out) on ${instrument.display}, grounded only in the analyst reports below. ${BASE_DISCLAIMER} If the evidence is weak, say so rather than overstating it. 120-180 words.`,
    user: `Market Analyst report:\n${reports.market}\n\nSentiment Analyst report:\n${reports.sentiment}\n\nNews/Macro Analyst report:\n${reports.news}\n\nMake the bear case.`,
  };
}

export function researchManagerPrompt(instrument: Instrument, bullCase: string, bearCase: string): PromptPair {
  return {
    system: `You are the Research Manager, judging a debate between a Bull and Bear researcher on ${instrument.display}. ${BASE_DISCLAIMER} Weigh both cases on their evidence, not their confidence. Write a short investment plan (100-150 words) stating which case is stronger and why, and what it implies directionally.`,
    user: `Bull case:\n${bullCase}\n\nBear case:\n${bearCase}\n\nWrite the investment plan.`,
  };
}

export function traderPrompt(instrument: Instrument, investmentPlan: string): PromptPair {
  return {
    system: `You are the Trader. Turn the Research Manager's investment plan into a concrete transaction proposal for ${instrument.display}. ${BASE_DISCLAIMER} Respond in EXACTLY this tagged format, one field per line, nothing else before or after:
ACTION: <Buy|Hold|Sell>
REASONING: <two to three sentences>
ENTRY: <a price number, or "n/a" if Hold>
STOP: <a price number, or "n/a" if Hold>
SIZING: <a short sizing note, or "n/a" if Hold>`,
    user: `Investment plan:\n${investmentPlan}\n\nWrite your transaction proposal in the exact tagged format.`,
  };
}

export type RiskStance = "aggressive" | "conservative" | "neutral";

const RISK_STANCE_BRIEF: Record<RiskStance, string> = {
  aggressive: "You argue FOR taking the trade at full conviction, pushing back on excessive caution.",
  conservative: "You argue for capital preservation, flagging every reason this trade could go wrong.",
  neutral: "You weigh both sides evenhandedly, focused on whether the risk/reward is actually justified.",
};

export function riskDebatorPrompt(stance: RiskStance, instrument: Instrument, traderPlan: string): PromptPair {
  const label = stance.charAt(0).toUpperCase() + stance.slice(1);
  return {
    system: `You are the ${label} Risk Analyst reviewing a trade proposal for ${instrument.display}. ${RISK_STANCE_BRIEF[stance]} ${BASE_DISCLAIMER} 80-120 words.`,
    user: `Trader's proposal:\n${traderPlan}\n\nGive your risk assessment.`,
  };
}

export function portfolioManagerPrompt(instrument: Instrument, traderPlan: string, riskDebate: string): PromptPair {
  return {
    system: `You are the Portfolio Manager giving the final call on ${instrument.display}, after the risk team's debate. ${BASE_DISCLAIMER} Respond in EXACTLY this tagged format, one field per line, nothing else before or after:
RATING: <Buy|Overweight|Hold|Underweight|Sell>
SUMMARY: <three to five sentences, the executive summary a client will read>`,
    user: `Trader's proposal:\n${traderPlan}\n\nRisk team debate:\n${riskDebate}\n\nGive your final rating.`,
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/agent-bias/prompts.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/agent-bias/prompts.ts
git commit -m "feat: add debate role prompts for agent bias pipeline"
```

---

### Task 4: Pipeline orchestration

**Files:**
- Create: `lib/agent-bias/pipeline.ts`

**Interfaces:**
- Consumes: `callAgentLLM` from `@/lib/agent-bias/llmClient`; `fetchMarketTA` from `@/lib/trading/indicators`; `Instrument` from `@/lib/agent-bias/instruments`; all prompt functions and `AnalystReports`/`RiskStance` from `@/lib/agent-bias/prompts`.
- Produces: `type Rating = "Buy" | "Overweight" | "Hold" | "Underweight" | "Sell"`, `type TraderAction = "Buy" | "Hold" | "Sell"`, `interface AgentBiasResult { rating: Rating; executiveSummary: string; bullCase: string; bearCase: string; traderAction: TraderAction; entryPrice: number | null; stopLoss: number | null; positionSizing: string | null; fullDebate: Record<string, string> }`, `async function runAgentBiasPipeline(instrument: Instrument): Promise<AgentBiasResult>`. This is what Task 5's worker route calls directly.

- [ ] **Step 1: Write `lib/agent-bias/pipeline.ts`**

```typescript
import { callAgentLLM } from "./llmClient";
import { fetchMarketTA } from "@/lib/trading/indicators";
import type { Instrument } from "./instruments";
import {
  marketAnalystPrompt,
  sentimentAnalystPrompt,
  newsAnalystPrompt,
  bullResearcherPrompt,
  bearResearcherPrompt,
  researchManagerPrompt,
  traderPrompt,
  riskDebatorPrompt,
  portfolioManagerPrompt,
  type AnalystReports,
  type RiskStance,
} from "./prompts";

export type Rating = "Buy" | "Overweight" | "Hold" | "Underweight" | "Sell";
export type TraderAction = "Buy" | "Hold" | "Sell";

export interface AgentBiasResult {
  rating: Rating;
  executiveSummary: string;
  bullCase: string;
  bearCase: string;
  traderAction: TraderAction;
  entryPrice: number | null;
  stopLoss: number | null;
  positionSizing: string | null;
  fullDebate: Record<string, string>;
}

const VALID_RATINGS: Rating[] = ["Buy", "Overweight", "Hold", "Underweight", "Sell"];
const VALID_ACTIONS: TraderAction[] = ["Buy", "Hold", "Sell"];

function parseTaggedField(text: string, tag: string): string | null {
  const re = new RegExp(`^${tag}:\\s*(.+)$`, "im");
  const match = text.match(re);
  return match ? match[1].trim() : null;
}

function parseRating(text: string): { rating: Rating; summary: string } {
  const ratingRaw = parseTaggedField(text, "RATING");
  const summaryRaw = parseTaggedField(text, "SUMMARY");
  const rating = VALID_RATINGS.find((r) => r.toLowerCase() === ratingRaw?.toLowerCase()) ?? "Hold";
  const summary = summaryRaw ?? text.trim().slice(0, 500);
  return { rating, summary };
}

function parseTraderProposal(text: string): {
  action: TraderAction;
  entryPrice: number | null;
  stopLoss: number | null;
  positionSizing: string | null;
} {
  const actionRaw = parseTaggedField(text, "ACTION");
  const action = VALID_ACTIONS.find((a) => a.toLowerCase() === actionRaw?.toLowerCase()) ?? "Hold";
  const entryRaw = parseTaggedField(text, "ENTRY");
  const stopRaw = parseTaggedField(text, "STOP");
  const sizingRaw = parseTaggedField(text, "SIZING");
  const toNumber = (v: string | null) => {
    if (!v || v.toLowerCase() === "n/a") return null;
    const n = Number(v.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  };
  return {
    action,
    entryPrice: toNumber(entryRaw),
    stopLoss: toNumber(stopRaw),
    positionSizing: sizingRaw && sizingRaw.toLowerCase() !== "n/a" ? sizingRaw : null,
  };
}

export async function runAgentBiasPipeline(instrument: Instrument): Promise<AgentBiasResult> {
  const indicatorText = await fetchMarketTA([{ label: instrument.display, yahoo: instrument.yahoo }]);

  const marketPrompt = marketAnalystPrompt(instrument, indicatorText);
  const sentimentPrompt = sentimentAnalystPrompt(instrument);
  const newsPrompt = newsAnalystPrompt(instrument);

  const [marketRes, sentimentRes, newsRes] = await Promise.all([
    callAgentLLM(marketPrompt.system, marketPrompt.user),
    callAgentLLM(sentimentPrompt.system, sentimentPrompt.user),
    callAgentLLM(newsPrompt.system, newsPrompt.user),
  ]);

  const reports: AnalystReports = {
    market: marketRes.content,
    sentiment: sentimentRes.content,
    news: newsRes.content,
  };

  const bullPrompt = bullResearcherPrompt(instrument, reports);
  const bearPrompt = bearResearcherPrompt(instrument, reports);
  const [bullRes, bearRes] = await Promise.all([
    callAgentLLM(bullPrompt.system, bullPrompt.user),
    callAgentLLM(bearPrompt.system, bearPrompt.user),
  ]);

  const managerPrompt = researchManagerPrompt(instrument, bullRes.content, bearRes.content);
  const managerRes = await callAgentLLM(managerPrompt.system, managerPrompt.user);

  const traderPromptPair = traderPrompt(instrument, managerRes.content);
  const traderRes = await callAgentLLM(traderPromptPair.system, traderPromptPair.user);
  const traderProposal = parseTraderProposal(traderRes.content);

  const stances: RiskStance[] = ["aggressive", "conservative", "neutral"];
  const riskResults = await Promise.all(
    stances.map((stance) => {
      const p = riskDebatorPrompt(stance, instrument, traderRes.content);
      return callAgentLLM(p.system, p.user);
    })
  );
  const riskDebateText = stances
    .map((stance, i) => `${stance.toUpperCase()}:\n${riskResults[i].content}`)
    .join("\n\n");

  const pmPrompt = portfolioManagerPrompt(instrument, traderRes.content, riskDebateText);
  const pmRes = await callAgentLLM(pmPrompt.system, pmPrompt.user);
  const { rating, summary } = parseRating(pmRes.content);

  return {
    rating,
    executiveSummary: summary,
    bullCase: bullRes.content,
    bearCase: bearRes.content,
    traderAction: traderProposal.action,
    entryPrice: traderProposal.entryPrice,
    stopLoss: traderProposal.stopLoss,
    positionSizing: traderProposal.positionSizing,
    fullDebate: {
      marketAnalyst: reports.market,
      sentimentAnalyst: reports.sentiment,
      newsAnalyst: reports.news,
      bullCase: bullRes.content,
      bearCase: bearRes.content,
      investmentPlan: managerRes.content,
      traderPlan: traderRes.content,
      riskDebate: riskDebateText,
      portfolioManager: pmRes.content,
    },
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/agent-bias/pipeline.ts`. In particular, confirm `parseTaggedField`'s regex compiles (dynamic `RegExp` construction from a plain-string `tag` argument — no untrusted input reaches this, all call sites pass literal strings `"RATING"`, `"SUMMARY"`, `"ACTION"`, `"ENTRY"`, `"STOP"`, `"SIZING"`).

- [ ] **Step 3: Commit**

```bash
git add lib/agent-bias/pipeline.ts
git commit -m "feat: add agent bias debate pipeline orchestration"
```

---

### Task 5: Cron worker route (per-instrument)

**Files:**
- Create: `app/api/cron/agent-bias/run/route.ts`

**Interfaces:**
- Consumes: `runAgentBiasPipeline` from `@/lib/agent-bias/pipeline`; `findInstrument` from `@/lib/agent-bias/instruments`; `getSupabaseAdminClient` from `@/lib/supabase/server`.
- Produces: `POST /api/cron/agent-bias/run` — body `{ instrument: string }` (a Yahoo symbol, e.g. `"EURUSD=X"`). Requires `Authorization: Bearer $CRON_SECRET`. On success, inserts/updates one row in `agent_bias` and returns `{ instrument, rating }`. This is what Task 6's dispatcher calls once per instrument.

- [ ] **Step 1: Write `app/api/cron/agent-bias/run/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { findInstrument } from "@/lib/agent-bias/instruments";
import { runAgentBiasPipeline } from "@/lib/agent-bias/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorizedCron(req: NextRequest): boolean {
  if (!process.env.CRON_SECRET) return false;
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { instrument: yahooSymbol } = await req.json();
  const instrument = findInstrument(yahooSymbol);
  if (!instrument) {
    return NextResponse.json({ error: `Unknown instrument: ${yahooSymbol}` }, { status: 400 });
  }

  try {
    const result = await runAgentBiasPipeline(instrument);
    const runDate = new Date().toISOString().slice(0, 10);

    const supabase = await getSupabaseAdminClient();
    const { error } = await supabase.from("agent_bias").upsert(
      {
        run_date: runDate,
        instrument: instrument.yahoo,
        display_pair: instrument.display,
        rating: result.rating,
        executive_summary: result.executiveSummary,
        bull_case: result.bullCase,
        bear_case: result.bearCase,
        trader_action: result.traderAction,
        entry_price: result.entryPrice,
        stop_loss: result.stopLoss,
        position_sizing: result.positionSizing,
        full_debate: result.fullDebate,
        status: "pending_review",
      },
      { onConflict: "run_date,instrument" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ instrument: instrument.yahoo, rating: result.rating });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pipeline failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `app/api/cron/agent-bias/run/route.ts`.

- [ ] **Step 3: Set `CRON_SECRET` locally for testing**

Add to `.env.local` (create the file if it doesn't exist — it's gitignored):

```
CRON_SECRET=local-dev-secret-change-me
```

- [ ] **Step 4: Manual end-to-end test against the dev server**

```bash
npm run dev &
sleep 3
curl -s -X POST http://localhost:3000/api/cron/agent-bias/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer local-dev-secret-change-me" \
  -d '{"instrument":"EURUSD=X"}'
```

Expected: after roughly 30-90 seconds (this makes ~10 real OpenRouter calls), a JSON response like `{"instrument":"EURUSD=X","rating":"Hold"}` (rating value will vary — any of the 5 valid ratings is a pass; a 500 with a clear error message is a legitimate finding to investigate, not something to silently retry past). Then in the Supabase Table Editor, confirm a new row exists in `agent_bias` with `instrument = 'EURUSD=X'`, `status = 'pending_review'`, and a non-null `full_debate` jsonb value containing all 9 keys (`marketAnalyst`, `sentimentAnalyst`, `newsAnalyst`, `bullCase`, `bearCase`, `investmentPlan`, `traderPlan`, `riskDebate`, `portfolioManager`).

Also test the auth guard:
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/cron/agent-bias/run \
  -H "Content-Type: application/json" \
  -d '{"instrument":"EURUSD=X"}'
```
Expected: `401`.

- [ ] **Step 5: Commit**

```bash
git add app/api/cron/agent-bias/run/route.ts
git commit -m "feat: add per-instrument agent bias worker route"
```

---

### Task 6: Outcome resolution and cron dispatcher route

**Files:**
- Create: `lib/agent-bias/outcome.ts`
- Create: `app/api/cron/agent-bias/route.ts`

**Interfaces:**
- Consumes: `getSupabaseAdminClient` from `@/lib/supabase/server`; `AGENT_BIAS_INSTRUMENTS` from `@/lib/agent-bias/instruments`.
- Produces:
  - `outcome.ts`: `async function resolvePendingOutcomes(): Promise<{ resolved: number }>` — grades `agent_bias` rows with `outcome = 'pending'` and `run_date` at least 5 trading days old against realized Yahoo Finance price movement, setting `outcome` to `'correct'` or `'incorrect'`.
  - `app/api/cron/agent-bias/route.ts`: `GET /api/cron/agent-bias` — requires `Authorization: Bearer $CRON_SECRET`, calls `resolvePendingOutcomes()` then fans out to the Task 5 worker route for all 16 instruments in batches of 4, returns `{ resolvedOutcomes, dispatched, succeeded, failed }`.

- [ ] **Step 1: Write `lib/agent-bias/outcome.ts`**

```typescript
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const HOLD_TRADING_DAYS = 5;
const HOLD_FLAT_THRESHOLD_PCT = 1; // for Hold ratings: "correct" if |move| stays under this

interface DailyClose {
  timestamp: number;
  close: number;
}

async function fetchYahooDailyCloses(symbol: string): Promise<DailyClose[] | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1y`;
    const res = await fetch(url, { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    const timestamps: number[] = result?.timestamp ?? [];
    const closes: number[] = result?.indicators?.quote?.[0]?.close ?? [];
    const out: DailyClose[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] != null) out.push({ timestamp: timestamps[i], close: closes[i] });
    }
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

// Buy/Overweight expect the price to rise; Sell/Underweight expect it to
// fall; Hold is graded "correct" if price stayed roughly flat rather than
// moving decisively either way.
function directionMatchesRating(rating: string, pctMove: number): boolean {
  if (rating === "Buy" || rating === "Overweight") return pctMove > 0;
  if (rating === "Sell" || rating === "Underweight") return pctMove < 0;
  return Math.abs(pctMove) < HOLD_FLAT_THRESHOLD_PCT;
}

export async function resolvePendingOutcomes(): Promise<{ resolved: number }> {
  const supabase = await getSupabaseAdminClient();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - HOLD_TRADING_DAYS - 2); // small buffer for weekends
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const { data: pending } = await supabase
    .from("agent_bias")
    .select("id, instrument, rating, run_date")
    .eq("outcome", "pending")
    .lte("run_date", cutoffStr);

  if (!pending || pending.length === 0) return { resolved: 0 };

  let resolved = 0;
  for (const row of pending) {
    const closes = await fetchYahooDailyCloses(row.instrument);
    if (!closes) continue;

    const runDateMs = new Date(row.run_date).getTime() / 1000;
    const startIdx = closes.findIndex((c) => c.timestamp >= runDateMs);
    if (startIdx === -1 || startIdx + HOLD_TRADING_DAYS >= closes.length) continue; // not enough data yet, retry next run

    const startClose = closes[startIdx].close;
    const endClose = closes[startIdx + HOLD_TRADING_DAYS].close;
    const pctMove = ((endClose - startClose) / startClose) * 100;
    const outcome = directionMatchesRating(row.rating, pctMove) ? "correct" : "incorrect";

    await supabase
      .from("agent_bias")
      .update({ outcome, outcome_checked_at: new Date().toISOString() })
      .eq("id", row.id);
    resolved++;
  }

  return { resolved };
}
```

- [ ] **Step 2: Write `app/api/cron/agent-bias/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { AGENT_BIAS_INSTRUMENTS } from "@/lib/agent-bias/instruments";
import { resolvePendingOutcomes } from "@/lib/agent-bias/outcome";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorizedCron(req: NextRequest): boolean {
  if (!process.env.CRON_SECRET) return false;
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const outcomeResult = await resolvePendingOutcomes();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eleusisfx.com";
  const workerUrl = `${siteUrl}/api/cron/agent-bias/run`;
  const batches = chunk(AGENT_BIAS_INSTRUMENTS, 4);

  let succeeded = 0;
  let failed = 0;

  for (const batch of batches) {
    const results = await Promise.allSettled(
      batch.map((instrument) =>
        fetch(workerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
          body: JSON.stringify({ instrument: instrument.yahoo }),
        }).then((res) => {
          if (!res.ok) throw new Error(`Worker returned ${res.status} for ${instrument.yahoo}`);
          return res.json();
        })
      )
    );
    for (const r of results) {
      if (r.status === "fulfilled") succeeded++;
      else {
        failed++;
        console.error("[AgentBias] worker failed:", r.reason);
      }
    }
  }

  return NextResponse.json({
    resolvedOutcomes: outcomeResult.resolved,
    dispatched: AGENT_BIAS_INSTRUMENTS.length,
    succeeded,
    failed,
  });
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/agent-bias/outcome.ts` or `app/api/cron/agent-bias/route.ts`.

- [ ] **Step 4: Manual test of the auth guard (do not run the full dispatcher yet — that's 16 real pipeline runs, deferred to Task 10's end-to-end check)**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/cron/agent-bias
```
Expected: `401` (no `Authorization` header sent).

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/cron/agent-bias \
  -H "Authorization: Bearer wrong-secret"
```
Expected: `401`.

- [ ] **Step 5: Commit**

```bash
git add lib/agent-bias/outcome.ts app/api/cron/agent-bias/route.ts
git commit -m "feat: add outcome grading and cron dispatcher for agent bias"
```

---

### Task 7: Vercel Cron schedule and `CRON_SECRET`

**Files:**
- Modify: `vercel.json`

**Interfaces:**
- Produces: a `crons` entry that triggers `GET /api/cron/agent-bias` nightly. No code interface — this is deploy configuration.

- [ ] **Step 1: Modify `vercel.json`**

Current full contents:
```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

New full contents:
```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "crons": [
    { "path": "/api/cron/agent-bias", "schedule": "0 2 * * *" }
  ]
}
```

`0 2 * * *` = 02:00 UTC daily, after the New York close and before the Asian session opens.

- [ ] **Step 2: Set `CRON_SECRET` in Vercel**

In the Vercel project dashboard → Settings → Environment Variables, add `CRON_SECRET` (any long random string, e.g. generate with `openssl rand -hex 32`) for the Production environment. Vercel Cron automatically sends this value as `Authorization: Bearer <CRON_SECRET>` to the configured path — no additional Vercel-side wiring needed.

Do **not** commit the actual secret value anywhere — only the `vercel.json` schedule config is checked into git.

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "feat: schedule nightly agent bias cron"
```

Note: this commit does not include the `CRON_SECRET` value itself (set directly in the Vercel dashboard per Step 2) — nothing to verify locally beyond confirming `vercel.json` is valid JSON: `node -e "JSON.parse(require('fs').readFileSync('vercel.json', 'utf8'))"` should exit 0 with no output.

---

### Task 8: Admin review — PATCH route, review page, nav entry

**Files:**
- Create: `app/api/admin/agent-bias/[id]/route.ts`
- Create: `app/admin/tools/agent-bias/page.tsx`
- Create: `app/admin/tools/agent-bias/AgentBiasReviewClient.tsx`
- Modify: `components/admin/AdminShell.tsx`

**Interfaces:**
- Consumes: `getSupabaseAdminClient`, `getSupabaseServerClient` from `@/lib/supabase/server`.
- Produces: `PATCH /api/admin/agent-bias/[id]` — body `{ status: "published" | "rejected" }`, admin-only, sets `reviewed_by`/`reviewed_at`. `AgentBiasReviewClient` exports `interface AgentBiasRow` (matches the `agent_bias` table shape) and a default-exported component taking `{ initialRows: AgentBiasRow[] }`.

- [ ] **Step 1: Write `app/api/admin/agent-bias/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authClient = await getSupabaseServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status } = await req.json();
  if (status !== "published" && status !== "rejected") {
    return NextResponse.json({ error: "status must be 'published' or 'rejected'" }, { status: 400 });
  }

  const supabase = await getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agent_bias")
    .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

- [ ] **Step 2: Write `app/admin/tools/agent-bias/AgentBiasReviewClient.tsx`**

```tsx
"use client";

import { useState } from "react";

export interface AgentBiasRow {
  id: string;
  run_date: string;
  instrument: string;
  display_pair: string;
  rating: string;
  executive_summary: string;
  bull_case: string | null;
  bear_case: string | null;
  trader_action: string | null;
  entry_price: number | null;
  stop_loss: number | null;
  position_sizing: string | null;
  full_debate: Record<string, string> | null;
  status: string;
}

const RATING_COLOR: Record<string, string> = {
  Buy: "#22c55e",
  Overweight: "#22c55e",
  Hold: "rgba(210,220,240,0.58)",
  Underweight: "#ef4444",
  Sell: "#ef4444",
};

export default function AgentBiasReviewClient({ initialRows }: { initialRows: AgentBiasRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(id: string, status: "published" | "rejected") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/agent-bias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r.id !== id));
      } else {
        const body = await res.json().catch(() => ({}));
        alert(`Failed to update: ${body.error ?? res.statusText}`);
      }
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div style={{ padding: 40, background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, textAlign: "center" }}>
        <p style={{ color: "rgba(210,220,240,0.88)" }}>No bias runs waiting for review.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
      {rows.map((row) => {
        const expanded = expandedId === row.id;
        const color = RATING_COLOR[row.rating] ?? "rgba(210,220,240,0.58)";
        return (
          <div key={row.id} style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "24px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#e8eaf0" }}>
                  {row.display_pair}
                </div>
                <div style={{ fontSize: 11, color: "rgba(210,220,240,0.58)" }}>{row.run_date}</div>
              </div>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color, background: `${color}1a`, padding: "6px 12px", borderRadius: 2 }}>
                {row.rating}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setExpandedId(expanded ? null : row.id)}
                  style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#e8eaf0", padding: "8px 14px", borderRadius: 2, cursor: "pointer", fontSize: 12 }}
                >
                  {expanded ? "Hide debate" : "View debate"}
                </button>
                <button
                  disabled={busyId === row.id}
                  onClick={() => review(row.id, "rejected")}
                  style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444", padding: "8px 14px", borderRadius: 2, cursor: "pointer", fontSize: 12 }}
                >
                  Reject
                </button>
                <button
                  disabled={busyId === row.id}
                  onClick={() => review(row.id, "published")}
                  style={{ background: "#4f8ef7", border: "none", color: "#fff", padding: "8px 14px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                >
                  Approve
                </button>
              </div>
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(210,220,240,0.88)", marginTop: 16 }}>
              {row.executive_summary}
            </p>

            {row.trader_action && (
              <div style={{ fontSize: 12, color: "rgba(210,220,240,0.58)", marginTop: 8 }}>
                Trader: {row.trader_action}
                {row.entry_price != null && ` · Entry ${row.entry_price}`}
                {row.stop_loss != null && ` · Stop ${row.stop_loss}`}
                {row.position_sizing && ` · ${row.position_sizing}`}
              </div>
            )}

            {expanded && (
              <div style={{ marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "grid", gap: 16 }}>
                {row.bull_case && (
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#22c55e", marginBottom: 6 }}>Bull case</div>
                    <p style={{ fontSize: 13, color: "rgba(210,220,240,0.88)", lineHeight: 1.7 }}>{row.bull_case}</p>
                  </div>
                )}
                {row.bear_case && (
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#ef4444", marginBottom: 6 }}>Bear case</div>
                    <p style={{ fontSize: 13, color: "rgba(210,220,240,0.88)", lineHeight: 1.7 }}>{row.bear_case}</p>
                  </div>
                )}
                {row.full_debate?.riskDebate && (
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 6 }}>Risk debate</div>
                    <p style={{ fontSize: 13, color: "rgba(210,220,240,0.88)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{row.full_debate.riskDebate}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Write `app/admin/tools/agent-bias/page.tsx`**

```tsx
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import AgentBiasReviewClient, { type AgentBiasRow } from "./AgentBiasReviewClient";

export const dynamic = "force-dynamic";

export default async function AgentBiasReviewPage() {
  const supabase = await getSupabaseAdminClient();
  const { data: rows } = await supabase
    .from("agent_bias")
    .select("id, run_date, instrument, display_pair, rating, executive_summary, bull_case, bear_case, trader_action, entry_price, stop_loss, position_sizing, full_debate, status")
    .eq("status", "pending_review")
    .order("run_date", { ascending: false })
    .order("display_pair", { ascending: true });

  return (
    <div style={{ padding: "40px 40px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>
          Tools
        </div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5 }}>
          Agent Bias Review
        </h1>
        <p style={{ fontSize: 13, color: "rgba(210,220,240,0.58)", marginTop: 8 }}>
          Nightly multi-agent directional bias, pending approval before it reaches the client dashboard.
        </p>
      </div>

      <AgentBiasReviewClient initialRows={(rows ?? []) as AgentBiasRow[]} />
    </div>
  );
}
```

- [ ] **Step 4: Add nav entry to `components/admin/AdminShell.tsx`**

Find the `NAV` array (existing, lines 9-26 — see excerpt below), and add a new entry after the `trading-analysis`/`snapshots` tools group:

Before:
```typescript
  { href: "/admin/tools/trading-analysis", label: "Trading Analysis" },
  { href: "/admin/tools/snapshots", label: "Analysis Snapshots" },
];
```

After:
```typescript
  { href: "/admin/tools/trading-analysis", label: "Trading Analysis" },
  { href: "/admin/tools/snapshots", label: "Analysis Snapshots" },
  { href: "/admin/tools/agent-bias", label: "Agent Bias" },
];
```

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors referencing any of the 4 files touched in this task.

- [ ] **Step 6: Manual browser test**

With `npm run dev` running and at least one `pending_review` row present (from Task 5's test run), log in as an admin user and visit `http://localhost:3000/admin/tools/agent-bias`.

Expected: the EUR/USD row from Task 5 appears with its rating badge, executive summary, and Approve/Reject/View debate buttons. Click "View debate" — expect the bull case, bear case, and risk debate sections to expand. Click "Approve" — expect the row to disappear from the list (button success path removes it from local state). Confirm in Supabase Table Editor that the row's `status` is now `published` and `reviewed_by`/`reviewed_at` are set.

- [ ] **Step 7: Commit**

```bash
git add app/api/admin/agent-bias/[id]/route.ts app/admin/tools/agent-bias/page.tsx app/admin/tools/agent-bias/AgentBiasReviewClient.tsx components/admin/AdminShell.tsx
git commit -m "feat: add admin review page for agent bias"
```

---

### Task 9: Client dashboard page and nav entry

**Files:**
- Create: `app/dashboard/agent-bias/page.tsx`
- Create: `app/dashboard/agent-bias/AgentBiasCard.tsx`
- Modify: `components/dashboard/DashboardShell.tsx`

**Interfaces:**
- Consumes: `getSupabaseServerClient` from `@/lib/supabase/server` (subject to the Task 1 RLS policy — only `status = 'published'` rows are visible).
- Produces: `AgentBiasCard` exports `interface PublishedBiasRow` and a default-exported component taking `{ row: PublishedBiasRow }`.

- [ ] **Step 1: Write `app/dashboard/agent-bias/AgentBiasCard.tsx`**

```tsx
"use client";

import { useState } from "react";

export interface PublishedBiasRow {
  id: string;
  run_date: string;
  display_pair: string;
  rating: string;
  executive_summary: string;
  bull_case: string | null;
  bear_case: string | null;
}

const RATING_COLOR: Record<string, string> = {
  Buy: "#22c55e",
  Overweight: "#22c55e",
  Hold: "rgba(210,220,240,0.58)",
  Underweight: "#ef4444",
  Sell: "#ef4444",
};

export default function AgentBiasCard({ row }: { row: PublishedBiasRow }) {
  const [open, setOpen] = useState(false);
  const color = RATING_COLOR[row.rating] ?? "rgba(210,220,240,0.58)";

  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#e8eaf0" }}>
          {row.display_pair}
        </div>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color, background: `${color}1a`, padding: "5px 10px", borderRadius: 2 }}>
          {row.rating}
        </div>
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(210,220,240,0.88)" }}>{row.executive_summary}</p>

      {(row.bull_case || row.bear_case) && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{ marginTop: 12, background: "transparent", border: "none", color: "#4f8ef7", cursor: "pointer", fontSize: 12, padding: 0 }}
          >
            {open ? "Hide reasoning" : "Why?"}
          </button>
          {open && (
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {row.bull_case && (
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(210,220,240,0.7)" }}>
                  <span style={{ color: "#22c55e", fontWeight: 600 }}>Bull: </span>{row.bull_case}
                </p>
              )}
              {row.bear_case && (
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(210,220,240,0.7)" }}>
                  <span style={{ color: "#ef4444", fontWeight: 600 }}>Bear: </span>{row.bear_case}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write `app/dashboard/agent-bias/page.tsx`**

```tsx
import { getSupabaseServerClient } from "@/lib/supabase/server";
import AgentBiasCard, { type PublishedBiasRow } from "./AgentBiasCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Outlook — Eleusis FX Dashboard",
};

export default async function AgentBiasPage() {
  const supabase = await getSupabaseServerClient();

  const { data: rows } = await supabase
    .from("agent_bias")
    .select("id, run_date, display_pair, rating, executive_summary, bull_case, bear_case")
    .eq("status", "published")
    .order("run_date", { ascending: false })
    .limit(50);

  const list = (rows ?? []) as PublishedBiasRow[];
  const latestDate = list[0]?.run_date;
  const latest = latestDate ? list.filter((r) => r.run_date === latestDate) : [];

  return (
    <div style={{ padding: "40px 40px 80px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>
          AI Outlook
        </div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1 }}>
          Daily Agent Bias
        </h1>
      </div>

      <div style={{ padding: "14px 20px", background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 4, marginBottom: 32, fontSize: 13, color: "rgba(210,220,240,0.88)" }}>
        Experimental — a supplementary directional bias from an automated multi-agent debate, not a trade instruction. See <a href="/dashboard/signals" style={{ color: "#4f8ef7" }}>Signals</a> for the primary service.
      </div>

      {latest.length === 0 && (
        <div style={{ padding: 40, background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, textAlign: "center" }}>
          <p style={{ color: "rgba(210,220,240,0.88)" }}>No bias published yet. Check back soon.</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {latest.map((row) => (
          <AgentBiasCard key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add nav entry to `components/dashboard/DashboardShell.tsx`**

Find the `NAV` array built inside the component body (existing, lines 13-44 — see excerpt below), and add a new entry after `/dashboard/calendar`:

Before:
```typescript
  { href: "/dashboard",          label: "Overview" },
  { href: "/dashboard/markets",  label: "Live Markets" },
  ...(coachEnabled ? [{ href: "/dashboard/coach",    label: "AI Coach" }] : []),
  { href: "/dashboard/calendar", label: "Economic Calendar" },
  { divider: true },
```

After:
```typescript
  { href: "/dashboard",          label: "Overview" },
  { href: "/dashboard/markets",  label: "Live Markets" },
  ...(coachEnabled ? [{ href: "/dashboard/coach",    label: "AI Coach" }] : []),
  { href: "/dashboard/calendar", label: "Economic Calendar" },
  { href: "/dashboard/agent-bias", label: "Agent Bias" },
  { divider: true },
```

- [ ] **Step 4: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors referencing any of the 3 files touched in this task.

- [ ] **Step 5: Manual browser test**

With the EUR/USD row from Task 8's test now `published`, log in as a non-admin client user and visit `http://localhost:3000/dashboard/agent-bias`.

Expected: the disclaimer banner renders, and a card for EUR/USD shows the rating badge, executive summary, and a "Why?" toggle that reveals the bull/bear case text when clicked. Confirm the sidebar nav now shows an "Agent Bias" entry between "Economic Calendar" and the divider, and that clicking it navigates here.

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/agent-bias/page.tsx app/dashboard/agent-bias/AgentBiasCard.tsx components/dashboard/DashboardShell.tsx
git commit -m "feat: add client-facing agent bias dashboard page"
```

---

### Task 10: End-to-end verification

**Files:** none created or modified — this task exercises the full pipeline built in Tasks 1-9.

- [ ] **Step 1: Full dispatcher run against local dev server**

With `npm run dev` running and `CRON_SECRET=local-dev-secret-change-me` in `.env.local` (from Task 5):

```bash
curl -s -X POST http://localhost:3000/api/cron/agent-bias/run \
  -H "Content-Type: application/json" -H "Authorization: Bearer local-dev-secret-change-me" \
  -d '{"instrument":"GBPUSD=X"}'
```

Then trigger the dispatcher itself (note this fires all 16 instruments — expect several minutes to complete, and note it will attempt to re-upsert EURUSD/GBPUSD since Task 5/this step's `run_date` matches today's, which the `UNIQUE (run_date, instrument)` + `upsert(..., { onConflict: "run_date,instrument" })` handles as an update, not a duplicate):

```bash
time curl -s -X GET http://localhost:3000/api/cron/agent-bias \
  -H "Authorization: Bearer local-dev-secret-change-me"
```

Expected: JSON response `{"resolvedOutcomes":0,"dispatched":16,"succeeded":16,"failed":0}` (`failed` may be nonzero if a specific instrument's Yahoo data is temporarily unavailable — investigate any failures via the dev server console logs rather than ignoring them; `succeeded` should be at least 12+ of 16 for a healthy run). `resolvedOutcomes` will be `0` on a fresh table since no rows are old enough yet to grade.

- [ ] **Step 2: Verify row count in Supabase**

In the Supabase SQL Editor:
```sql
select instrument, rating, status, run_date from agent_bias order by display_pair;
```
Expected: up to 16 rows for today's `run_date`, each with a valid `rating` (one of Buy/Overweight/Hold/Underweight/Sell) and `status = 'pending_review'` (except any already manually approved during Task 8's test).

- [ ] **Step 3: Verify the admin → client flow end to end**

Visit `/admin/tools/agent-bias`, approve 2-3 more rows, then visit `/dashboard/agent-bias` as a client user and confirm those rows now appear there and the still-`pending_review` ones do not.

- [ ] **Step 4: Verify outcome resolution logic in isolation**

This can't be verified live without waiting 5+ trading days, so verify the grading logic directly:
```sql
update agent_bias set run_date = current_date - interval '10 days', outcome = 'pending'
where instrument = 'GBPUSD=X';
```
Then re-run the dispatcher (Step 1's `curl ... /api/cron/agent-bias` command) and check:
```sql
select instrument, rating, outcome, outcome_checked_at from agent_bias where instrument = 'GBPUSD=X';
```
Expected: `outcome` is now `'correct'` or `'incorrect'` (no longer `'pending'`), and `outcome_checked_at` is set — confirming `resolvePendingOutcomes()` correctly picked up and graded an old row using real Yahoo Finance price history.

- [ ] **Step 5: Final typecheck and lint across the whole feature**

```bash
npx tsc --noEmit && npm run lint
```
Expected: zero errors.

No commit for this task — it's verification only, not new code.

---

## Self-Review Notes

- **Spec coverage:** every section of `docs/superpowers/specs/2026-07-22-agent-bias-design.md` maps to a task — pipeline (Tasks 2-4), cron mechanics (Tasks 5-7), data model (Task 1), admin review UI (Task 8), client dashboard UI (Task 9), outcome tracking (Task 6, verified in Task 10).
- **Correction from the spec doc during planning:** the spec's proposed `agent_bias` RLS included an admin-write policy keyed on `auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'`. Codebase research (Task 1) confirmed every existing admin route in this repo writes via the service-role client, which bypasses RLS entirely — an admin-write RLS policy would be dead code. Task 1 only implements the client-read policy that's actually exercised (by `getSupabaseServerClient()` in Task 9's dashboard page).
- **Type consistency check:** `Instrument`, `AgentBiasResult`, `Rating`, `TraderAction`, `PromptPair`, `AnalystReports`, `RiskStance` are each defined exactly once (in `instruments.ts`, `pipeline.ts`, `pipeline.ts`, `pipeline.ts`, `prompts.ts`, `prompts.ts`, `prompts.ts` respectively) and imported by name everywhere else they're used — no redefinitions or renamed duplicates across tasks.
