import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const FOREX_PAIRS = [
  { label: "EUR/USD", yahoo: "EURUSD=X" },
  { label: "GBP/USD", yahoo: "GBPUSD=X" },
  { label: "USD/JPY", yahoo: "USDJPY=X" },
  { label: "AUD/USD", yahoo: "AUDUSD=X" },
  { label: "GBP/JPY", yahoo: "GBPJPY=X" },
  { label: "USD/CAD", yahoo: "USDCAD=X" },
  { label: "NZD/USD", yahoo: "NZDUSD=X" },
  { label: "EUR/GBP", yahoo: "EURGBP=X" },
  { label: "USD/CHF", yahoo: "USDCHF=X" },
  { label: "EUR/JPY", yahoo: "EURJPY=X" },
  { label: "CAD/JPY", yahoo: "CADJPY=X" },
  { label: "AUD/NZD", yahoo: "AUDNZD=X" },
];

const CRYPTO_PAIRS = [
  { label: "BTC/USDT", yahoo: "BTC-USD" },
  { label: "ETH/USDT", yahoo: "ETH-USD" },
  { label: "SOL/USDT", yahoo: "SOL-USD" },
  { label: "XRP/USDT", yahoo: "XRP-USD" },
];

// ─── Indicator engine ────────────────────────────────────────────────────────

function calcEMA(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = new Array(values.length).fill(NaN);
  let prev: number | null = null;
  for (let i = 0; i < values.length; i++) {
    if (prev === null) {
      if (i === period - 1) {
        prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
        out[i] = prev;
      }
    } else {
      prev = values[i] * k + prev * (1 - k);
      out[i] = prev;
    }
  }
  return out;
}

function calcRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return NaN;
  const changes = closes.slice(1).map((c, i) => c - closes[i]);
  const gains = changes.map(c => (c > 0 ? c : 0));
  const losses = changes.map(c => (c < 0 ? -c : 0));
  let ag = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let al = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < changes.length; i++) {
    ag = (ag * (period - 1) + gains[i]) / period;
    al = (al * (period - 1) + losses[i]) / period;
  }
  return al === 0 ? 100 : 100 - 100 / (1 + ag / al);
}

function calcATR(highs: number[], lows: number[], closes: number[], period = 14): number {
  if (highs.length < period + 1) return NaN;
  const trs: number[] = [];
  for (let i = 1; i < highs.length; i++) {
    trs.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
  }
  let val = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trs.length; i++) val = (val * (period - 1) + trs[i]) / period;
  return val;
}

function calcMACD(closes: number[]): { macd: number; signal: number; hist: number } | null {
  const e12 = calcEMA(closes, 12);
  const e26 = calcEMA(closes, 26);
  const macdLine = closes.map((_, i) => (isNaN(e12[i]) || isNaN(e26[i]) ? NaN : e12[i] - e26[i]));
  const valid = macdLine.filter(v => !isNaN(v));
  if (valid.length < 9) return null;
  const sig = calcEMA(valid, 9);
  const m = valid[valid.length - 1];
  const s = sig[sig.length - 1];
  return { macd: m, signal: s, hist: m - s };
}

// ─── Yahoo Finance fetch ─────────────────────────────────────────────────────

interface OHLCV { open: number[]; high: number[]; low: number[]; close: number[] }

