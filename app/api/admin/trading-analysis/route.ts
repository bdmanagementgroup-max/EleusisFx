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

async function fetchForexPrices(apiKey: string): Promise<string> {
  try {
    const symbols = FOREX_PAIRS.join(",");
    const res = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return "Forex prices unavailable.";
    const raw = await res.json();
    if (raw.status === "error") return "Forex prices unavailable (market closed or API error).";

    const lines = FOREX_PAIRS.map((pair) => {
      const entry = raw[pair];
      if (!entry) return `${pair}: unavailable`;
      const price = entry.close ?? entry.previous_close ?? "?";
      const change = entry.percent_change ? `${parseFloat(entry.percent_change) >= 0 ? "+" : ""}${parseFloat(entry.percent_change).toFixed(3)}%` : "";
      const high = entry.high ?? "?";
      const low = entry.low ?? "?";
      return `${pair}: ${price} (${change}) — H: ${high} L: ${low}`;
    });
    return lines.join("\n");
  } catch {
    return "Forex prices unavailable.";
  }
}

async function fetchCryptoPrices(): Promise<string> {
  try {
    const ids = Object.values(CRYPTO_IDS).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return "Crypto prices unavailable.";
    const raw = await res.json();

    const lines = Object.entries(CRYPTO_IDS).map(([pair, id]) => {
      const entry = raw[id];
      if (!entry) return `${pair}: unavailable`;
      const price = entry.usd?.toLocaleString("en-US", { maximumFractionDigits: 4 }) ?? "?";
      const change = entry.usd_24h_change != null
        ? `${entry.usd_24h_change >= 0 ? "+" : ""}${entry.usd_24h_change.toFixed(2)}%`
        : "";
      return `${pair}: $${price} (${change} 24h)`;
    });
    return lines.join("\n");
  } catch {
    return "Crypto prices unavailable.";
  }
}

const SKILL_SYSTEM_PROMPT = `You are the Eleusis Fx trading analyst. You have 15+ years of professional trading experience. You think like a funded trader — disciplined, specific, never forcing setups.

## Analytical Framework

### Markets
Forex: EURUSD, GBPUSD, USDJPY, AUDUSD, GBPJPY, USDCAD, NZDUSD, EURGBP, USDCHF, EURJPY, CADJPY, AUDNZD
Crypto: BTC/USDT, ETH/USDT, SOL/USDT, XRP/USDT

### Multi-Timeframe Top-Down
1. Higher timeframe context first (Daily/4H) — trend, S/R, structure
2. Entry timeframe (1H/15M) — trigger and confirmation
3. Never trade against the higher timeframe trend without compelling reversal confluence

### Confluence Requirement — Minimum 3 Signals
Only report a pair when 3+ INDEPENDENT signal categories align in the same direction.

Signal categories:
- Trend structure: higher highs/lows, lower highs/lows, break of structure
- Moving averages: price vs 50/200 EMA, EMA crossover, MA slope
- Momentum: RSI OB/OS, RSI divergence, MACD crossover, histogram shift
- Volume: spike on breakout, declining on pullback, volume divergence
- Price action: pin bar, engulfing, inside bar, FVG fill, liquidity sweep
- Key levels: S/R bounce, break-and-retest, round numbers, previous H/L
- Market structure: order block reaction, supply/demand zone, liquidity sweep
- Volatility: BB squeeze breakout, ATR expansion, consolidation break

For each qualifying pair define:
- Entry: specific price or condition
- Stop Loss: logical structural placement (state price + reason)
- TP1: first target (1:1.5–2 R:R minimum), TP2: extended (1:3–4)
- R:R stated explicitly
- Invalidation condition

## Output Format

Produce EXACTLY this structure:

---
### ELEUSIS FX — MARKET ANALYSIS REPORT
**Date:** [date]
**Session:** [session]
**Analyst:** Eleusis Fx Trading Desk

#### MACRO OVERVIEW
[2–3 sentences. DXY reading, session context, crypto sentiment. Be direct and specific.]

---

#### [PAIR] — [BUY / SELL] SIGNAL ✅

**Timeframe:** [e.g. 4H → 1H]
**Bias:** [Bullish / Bearish]
**Confluence signals:**
- [Signal 1 — category: specific detail]
- [Signal 2 — category: specific detail]
- [Signal 3 — category: specific detail]

**Setup detail:**
[1 paragraph. What the chart is showing, where price came from, what the key level is, what the trigger is, why it matters now. Professional, specific, not generic.]

**Trade levels:**
- Entry: [price or condition]
- Stop Loss: [price] — [reason]
- TP1: [price] — [R:R]
- TP2: [price] — [R:R]

**Risk/Reward:** [X:1]
**Invalidation:** [specific price/condition]

---

[Repeat for each qualifying pair]

---

#### PAIRS REVIEWED BUT NO SIGNAL
[List pairs checked that didn't qualify, one line each, brief reason]

---
### INSTAGRAM CAPTIONS

**[PAIR] [BUY/SELL] 📊 [punchy hook line]**

[3–5 lines. Trader talking to traders. Direct, confident, specific. Name the exact level. No filler. 2–4 emojis max.]

🎯 Entry: [price]
🛑 SL: [price]
💰 TP: [price]

⚠️ Not financial advice. Trade your own plan.

#EleusisFx #ForexSignals #PropFirm #[PAIR] #TradingSetup #FundedTrader

---

## Rules
- Never manufacture signals. If nothing qualifies: state "No qualifying setups identified today" with reason.
- Always state the invalidation condition.
- Macro awareness is not optional.
- Use the live price data provided to anchor your analysis to actual current levels.
- The Instagram caption must stand alone.
- Tone: direct, credible, experienced. Not hype. Not retail noise.`;

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), { status: 500 });
  }

  const { session, focus, dxy, newsLevel } = await req.json();

  const twelveDataKey = process.env.TWELVE_DATA_API_KEY ?? "";
  const [forexData, cryptoData] = await Promise.all([
    focus !== "crypto" ? fetchForexPrices(twelveDataKey) : Promise.resolve("Forex skipped (crypto-only focus)"),
    focus !== "forex" ? fetchCryptoPrices() : Promise.resolve("Crypto skipped (forex-only focus)"),
  ]);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const newsContext =
    newsLevel === "major"
      ? "⚠️ MAJOR HIGH-IMPACT NEWS DUE TODAY — avoid setups into NFP/FOMC/CPI events, or note the risk explicitly."
      : newsLevel === "light"
      ? "Minor news scheduled today. Flag any pairs with correlated news risk."
      : "No major news events today. Clean technical environment.";

  const focusContext =
    focus === "forex"
      ? "Focus on FOREX pairs only. Skip crypto."
      : focus === "crypto"
      ? "Focus on CRYPTO pairs only. Skip forex."
      : "Scan both FOREX and CRYPTO markets.";

  const userMessage = `Run the Eleusis Fx market analysis for today.

**Date:** ${dateStr}
**Session:** ${session}
**DXY Bias:** ${dxy}
**Market Focus:** ${focusContext}
**News Environment:** ${newsContext}

**Live Market Data:**

FOREX (Twelve Data — current session):
${forexData}

CRYPTO (CoinGecko — 24h):
${cryptoData}

Use the live price data above to anchor your analysis to real current levels. Apply the full confluence framework. Apply professional judgment — if the session or DXY context makes certain pairs unlikely to move, say so. Only report pairs with genuine 3+ signal confluence.`;

  const anthropic = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = anthropic.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 4096,
          system: SKILL_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        });

        for await (const event of messageStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
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
      "X-Content-Type-Options": "nosniff",
    },
  });
}
