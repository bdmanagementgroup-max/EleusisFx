import { NextRequest, NextResponse, after } from "next/server";
import OpenAI from "openai";
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
  session_id: string | null;
  session: string | null;
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
  rMultiple: number | null;
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
  const base: Omit<EvalResult, "outcome" | "entryDate" | "outcomeDate" | "priceNarrative" | "currentPrice" | "rMultiple"> = {
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
    return { ...base, currentPrice, outcome: "skipped", entryDate: null, outcomeDate: null, priceNarrative: "Signal marked as neutral / skipped.", rMultiple: null };
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

  // R-multiple: risk = |entry − SL| = 1R by definition. Win = reward achieved to
  // the TP that hit; full stop = −1R. Left null when unresolved or levels missing.
  let rMultiple: number | null = null;
  if (entryTrigger !== null && sl !== null) {
    const risk = Math.abs(entryTrigger - sl);
    if (risk > 0) {
      if (outcome === "lost") {
        rMultiple = -1;
      } else if (outcome === "won_tp2" && tp2 !== null) {
        rMultiple = Math.abs(tp2 - entryTrigger) / risk;
      } else if (outcome === "won_tp1" && tp1 !== null) {
        rMultiple = Math.abs(tp1 - entryTrigger) / risk;
      }
      if (rMultiple !== null) rMultiple = Math.round(rMultiple * 100) / 100;
    }
  }

  return { ...base, currentPrice, outcome, entryDate, outcomeDate, priceNarrative: pathNotes.slice(0, 6).join(" | "), rMultiple };
}

