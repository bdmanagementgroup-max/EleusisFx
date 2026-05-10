import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// ─── Yahoo Finance symbol map ─────────────────────────────────────────────────

const YAHOO_MAP: Record<string, string> = {
  "EUR/USD": "EURUSD=X",  "EURUSD": "EURUSD=X",
  "GBP/USD": "GBPUSD=X",  "GBPUSD": "GBPUSD=X",
  "USD/JPY": "USDJPY=X",  "USDJPY": "USDJPY=X",
  "AUD/USD": "AUDUSD=X",  "AUDUSD": "AUDUSD=X",
  "GBP/JPY": "GBPJPY=X",  "GBPJPY": "GBPJPY=X",
  "USD/CAD": "USDCAD=X",  "USDCAD": "USDCAD=X",
  "NZD/USD": "NZDUSD=X",  "NZDUSD": "NZDUSD=X",
  "EUR/GBP": "EURGBP=X",  "EURGBP": "EURGBP=X",
  "USD/CHF": "USDCHF=X",  "USDCHF": "USDCHF=X",
  "EUR/JPY": "EURJPY=X",  "EURJPY": "EURJPY=X",
  "CAD/JPY": "CADJPY=X",  "CADJPY": "CADJPY=X",
  "AUD/NZD": "AUDNZD=X",  "AUDNZD": "AUDNZD=X",
  "XAU/USD": "GC=F",      "XAUUSD": "GC=F",      "Gold": "GC=F",
  "BTC/USD": "BTC-USD",   "BTC/USDT": "BTC-USD",  "BTCUSD": "BTC-USD",
  "ETH/USD": "ETH-USD",   "ETH/USDT": "ETH-USD",
  "SOL/USD": "SOL-USD",   "SOL/USDT": "SOL-USD",
  "XRP/USD": "XRP-USD",   "XRP/USDT": "XRP-USD",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayBar { date: string; high: number; low: number; close: number; }

type OutcomeCode =
  | "won_tp2" | "won_tp1" | "lost"
  | "pending_active" | "pending_never_entered"
  | "skipped";

interface SignalRow {
  id: string;
  pair: string;
  direction: string;
  entry_price: string | null;
  stop_loss: string | null;
  tp1: string | null;
  tp2: string | null;
  created_at: string;
  outcome: string | null;
}

interface EvalResult {
  id: string;
  pair: string;
  direction: string;
  signalDate: string;
  entryStr: string;
  slStr: string;
  tp1Str: string;
  tp2Str: string;
  currentPrice: number;
  outcome: OutcomeCode;
  entryDate: string | null;
  outcomeDate: string | null;
  priceNarrative: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchOHLCV(symbol: string): Promise<DayBar[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return [];
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return [];
    const ts: number[] = result.timestamp ?? [];
    const q = result.indicators?.quote?.[0] ?? {};
    return ts
      .map((t: number, i: number) => ({
        date: new Date(t * 1000).toISOString().slice(0, 10),
        high: q.high?.[i] ?? 0,
        low:  q.low?.[i]  ?? 0,
        close: q.close?.[i] ?? 0,
      }))
      .filter((d: DayBar) => d.high > 0 && d.low > 0);
  } catch { return []; }
}

function allNumbers(s: string | null | undefined): number[] {
  if (!s) return [];
  return [...s.replace(/,/g, "").matchAll(/\d+\.?\d*/g)]
    .map(m => parseFloat(m[0]))
    .filter(n => !isNaN(n) && n > 0);
}

// For entry: LONG uses lower bound (limit dip), SHORT uses upper bound (limit rally)
function entryTriggerPrice(s: string | null | undefined, direction: string): number | null {
  const nums = allNumbers(s);
  if (!nums.length) return null;
  return direction === "BUY" ? Math.min(...nums) : Math.max(...nums);
}

function firstNumber(s: string | null | undefined): number | null {
  const nums = allNumbers(s);
  return nums.length ? nums[0] : null;
}

function fmt(n: number | null, decimals = 5): string {
  if (n === null) return "—";
  return n > 999 ? n.toFixed(2) : n.toFixed(decimals);
}

// ─── Outcome evaluator ────────────────────────────────────────────────────────

function evaluateSignal(sig: SignalRow, bars: DayBar[]): EvalResult {
  const dir = sig.direction?.toUpperCase() ?? "";
  const base: Omit<EvalResult, "outcome" | "entryDate" | "outcomeDate" | "priceNarrative" | "currentPrice"> = {
    id: sig.id,
    pair: sig.pair,
    direction: dir,
    signalDate: sig.created_at.slice(0, 10),
    entryStr: sig.entry_price ?? "—",
    slStr: sig.stop_loss ?? "—",
    tp1Str: sig.tp1 ?? "—",
    tp2Str: sig.tp2 ?? "—",
  };

  const currentPrice = bars.at(-1)?.close ?? 0;

  if (!dir || dir === "NEUTRAL") {
    return { ...base, currentPrice, outcome: "skipped", entryDate: null, outcomeDate: null, priceNarrative: "Signal marked as neutral / skipped." };
  }

  const entryTrigger = entryTriggerPrice(sig.entry_price, dir);
  const sl           = firstNumber(sig.stop_loss);
  const tp1          = firstNumber(sig.tp1);
  const tp2          = firstNumber(sig.tp2);

  const relevant = bars.filter(d => d.date >= base.signalDate);

  let entered = false;
  let entryDate: string | null = null;
  let outcome: OutcomeCode = "pending_never_entered";
  let outcomeDate: string | null = null;
  const pathNotes: string[] = [];

  for (const day of relevant) {
    if (!entered) {
      const triggered =
        dir === "BUY"
          ? entryTrigger !== null && day.low <= entryTrigger
          : entryTrigger !== null && day.high >= entryTrigger;

      if (triggered) {
        entered = true;
        entryDate = day.date;
        pathNotes.push(`Entered ${day.date} (H:${fmt(day.high)} L:${fmt(day.low)})`);
        outcome = "pending_active";
      } else {
        pathNotes.push(`${day.date}: H:${fmt(day.high)} L:${fmt(day.low)} — no entry`);
      }
      continue;
    }

    // Already entered — check SL and TP
    if (dir === "BUY") {
      if (sl !== null && day.low <= sl) {
        outcome = "lost"; outcomeDate = day.date;
        pathNotes.push(`SL hit ${day.date} (L:${fmt(day.low)} ≤ SL:${fmt(sl)})`);
        break;
      }
      if (tp2 !== null && day.high >= tp2) {
        outcome = "won_tp2"; outcomeDate = day.date;
        pathNotes.push(`TP2 hit ${day.date} (H:${fmt(day.high)} ≥ TP2:${fmt(tp2)})`);
        break;
      }
      if (tp1 !== null && day.high >= tp1) {
        outcome = "won_tp1"; outcomeDate = day.date;
        pathNotes.push(`TP1 hit ${day.date} (H:${fmt(day.high)} ≥ TP1:${fmt(tp1)})`);
        break;
      }
    } else {
      if (sl !== null && day.high >= sl) {
        outcome = "lost"; outcomeDate = day.date;
        pathNotes.push(`SL hit ${day.date} (H:${fmt(day.high)} ≥ SL:${fmt(sl)})`);
        break;
      }
      if (tp2 !== null && day.low <= tp2) {
        outcome = "won_tp2"; outcomeDate = day.date;
        pathNotes.push(`TP2 hit ${day.date} (L:${fmt(day.low)} ≤ TP2:${fmt(tp2)})`);
        break;
      }
      if (tp1 !== null && day.low <= tp1) {
        outcome = "won_tp1"; outcomeDate = day.date;
        pathNotes.push(`TP1 hit ${day.date} (L:${fmt(day.low)} ≤ TP1:${fmt(tp1)})`);
        break;
      }
    }
    pathNotes.push(`${day.date}: H:${fmt(day.high)} L:${fmt(day.low)} C:${fmt(day.close)} — running`);
  }

  if (outcome === "pending_never_entered" && entryTrigger !== null) {
    const dist = dir === "BUY"
      ? currentPrice - entryTrigger
      : entryTrigger - currentPrice;
    pathNotes.push(`Entry zone (${fmt(entryTrigger)}) never reached. Current price ${fmt(currentPrice)} — ${fmt(Math.abs(dist))} away.`);
  }

  return { ...base, currentPrice, outcome, entryDate, outcomeDate, priceNarrative: pathNotes.slice(0, 6).join(" | ") };
}

const REVIEW_SYSTEM_PROMPT = `You are the Eleusis FX performance analyst reviewing trading signals. You have been given:
1. The original signal details (pair, direction, entry, SL, TP1, TP2)
2. Actual daily OHLCV price data since each signal was issued
3. A programmatic evaluation of whether each signal's levels were hit

Your job: write a professional trade review report. Be honest, direct, and specific. No padding.

Format your report exactly as:

### ELEUSIS FX — TRADE REVIEW
**Review Date:** [date]
**Signals Reviewed:** [N] · **Won:** [N] · **Lost:** [N] · **Pending:** [N] · **Skipped:** [N]

---

#### SUMMARY TABLE
| # | Pair | Dir | Outcome | Entry Hit | Details |
|---|------|-----|---------|-----------|---------|
[one row per signal]

---

#### SIGNAL REVIEWS

For each signal, write:
#### [PAIR] — [BUY/SELL] — [OUTCOME LABEL]
Price path, what happened, and why. 2–4 sentences. Specific prices and dates.

---

#### ANALYST NOTES
2–3 sentences on the overall batch quality. What worked, what to improve.`;

// ─── GET — list past reviews ──────────────────────────────────────────────────

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getSupabaseAdminClient();
  const { data, error } = await db
    .from("trade_reviews")
    .select("id, created_at, signals_reviewed, won, lost, pending, skipped")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data ?? [] });
}