async function fetchYahoo(symbol: string): Promise<OHLCV | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1y`;
    const res = await fetch(url, { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const json = await res.json();
    const q = json?.chart?.result?.[0]?.indicators?.quote?.[0];
    if (!q) return null;
    const open: number[] = [], high: number[] = [], low: number[] = [], close: number[] = [];
    for (let i = 0; i < (q.close ?? []).length; i++) {
      if (q.close[i] != null && q.open[i] != null && q.high[i] != null && q.low[i] != null) {
        open.push(q.open[i]); high.push(q.high[i]); low.push(q.low[i]); close.push(q.close[i]);
      }
    }
    return open.length >= 50 ? { open, high, low, close } : null;
  } catch { return null; }
}

function dp(price: number): number {
  if (price < 1) return 5;
  if (price < 10) return 5;
  if (price < 500) return 3;
  if (price < 10000) return 2;
  return 0;
}

function buildLine(label: string, data: OHLCV): string {
  const c = data.close; const h = data.high; const l = data.low;
  const n = c.length;
  const last = c[n - 1]; const prev = c[n - 2];
  const d = dp(last);
  const pct = ((last - prev) / prev * 100);
  const chg = `${pct >= 0 ? "+" : ""}${pct.toFixed(3)}%`;

  const e50 = calcEMA(c, 50); const e200 = calcEMA(c, 200);
  const rsiVal = calcRSI(c); const atrVal = calcATR(h, l, c); const macdVal = calcMACD(c);

  const e50l = e50[n - 1]; const e200l = e200[n - 1];
  const vsE50  = !isNaN(e50l)  ? (last > e50l  ? "above" : "below") : "n/a";
  const vsE200 = !isNaN(e200l) ? (last > e200l ? "above" : "below") : "n/a";
  const macdBias = macdVal ? (macdVal.hist > 0 ? "bullish" : "bearish") : "n/a";

  return [
    `${label}: ${last.toFixed(d)} (${chg}) | D-High: ${h[n-1].toFixed(d)} D-Low: ${l[n-1].toFixed(d)}`,
    `  RSI(14): ${isNaN(rsiVal) ? "n/a" : rsiVal.toFixed(1)} | ATR(14): ${isNaN(atrVal) ? "n/a" : atrVal.toFixed(d)}`,
    `  EMA50: ${isNaN(e50l) ? "n/a" : e50l.toFixed(d)} (price ${vsE50}) | EMA200: ${isNaN(e200l) ? "n/a" : e200l.toFixed(d)} (price ${vsE200})`,
    `  MACD: ${macdVal ? macdVal.macd.toFixed(d) : "n/a"} | Signal: ${macdVal ? macdVal.signal.toFixed(d) : "n/a"} | Hist: ${macdVal ? macdVal.hist.toFixed(d) : "n/a"} (${macdBias})`,
  ].join("\n");
}

async function fetchMarketTA(pairs: Array<{ label: string; yahoo: string }>): Promise<string> {
  const lines = await Promise.all(pairs.map(async ({ label, yahoo }) => {
    const data = await fetchYahoo(yahoo);
    return data ? buildLine(label, data) : `${label}: unavailable`;
  }));
  return lines.join("\n\n");
}

// ─── System prompt (unchanged) ───────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Eleusis Fx trading analyst with 15+ years of professional experience. You think like a funded trader — disciplined, data-driven, never forcing setups.

You will receive live market data including price, RSI(14), EMA(50), EMA(200), MACD(12,26,9), and ATR(14) calculated from Yahoo Finance daily OHLCV data, for both forex and crypto. Use this data as your primary technical foundation.

## DXY Analysis (derive yourself)
Do not rely on a DXY input. Determine USD strength/weakness yourself by reading the USD-correlated pairs in the data:
- USD/JPY, USD/CAD, USD/CHF trending up → strong dollar
- EUR/USD, GBP/USD, AUD/USD, NZD/USD trending up → weak dollar
- State your DXY read clearly in the macro overview with your reasoning.

## Analytical Framework

### Multi-Timeframe Approach
1. Use the daily indicator data provided as your higher-timeframe context (trend, structure, momentum)
2. Extrapolate intraday context (4H/1H) from the daily data + session context provided
3. Never trade against the daily trend unless reversal confluence is extremely strong

### Confluence Requirement — Minimum 3 Signals
Only report a pair when 3+ INDEPENDENT signal categories align. Use the provided data:

| Category | How to apply the data |
|---|---|
| Trend structure | Price vs EMA50/200 — above both = bullish structure |
| Moving averages | EMA50 vs EMA200 position, price relative to both |
| Momentum | RSI level (>60 bullish, <40 bearish, >70 OB, <30 OS), MACD histogram direction |
| Price action | Daily high/low range vs ATR — is price at range extreme? Near key level? |
| Key levels | Round numbers, recent daily H/L as S/R |
| Volatility | ATR for SL sizing — low ATR = tight range, high ATR = trending |

For each qualifying pair:
- Entry: specific price or condition
- Stop Loss: structural level, sized using ATR context (e.g. "1× ATR below swing low")
- TP1: 1:2 R:R minimum, TP2: 1:3–4
- R:R stated explicitly
- Invalidation condition

## Output Format — EXACTLY this structure:

---
### ELEUSIS FX — MARKET ANALYSIS REPORT
**Date:** [date]
**Session:** [session]
**Analyst:** Eleusis Fx Trading Desk

#### MACRO OVERVIEW
[3–4 sentences. State your DXY read with reasoning from the data. Session context. Crypto sentiment. Be direct and specific — reference actual levels.]

---

#### [PAIR] — [BUY / SELL] SIGNAL ✅

**Timeframe:** Daily → [session timeframe]
**Bias:** [Bullish / Bearish]
**Confluence signals:**
- [Signal 1 — category: specific data point, e.g. "Trend: price above EMA50 (1.0823) and EMA200 (1.0756) — bullish structure"]
- [Signal 2 — category: specific data point]
- [Signal 3 — category: specific data point]

**Setup detail:**
[1 paragraph. What the data is showing, where price is relative to key levels, what the trigger is, why the R:R is justified. Professional, specific — reference the actual indicator values.]

**Trade levels:**
- Entry: [price or condition]
- Stop Loss: [price] — [reason, e.g. "below EMA50 + 1× ATR buffer"]
- TP1: [price] — [R:R]
- TP2: [price] — [R:R]

**Risk/Reward:** [X:1]
**Invalidation:** [specific price/condition]

---

[Repeat for each qualifying pair]

---

#### PAIRS REVIEWED BUT NO SIGNAL
[List pairs checked, one line each — include specific reason using the data, e.g. "AUDUSD: RSI 52 — no clear momentum bias, EMA50/200 converging"]

---
### INSTAGRAM CAPTIONS

**[PAIR] [BUY/SELL] 📊 [punchy hook line]**

[3–5 lines. Trader talking to traders. Direct, confident. Name the exact level. Reference the key indicator. No filler. 2–4 emojis max.]

🎯 Entry: [price]
🛑 SL: [price]
💰 TP: [price]

⚠️ Not financial advice. Trade your own plan.

#EleusisFx #ForexSignals #PropFirm #[PAIR] #TradingSetup #FundedTrader

---

## Rules
- Never manufacture signals. If nothing qualifies: "No qualifying setups today — [specific reason from data]."
- Always reference actual indicator values when citing signals.
- Derive DXY direction from the data — do not assume it.
- The Instagram caption must stand alone without the full report.
- Tone: direct, credible, experienced. Not hype. Not retail noise.`;

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not set — add it to Vercel environment variables and redeploy" }),
      { status: 500 }
    );
  }

  const { session, focus, newsLevel } = await req.json();

  const forexPairs = focus === "crypto" ? [] : FOREX_PAIRS;
  const cryptoPairs = focus === "forex" ? [] : CRYPTO_PAIRS;

  const [forexData, cryptoData] = await Promise.all([
    forexPairs.length > 0 ? fetchMarketTA(forexPairs) : Promise.resolve("Forex skipped."),
    cryptoPairs.length > 0 ? fetchMarketTA(cryptoPairs) : Promise.resolve("Crypto skipped."),
  ]);

  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const newsCtx =
    newsLevel === "major" ? "⚠️ MAJOR HIGH-IMPACT NEWS DUE TODAY (NFP/FOMC/CPI) — flag risk on correlated pairs or avoid."
    : newsLevel === "light" ? "Minor news scheduled today. Flag pairs with correlated data risk."
    : "No major news events today. Clean technical environment.";

  const focusCtx =
    focus === "forex" ? "Scan FOREX pairs only."
    : focus === "crypto" ? "Scan CRYPTO pairs only."
    : "Scan both FOREX and CRYPTO.";

  const userMessage = `Run the Eleusis Fx market analysis.

**Date:** ${dateStr}
**Session:** ${session}
**Market Focus:** ${focusCtx}
**News Environment:** ${newsCtx}

---
**LIVE TECHNICAL DATA (Yahoo Finance — Daily OHLCV, indicators calculated server-side):**

${forexPairs.length > 0 ? `FOREX:\n${forexData}` : ""}

${cryptoPairs.length > 0 ? `CRYPTO:\n${cryptoData}` : ""}

---

Use the indicator values above as your primary analysis foundation. Derive DXY bias yourself from the USD pairs. Apply the full confluence framework. Only report pairs with genuine 3+ signal alignment.`;

  const anthropic = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const msgStream = anthropic.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        });
        for await (const event of msgStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Analysis failed";
        controller.enqueue(encoder.encode(`\n\n[ERROR] ${msg}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
