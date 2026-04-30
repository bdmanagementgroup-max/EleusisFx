import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const FOREX_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "GBP/JPY",
  "USD/CAD", "NZD/USD", "EUR/GBP", "USD/CHF", "EUR/JPY",
  "CAD/JPY", "AUD/NZD",
];

const CRYPTO_IDS: Record<string, string> = {
  "BTC/USDT": "bitcoin",
  "ETH/USDT": "ethereum",
  "SOL/USDT": "solana",
  "XRP/USDT": "ripple",
};

type TwelveEntry = Record<string, { values?: Array<Record<string, string>>; status?: string }>;

async function td<T>(path: string, apiKey: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.twelvedata.com${path}&apikey=${apiKey}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.status === "error") return null;
    return json as T;
  } catch {
    return null;
  }
}

function latestValue(entry: TwelveEntry[string] | undefined, field: string): string {
  return entry?.values?.[0]?.[field] ?? "n/a";
}

async function fetchForexTA(apiKey: string, pairs: string[]): Promise<string> {
  const sym = pairs.join(",");

  const [quoteRaw, rsiRaw, ema50Raw, ema200Raw, macdRaw, atrRaw] = await Promise.all([
    td<Record<string, { close?: string; previous_close?: string; percent_change?: string; high?: string; low?: string; volume?: string }>>(`/quote?symbol=${encodeURIComponent(sym)}`, apiKey),
    td<TwelveEntry>(`/rsi?symbol=${encodeURIComponent(sym)}&interval=1day&time_period=14&outputsize=1`, apiKey),
    td<TwelveEntry>(`/ema?symbol=${encodeURIComponent(sym)}&interval=1day&time_period=50&outputsize=1`, apiKey),
    td<TwelveEntry>(`/ema?symbol=${encodeURIComponent(sym)}&interval=1day&time_period=200&outputsize=1`, apiKey),
    td<TwelveEntry>(`/macd?symbol=${encodeURIComponent(sym)}&interval=1day&fast_period=12&slow_period=26&signal_period=9&outputsize=1`, apiKey),
    td<TwelveEntry>(`/atr?symbol=${encodeURIComponent(sym)}&interval=1day&time_period=14&outputsize=1`, apiKey),
  ]);

  if (!quoteRaw) return "Forex data unavailable.";

  const lines = pairs.map((pair) => {
    const q = quoteRaw[pair];
    if (!q) return `${pair}: unavailable`;

    const price   = parseFloat(q.close ?? q.previous_close ?? "0");
    const change  = q.percent_change ? `${parseFloat(q.percent_change) >= 0 ? "+" : ""}${parseFloat(q.percent_change).toFixed(3)}%` : "n/a";
    const high    = q.high ?? "n/a";
    const low     = q.low ?? "n/a";
    const rsi     = rsiRaw   ? parseFloat(latestValue(rsiRaw[pair],   "rsi")).toFixed(1)   : "n/a";
    const ema50   = ema50Raw ? parseFloat(latestValue(ema50Raw[pair],  "ema")).toFixed(5)   : "n/a";
    const ema200  = ema200Raw? parseFloat(latestValue(ema200Raw[pair], "ema")).toFixed(5)   : "n/a";
    const macdVal = macdRaw  ? parseFloat(latestValue(macdRaw[pair],   "macd")).toFixed(5)  : "n/a";
    const macdSig = macdRaw  ? parseFloat(latestValue(macdRaw[pair],   "macd_signal")).toFixed(5) : "n/a";
    const macdHist= macdRaw  ? parseFloat(latestValue(macdRaw[pair],   "macd_hist")).toFixed(5)   : "n/a";
    const atr     = atrRaw   ? parseFloat(latestValue(atrRaw[pair],    "atr")).toFixed(5)   : "n/a";

    const priceAbove50  = price && ema50  !== "n/a" ? (price > parseFloat(ema50)  ? "above" : "below") : "n/a";
    const priceAbove200 = price && ema200 !== "n/a" ? (price > parseFloat(ema200) ? "above" : "below") : "n/a";
    const macdBias = macdHist !== "n/a" ? (parseFloat(macdHist) > 0 ? "bullish" : "bearish") : "n/a";

    return [
      `${pair}: ${price.toFixed(5)} (${change}) | D-High: ${high} D-Low: ${low}`,
      `  RSI(14): ${rsi} | ATR(14): ${atr}`,
      `  EMA50: ${ema50} (price ${priceAbove50}) | EMA200: ${ema200} (price ${priceAbove200})`,
      `  MACD: ${macdVal} | Signal: ${macdSig} | Hist: ${macdHist} (${macdBias})`,
    ].join("\n");
  });

  return lines.join("\n\n");
}

async function fetchCryptoTA(): Promise<string> {
  try {
    const ids = Object.values(CRYPTO_IDS).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_7d_change=true&include_market_cap=true`,
      { cache: "no-store" }
    );
    if (!res.ok) return "Crypto data unavailable.";
    const raw = await res.json();

    const lines = Object.entries(CRYPTO_IDS).map(([pair, id]) => {
      const e = raw[id];
      if (!e) return `${pair}: unavailable`;
      const price   = e.usd?.toLocaleString("en-US", { maximumFractionDigits: 4 }) ?? "?";
      const chg24   = e.usd_24h_change != null ? `${e.usd_24h_change >= 0 ? "+" : ""}${e.usd_24h_change.toFixed(2)}%` : "n/a";
      const chg7    = e.usd_7d_change  != null ? `${e.usd_7d_change  >= 0 ? "+" : ""}${e.usd_7d_change.toFixed(2)}%`  : "n/a";
      const vol24   = e.usd_24h_vol    != null ? `$${(e.usd_24h_vol / 1e9).toFixed(2)}B`  : "n/a";
      const mcap    = e.usd_market_cap != null ? `$${(e.usd_market_cap / 1e9).toFixed(1)}B` : "n/a";
      const trend   = e.usd_7d_change  != null ? (e.usd_7d_change > 2 ? "bullish weekly trend" : e.usd_7d_change < -2 ? "bearish weekly trend" : "ranging/neutral") : "n/a";
      return `${pair}: $${price} | 24h: ${chg24} | 7d: ${chg7} (${trend})\n  Vol 24h: ${vol24} | MCap: ${mcap}`;
    });
    return lines.join("\n\n");
  } catch {
    return "Crypto data unavailable.";
  }
}

const SYSTEM_PROMPT = `You are the Eleusis Fx trading analyst with 15+ years of professional experience. You think like a funded trader — disciplined, data-driven, never forcing setups.

You will receive live market data including price, RSI(14), EMA(50), EMA(200), MACD(12,26,9), and ATR(14) from Twelve Data, plus CoinGecko crypto data. Use this data as your primary technical foundation.

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

  const twelveDataKey = process.env.TWELVE_DATA_API_KEY ?? "";
  const forexPairs = focus === "crypto" ? [] : FOREX_PAIRS;

  const [forexData, cryptoData] = await Promise.all([
    forexPairs.length > 0 ? fetchForexTA(twelveDataKey, forexPairs) : Promise.resolve("Forex skipped."),
    focus !== "forex" ? fetchCryptoTA() : Promise.resolve("Crypto skipped."),
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
**LIVE TECHNICAL DATA (Twelve Data — Daily timeframe):**

${forexPairs.length > 0 ? `FOREX:\n${forexData}` : ""}

${focus !== "forex" ? `CRYPTO (CoinGecko):\n${cryptoData}` : ""}

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
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