const REVIEW_SYSTEM_PROMPT = `You are the Eleusis FX performance analyst reviewing all trading signals across every analysis session. You receive programmatic evaluations of every signal's outcome based on real daily OHLCV data.

Your job: write a comprehensive trade review report. Be honest, direct, and specific. No padding.

Format your report exactly as:

### ELEUSIS FX — FULL TRADE REVIEW
**Review Date:** [date]
**Sessions Reviewed:** [N] · **Total Signals:** [N] · **Win Rate:** [N]% (excludes pending/skipped)

---

#### OVERALL SUMMARY
| Metric | Value |
|--------|-------|
| Won (TP hit) | [N] |
| Lost (SL hit) | [N] |
| Pending (active or never entered) | [N] |
| Skipped (neutral/no signal) | [N] |
| **Win Rate** | **[N]%** |

---

#### BY SESSION

For each analysis session:
##### [Session name] — [Date] · Won: [N] Lost: [N] Pending: [N]
| Pair | Dir | Outcome | Entry Hit | TP Hit |
|------|-----|---------|-----------|--------|
[one row per signal in this session]

Brief 1–2 sentence narrative on what drove outcomes in this session.

---

#### ANALYST NOTES
3–5 sentences covering: overall win rate quality, which pairs/sessions performed best, any patterns in losses, and one concrete improvement suggestion.`;

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

  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY not set" }), { status: 500 });
  }

  const db = await getSupabaseAdminClient();

  // Fetch ALL signals across every analysis run — no filter, no limit
  const { data: signals, error: signalsError } = await db
    .from("trading_signals")
    .select("id, session_id, session, pair, direction, entry_price, stop_loss, tp1, tp2, created_at, outcome")
    .order("created_at", { ascending: false });

  if (signalsError) {
    return new Response(JSON.stringify({ error: signalsError.message }), { status: 500 });
  }

  if (!signals || signals.length === 0) {
    return new Response(JSON.stringify({ error: "No signals found — run an analysis and save signals first." }), { status: 404 });
  }

  // Fetch OHLCV for each unique pair in parallel
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

  // Evaluate every signal from scratch using live price data
  const evals = (signals as SignalRow[]).map(sig =>
    evaluateSignal(sig, ohlcvMap.get(sig.pair) ?? [])
  );

  // Update DB outcome for any signal now resolved (win or loss confirmed)
  const resolved = evals.filter(e => e.outcome === "won_tp1" || e.outcome === "won_tp2" || e.outcome === "lost");
  if (resolved.length > 0) {
    await Promise.all(
      resolved.map(e =>
        db.from("trading_signals").update({
          outcome: e.outcome === "lost" ? "lost" : "won",
          outcome_pnl: e.rMultiple,
        }).eq("id", e.id)
      )
    );
  }

  // Aggregate counts across all signals
  const counts = {
    won:     evals.filter(e => e.outcome === "won_tp1" || e.outcome === "won_tp2").length,
    lost:    evals.filter(e => e.outcome === "lost").length,
    pending: evals.filter(e => e.outcome === "pending_active" || e.outcome === "pending_never_entered").length,
    skipped: evals.filter(e => e.outcome === "skipped").length,
  };

  const winRate = counts.won + counts.lost > 0
    ? Math.round((counts.won / (counts.won + counts.lost)) * 100)
    : null;

  // Group evals by session_id so the AI can narrate per analysis run
  const sessionOrder: string[] = [];
  const sessionMap = new Map<string, { session: string | null; date: string; results: Array<{ sig: SignalRow; ev: EvalResult }> }>();

  (signals as SignalRow[]).forEach((sig, i) => {
    const key = sig.session_id ?? sig.created_at.slice(0, 10);
    if (!sessionMap.has(key)) {
      sessionOrder.push(key);
      sessionMap.set(key, { session: sig.session, date: sig.created_at.slice(0, 10), results: [] });
    }
    sessionMap.get(key)!.results.push({ sig, ev: evals[i] });
  });

  const sessionBlocks = sessionOrder.map(key => {
    const grp = sessionMap.get(key)!;
    const gWon     = grp.results.filter(r => r.ev.outcome === "won_tp1" || r.ev.outcome === "won_tp2").length;
    const gLost    = grp.results.filter(r => r.ev.outcome === "lost").length;
    const gPending = grp.results.filter(r => r.ev.outcome === "pending_active" || r.ev.outcome === "pending_never_entered").length;

    const rows = grp.results.map(({ ev }) =>
      `  ${ev.pair} ${ev.direction}: [${ev.outcome.replace(/_/g, " ").toUpperCase()}] ` +
      `Entry ${ev.entryStr} | SL ${ev.slStr} | TP1 ${ev.tp1Str} | TP2 ${ev.tp2Str} | ` +
      `Triggered: ${ev.entryDate ?? "no"} | Resolved: ${ev.outcomeDate ?? "pending"} | ` +
      `Path: ${ev.priceNarrative}`
    ).join("\n");

    return `**${grp.session ?? "Unknown"} Session — ${grp.date}** · Won: ${gWon} Lost: ${gLost} Pending: ${gPending}\n${rows}`;
  }).join("\n\n---\n\n");

  const reviewDate = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const userMessage = `Write the Eleusis FX trade review report covering ALL signals across ALL analysis runs.

**Review Date:** ${reviewDate}
**Total Signals:** ${evals.length} across ${sessionOrder.length} analysis session(s)
**Overall Results:** Won: ${counts.won} · Lost: ${counts.lost} · Pending: ${counts.pending} · Skipped: ${counts.skipped}${winRate !== null ? ` · Win Rate: ${winRate}%` : ""}

---

${sessionBlocks}

---

Use the programmatic evaluations above as your source of truth. Structure the report by session. Open with the overall win rate and key stats, then review each session's signals, then close with analyst notes on overall performance and patterns.`;

  // Stream via OpenRouter
  const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://eleusisfx.com",
      "X-Title": "Eleusis FX Trade Review",
    },
  });

  const encoder = new TextEncoder();
  const chunks: string[] = [];

  // gpt-oss-120b:free / deepseek-r1:free were retired from OpenRouter's free
  // tier (now 404). These are currently-free instruction models; the loop
  // falls through on 404/429 so one busy model doesn't kill the review.
  const REVIEW_MODEL_CANDIDATES = [
    "openai/gpt-oss-20b:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
  ];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        type StreamChunk = { choices: Array<{ delta?: { content?: string | null } }> };
        let completion: AsyncIterable<StreamChunk> | undefined;
        let lastErr: unknown;
        for (const model of REVIEW_MODEL_CANDIDATES) {
          try {
            completion = await openrouter.chat.completions.create({
              model,
              max_tokens: 4096,
              messages: [
                { role: "system", content: REVIEW_SYSTEM_PROMPT },
                { role: "user", content: userMessage },
              ],
              stream: true,
            });
            break;
          } catch (err) {
            lastErr = err;
            console.warn(`[Trade Review] ${model} failed, trying next free model`, err);
          }
        }
        if (!completion) throw lastErr ?? new Error("All free models unavailable");

        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            chunks.push(text);
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();

        // Save completed review after response is sent
        const content = chunks.join("");
        after(async () => {
          try {
            await db.from("trade_reviews").insert({
              content,
              signals_reviewed: evals.length,
              won:     counts.won,
              lost:    counts.lost,
              pending: counts.pending,
              skipped: counts.skipped,
            });
          } catch (err) {
            console.error("[Trade Review] Failed to save to Supabase:", err);
          }
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
