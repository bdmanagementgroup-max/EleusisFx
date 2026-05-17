export const FOREX_PAIRS = [
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

export const CRYPTO_PAIRS = [
  { label: "BTC/USDT", yahoo: "BTC-USD" },
  { label: "ETH/USDT", yahoo: "ETH-USD" },
  { label: "SOL/USDT", yahoo: "SOL-USD" },
  { label: "XRP/USDT", yahoo: "XRP-USD" },
];

export const SYSTEM_PROMPT = `You are the Eleusis Fx trading analyst with 15+ years of professional experience. You think like a funded trader — disciplined, data-driven, never forcing setups.

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
- Stop Loss: structural level, sized using ATR (minimum 1.5× ATR from entry)
- TP1: minimum 2:1 R:R, TP2: minimum 3:1 R:R
- R:R stated explicitly
- Invalidation condition

## MANDATORY FILTERS (override confluence — if ANY filter fails, do NOT signal)

### 1. Momentum Confirmation Rule
NEVER signal a LONG when:
- RSI 5-day change is negative (RSI declining = fading bullish momentum)
- MACD histogram is contracting (momentum weakening)
- Last candle closed in the lower 30% of its range (sellers in control)

NEVER signal a SHORT when:
- RSI 5-day change is positive (RSI rising = fading bearish momentum)
- MACD histogram is expanding (bullish momentum growing)
- Last candle closed in the upper 30% of its range (buyers in control)

If momentum conflicts with structure, SKIP the pair — state the specific conflict.

### 2. ATR-Based Stop Sizing (Hard Rule)
- Stop loss MUST be minimum 1.5× ATR(14) from entry price
- If the structural level is tighter than 1.5× ATR, widen the stop OR skip the trade
- State the ATR value and the multiple used: "ATR(14) = X. SL = 1.5× ATR = Y pips from entry."
- This is non-negotiable. Tight stops = getting stopped by noise.

### 3. Correlation Risk Cap
- If all qualifying signals point in the SAME USD direction (all longs on EUR/GBP/AUD/XAU = all bearish USD), flag explicitly
- Maximum 2 correlated positions per session
- If 3+ same-direction signals qualify, rank by conviction and output only the top 2
- State: "⚠️ Correlation warning: [N] signals are all [bearish/bullish] USD. Outputting top 2 only."

### 4. Entry Invalidation on Momentum Divergence
- For limit-order pullback entries: if price is approaching the entry zone with ACCELERATING counter-momentum (3+ consecutive closes moving against trade direction with expanding range), INVALIDATE
- State: "Entry valid only on controlled pullback. Cancel limit if price falls through zone with momentum."

### 5. No Extended-Price Entries
- Do NOT signal a LONG when price is above 80% of its 5-day range (already extended upward)
- Do NOT signal a SHORT when price is below 20% of its 5-day range (already extended downward)
- Ideal entries are in the 30-70% zone of the 5-day range

### 6. R:R Floor
- TP1 must deliver minimum 2:1 R:R. If structural levels don't support this, the trade does not qualify.
- TP2 must deliver minimum 3:1 R:R.
- Prioritize TP1 hit rate. TP2 is aspirational — TP1 is the win condition.

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
[For each pair with no signal, state which MANDATORY FILTER blocked it. Be specific:]
- "[PAIR]: [Filter name] — [specific data]. Example: GBPUSD: Momentum filter — RSI 5d Δ: -5.2 (declining), MACD hist contracting. Structure bullish but momentum says wait."
- "[PAIR]: [Filter name] — [specific data]."

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
- Tone: direct, credible, experienced. Not hype. Not retail noise.
- MANDATORY FILTERS are non-negotiable. If a filter blocks a trade, it is blocked. Do not override.
- Quality over quantity: 0 signals is better than 1 bad signal. 1 high-conviction signal is better than 3 mediocre ones.
- State ATR value and SL multiple for every signal card.
- If all signals are same-direction USD, cap at 2 and state correlation warning.`;

// ─── Indicator engine ────────────────────────────────────────────────────────

export function calcRSIArray(closes: number[], period = 14): number[] {
  const out: number[] = new Array(closes.length).fill(NaN);
  if (closes.length < period + 1) return out;
  const changes = closes.slice(1).map((c, i) => c - closes[i]);
  let ag = changes.slice(0, period).filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
  let al = changes.slice(0, period).filter(c => c < 0).reduce((a, b) => a + (-b), 0) / period;
  out[period] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  for (let i = period; i < changes.length; i++) {
    ag = (ag * (period - 1) + (changes[i] > 0 ? changes[i] : 0)) / period;
    al = (al * (period - 1) + (changes[i] < 0 ? -changes[i] : 0)) / period;
    out[i + 1] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  }
  return out;
}

export function calcMACDArray(closes: number[]): { hist: number[] } | null {
  const e12 = calcEMA(closes, 12);
  const e26 = calcEMA(closes, 26);
  const macdLine = closes.map((_, i) => (isNaN(e12[i]) || isNaN(e26[i]) ? NaN : e12[i] - e26[i]));
  const valid = macdLine.filter(v => !isNaN(v));
  if (valid.length < 9) return null;
  const sig = calcEMA(valid, 9);
  const hist = valid.map((m, i) => isNaN(sig[i]) ? NaN : m - sig[i]);
  return { hist };
}

export function calcEMA(values: number[], period: number): number[] {
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

export function calcRSI(closes: number[], period = 14): number {
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

export function calcATR(highs: number[], lows: number[], closes: number[], period = 14): number {
  if (highs.length < period + 1) return NaN;
  const trs: number[] = [];
  for (let i = 1; i < highs.length; i++) {
    trs.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
  }
  let val = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trs.length; i++) val = (val * (period - 1) + trs[i]) / period;
  return val;
}

export function calcMACD(closes: number[]): { macd: number; signal: number; hist: number } | null {
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

export interface OHLCV { open: number[]; high: number[]; low: number[]; close: number[] }

export async function fetchYahoo(symbol: string): Promise<OHLCV | null> {
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

export function dp(price: number): number {
  if (price < 1) return 5;
  if (price < 10) return 5;
  if (price < 500) return 3;
  if (price < 10000) return 2;
  return 0;
}

export function buildLine(label: string, data: OHLCV): string {
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

  // Momentum direction indicators
  const rsiArr = calcRSIArray(c);
  const rsiNow = rsiArr[n - 1];
  const rsi5ago = n >= 6 ? rsiArr[n - 6] : NaN;
  const rsiDelta = (!isNaN(rsiNow) && !isNaN(rsi5ago)) ? rsiNow - rsi5ago : NaN;
  const rsiDir = isNaN(rsiDelta) ? "n/a" : rsiDelta > 3 ? "rising" : rsiDelta < -3 ? "falling" : "flat";

  const macdArr = calcMACDArray(c);
  let histDir = "n/a";
  if (macdArr && macdArr.hist.length >= 2) {
    const hNow = macdArr.hist[macdArr.hist.length - 1];
    const hPrev = macdArr.hist[macdArr.hist.length - 2];
    if (!isNaN(hNow) && !isNaN(hPrev)) {
      histDir = Math.abs(hNow) > Math.abs(hPrev) && Math.sign(hNow) === Math.sign(hPrev) ? "expanding" : "contracting";
    }
  }

  // 5-day range position
  const recent5H = Math.max(...h.slice(-5));
  const recent5L = Math.min(...l.slice(-5));
  const range5 = recent5H - recent5L;
  const pricePos5d = range5 > 0 ? Math.round(((last - recent5L) / range5) * 100) : 50;

  // Candle body position (last bar)
  const lastHigh = h[n - 1]; const lastLow = l[n - 1];
  const candleRange = lastHigh - lastLow;
  const bodyPos = candleRange > 0 ? Math.round(((last - lastLow) / candleRange) * 100) : 50;
  const bodyLabel = bodyPos >= 70 ? "bullish body (close in upper 30%)" : bodyPos <= 30 ? "bearish body (close in lower 30%)" : "neutral body";

  return [
    `${label}: ${last.toFixed(d)} (${chg}) | D-High: ${h[n-1].toFixed(d)} D-Low: ${l[n-1].toFixed(d)}`,
    `  RSI(14): ${isNaN(rsiVal) ? "n/a" : rsiVal.toFixed(1)} | ATR(14): ${isNaN(atrVal) ? "n/a" : atrVal.toFixed(d)}`,
    `  EMA50: ${isNaN(e50l) ? "n/a" : e50l.toFixed(d)} (price ${vsE50}) | EMA200: ${isNaN(e200l) ? "n/a" : e200l.toFixed(d)} (price ${vsE200})`,
    `  MACD: ${macdVal ? macdVal.macd.toFixed(d) : "n/a"} | Signal: ${macdVal ? macdVal.signal.toFixed(d) : "n/a"} | Hist: ${macdVal ? macdVal.hist.toFixed(d) : "n/a"} (${macdBias})`,
    `  Momentum: RSI 5d Δ: ${isNaN(rsiDelta) ? "n/a" : (rsiDelta > 0 ? "+" : "") + rsiDelta.toFixed(1)} (${rsiDir}) | MACD hist ${histDir} | Price at ${pricePos5d}% of 5d range | Last candle: ${bodyLabel}`,
  ].join("\n");
}

export async function fetchMarketTA(pairs: Array<{ label: string; yahoo: string }>): Promise<string> {
  const lines = await Promise.all(pairs.map(async ({ label, yahoo }) => {
    const data = await fetchYahoo(yahoo);
    return data ? buildLine(label, data) : `${label}: unavailable`;
  }));
  return lines.join("\n\n");
}