// ─── POST — run review (streaming) ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), { status: 500 });
  }

  const db = await getSupabaseAdminClient();

  // Fetch pending signals (fall back to all if none pending)
  let { data: signals } = await db
    .from("trading_signals")
    .select("id, pair, direction, entry_price, stop_loss, tp1, tp2, created_at, outcome")
    .eq("outcome", "pending")
    .order("created_at", { ascending: false });

  if (!signals || signals.length === 0) {
    const { data: all } = await db
      .from("trading_signals")
      .select("id, pair, direction, entry_price, stop_loss, tp1, tp2, created_at, outcome")
      .order("created_at", { ascending: false })
      .limit(20);
    signals = all ?? [];
  }

  if (!signals || signals.length === 0) {
    return new Response(JSON.stringify({ error: "No signals found — run an analysis and save signals first." }), { status: 404 });
  }

  // Fetch OHLCV for each unique pair
  const uniquePairs = [...new Set((signals as SignalRow[]).map(s => s.pair))];
  const ohlcvMap = new Map<string, DayBar[]>();
  await Promise.all(
    uniquePairs.map(async (pair) => {
      const symbol = YAHOO_MAP[pair];
      if (!symbol) return;
      const bars = await fetchOHLCV(symbol);
      ohlcvMap.set(pair, bars);
    })
  );

  // Evaluate each signal
  const evals = (signals as SignalRow[]).map(sig =>
    evaluateSignal(sig, ohlcvMap.get(sig.pair) ?? [])
  );

  // Auto-update resolved outcomes in DB
  const resolved = evals.filter(e => e.outcome === "won_tp1" || e.outcome === "won_tp2" || e.outcome === "lost");
  if (resolved.length > 0) {
    await Promise.all(
      resolved.map(e =>
        db.from("trading_signals").update({
          outcome: e.outcome === "lost" ? "lost" : "won",
        }).eq("id", e.id)
      )
    );
  }

  // Build user message for Claude
  const reviewDate = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const signalBlocks = evals.map((e, i) => `
Signal ${i + 1}: ${e.pair} — ${e.direction}
  Signal date: ${e.signalDate}
  Entry: ${e.entryStr} | SL: ${e.slStr} | TP1: ${e.tp1Str} | TP2: ${e.tp2Str}
  Current price: ${fmt(e.currentPrice)}
  Programmatic evaluation: ${e.outcome.replace(/_/g, " ")}
  Entry triggered: ${e.entryDate ?? "no"}
  Outcome date: ${e.outcomeDate ?? "unresolved"}
  Price path: ${e.priceNarrative}
`).join("\n---\n");

  const counts = {
    won:     evals.filter(e => e.outcome === "won_tp1" || e.outcome === "won_tp2").length,
    lost:    evals.filter(e => e.outcome === "lost").length,
    pending: evals.filter(e => e.outcome === "pending_active" || e.outcome === "pending_never_entered").length,
    skipped: evals.filter(e => e.outcome === "skipped").length,
  };

  const userMessage = `Write the Eleusis FX trade review report.

**Review Date:** ${reviewDate}
**Signals to review:** ${evals.length}
**Programmatic results:** Won: ${counts.won} · Lost: ${counts.lost} · Pending: ${counts.pending} · Skipped: ${counts.skipped}

---

${signalBlocks}

---

Use the programmatic evaluation and price path data above as your source of truth. Narrate the review professionally. Be specific about prices and dates.`;

  // Stream Claude response
  const anthropic = new Anthropic({ apiKey, maxRetries: 3 });
  const encoder = new TextEncoder();
  const chunks: string[] = [];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const msgStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          system: REVIEW_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        });

        for await (const event of msgStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            chunks.push(event.delta.text);
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();

        // Save completed review to Supabase
        const content = chunks.join("");
        await db.from("trade_reviews").insert({
          content,
          signals_reviewed: evals.length,
          won:     counts.won,
          lost:    counts.lost,
          pending: counts.pending,
          skipped: counts.skipped,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Review failed";
        controller.enqueue(encoder.encode(`\n\n[ERROR] ${msg}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
