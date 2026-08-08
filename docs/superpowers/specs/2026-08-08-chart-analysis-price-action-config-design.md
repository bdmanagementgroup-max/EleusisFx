# Chart Analysis — Price Action Config (Config 2) Design

## Background

The TradingView Chart Analysis Agent (`/admin/tools/chart-analysis`) currently
runs one pipeline: it renders a TradingView Advanced Chart embed with
EMA20/50/200, RSI(14), MACD(12,26,9), and Volume, screenshots it, and has an
LLM vision model produce a structured `ChartCaption` for social posting. This
is now working end-to-end and is referred to below as **Config 1
("Indicators")**.

The indicator toolset is limited and the chart's visual style (TradingView's
default dark theme colors) isn't adjustable. This design adds a second,
independent analysis pipeline — **Config 2 ("Price Action")** — using
trendlines, Fibonacci retracement, key support/resistance levels, a
long/short entry-stop-target box, and volume analysis, rendered with fully
custom colors. A config selector on the same admin dashboard page toggles
between the two. Config 1 is not modified in any way.

Analyses are for social media content only — nothing here is used to place
real trades.

## Goals

- Add a second chart-analysis "config" with a genuinely different toolset
  (price action / structure, not indicators) and a distinct visual style.
- Let the admin toggle between configs from the existing chart-analysis
  dashboard page, per-run.
- Give full control over chart colors for the new config (bullish = blue
  `#4f8ef7`, bearish = white `#e8ecf5`, dark `#08090f` background), since the
  TradingView embed widget doesn't allow this.
- Keep both configs sharing the same instrument list, timeframe options, DB
  table, and history UI — only the render/analysis pipeline branches.

## Non-goals

- No changes to Config 1's chart rendering, indicators, prompt, or colors.
- No real trade execution or trade tracking — outputs are social captions only.
- No user-configurable color picker UI in this phase — colors are hardcoded
  per config.
- No drawing via an authenticated TradingView account / UI automation —
  ruled out as the fragile approach Config 1 already moved away from.

## Architecture Overview

```
Admin picks config (Indicators | Price Action) + instrument + timeframes
                │
                ▼
   POST /api/admin/chart-analysis { ..., config }
                │
                ▼
        runChartAnalysisJob(input)
                │
      ┌─────────┴─────────┐
      ▼                   ▼
Config 1 pipeline    Config 2 pipeline
(unchanged)          (new)
      │                   │
      │           lib/chart-analysis/price-action.ts
      │           (swings, key levels, trendline,
      │            fib retracement, long/short box,
      │            relative volume — computed from
      │            the same Yahoo OHLCV fetch)
      │                   │
      │           app/chart-preview-pa/ (new route)
      │           Lightweight Charts render:
      │           candles + volume + drawn
      │           trendline/fib/S-R/box, custom colors
      │                   │
      │           puppeteer screenshot (same pattern
      │           as existing browser.ts)
      │                   │
      │           LLM vision call with a price-action
      │           system prompt — describes the
      │           already-computed setup
      └─────────┬─────────┘
                ▼
        completeChartAnalysis(jobId, image, caption, metadata)
        (chart_analyses row, now with `config` column)
```

## Data Model Changes

**`chart_analyses` table** — add one column via migration:

```sql
ALTER TABLE chart_analyses
  ADD COLUMN config text NOT NULL DEFAULT 'indicators'
  CHECK (config IN ('indicators', 'price_action'));
```

Existing rows default to `'indicators'` (Config 1), preserving history.

**`ChartAnalysisJobInput`** (`lib/chart-analysis/types.ts`) gains:

```ts
config: 'indicators' | 'price_action';
```

**`ChartAnalysisRecord`** gains the same `config` field, returned from
storage and shown in the admin UI.

**`ChartAnalysisMetadata.indicators_used`** for Config 2 runs will read
`['Trendline', 'FibRetracement', 'KeyLevels', 'LongShortBox', 'Volume']`
instead of the EMA/RSI/MACD list, so the history view's metadata is honest
about what actually ran.

## Component: `lib/chart-analysis/price-action.ts` (new)

Pure functions operating on the `OHLCV` already fetched by
`fetchMarketDataForTimeframes` (no new data source — same Yahoo Finance
call). Exports one entry point:

```ts
export interface PriceActionSetup {
  trend: 'up' | 'down' | 'sideways';
  swingHighs: { index: number; price: number }[];
  swingLows: { index: number; price: number }[];
  keyLevels: { support: number[]; resistance: number[] };
  trendline: { x1: number; y1: number; x2: number; y2: number } | null;
  fibRetracement: { level: number; price: number }[] | null;
  longShortBox: {
    direction: 'long' | 'short';
    entry: number;
    stopLoss: number;
    takeProfit: number;
    ratio: number;
  } | null;
  relativeVolume: { index: number; ratio: number }[]; // volume / rolling avg
}

export function computePriceActionSetup(ohlcv: OHLCV): PriceActionSetup;
```

Algorithm, in order:

1. **Swing detection** — fractal method: bar `i` is a swing high if
   `high[i]` is the max within `[i-2, i+2]`; symmetric for swing lows.
   Applied over the full fetched range (matches existing per-timeframe
   lookback: 6mo/1y/2y depending on timeframe).
2. **Trend bias** — linear regression slope of `close` over the most recent
   ~50 bars. Positive slope → `up`, negative → `down`, near-zero → `sideways`.
3. **Key levels** — cluster swing highs/lows within a 0.1% price tolerance;
   rank clusters by (touch count, recency); keep top 3 above current price as
   resistance, top 3 below as support.
4. **Trendline** — for an `up` bias, fit a line through the two most recent
   swing lows; for `down`, through the two most recent swing highs;
   `sideways` → `null` (nothing drawn).
5. **Fib retracement** — find the single largest-range swing leg (low→high or
   high→low) within the lookback; compute standard levels
   (0, 23.6, 38.2, 50, 61.8, 78.6, 100).
6. **Long/short box** — only computed when `trend !== 'sideways'`:
   - `direction`: `long` for `up` trend, `short` for `down`.
   - `entry`: current price (last close).
   - `stopLoss`: nearest invalidation swing point (the swing low below entry
     for long / swing high above for short), buffered by `0.25 × ATR(14)`.
     ATR is used here purely as a volatility-sized buffer, not displayed or
     reported as an "indicator" — it never appears in the chart or the
     `indicators_used` metadata.
   - `takeProfit`: nearest key level or fib confluence beyond entry in the
     trade direction; if none clears the ratio floor, fall back to
     `entry ± 3 × (entry − stopLoss)`.
   - `ratio`: enforced ≥ 2:1, matching Config 1's existing R:R floor
     methodology (reused, not reinvented).
   - `sideways` trend → `longShortBox: null`; the renderer draws no box and
     the prompt tells the LLM no setup qualifies today (it should say so
     plainly rather than force a call).
7. **Relative volume** — for each bar, `volume / rolling 20-bar average
   volume`; bars ≥ 1.5× flagged, drawn as a taller/brighter histogram bar.

This module is pure and independently testable — given a fixed `OHLCV`
fixture it should produce deterministic output, which the implementation
plan should cover with unit tests (no network, no browser).

## Component: `app/chart-preview-pa/` (new route)

Sibling to the existing `app/chart-preview/` route, following the same
"headless-only, no auth guard" pattern (see `app/chart-preview/page.tsx`'s
existing comment — this page only exists to be screenshotted).

- Accepts OHLCV + the computed `PriceActionSetup` via query params (JSON,
  same encoding approach as the existing `studies` param) rather than
  re-fetching data client-side — the server already has it from the
  orchestrator step that ran `computePriceActionSetup`.
- Renders with **`lightweight-charts`** (new dependency, MIT-licensed,
  published by TradingView — candlestick series + volume histogram pane +
  primitives for the trendline, fib horizontal lines, S/R horizontal lines,
  and the long/short box).
- Color tokens (module-local constants, not user-configurable yet):
  - Background: `#08090f`
  - Bullish candle / up-trend elements: `#4f8ef7`
  - Bearish candle / down-trend elements: `#e8ecf5`
  - Fib retracement lines: muted purple `#c084fc` at reduced opacity
  - Key S/R lines: muted gray `rgba(210,220,240,0.35)`
  - Long box fill: `#4f8ef733` (blue, translucent); short box fill:
    `#e8ecf522` (white, translucent)
- Fixed viewport matching the existing screenshot size (1920×1600) so the
  puppeteer capture path in `browser.ts` needs only a new sibling function,
  not a rewrite.

## Component: `lib/chart-analysis/browser-price-action.ts` (new file)

A new file, not a branch inside `browser.ts` — the existing file's
`waitForChartData`/`isChartDataLoaded` legend-polling logic is specific to
the TradingView embed's cross-origin iframe and doesn't apply to a
self-rendered chart. It exports `launchBrowser` (renamed export, or moved to
a small shared `browser-common.ts`) so both files reuse the same puppeteer +
`@sparticuz/chromium` launch logic without duplication.

New function `generatePriceActionScreenshot(symbol, timeframe, setup)`
navigates to `/chart-preview-pa` instead of `/chart-preview`, waits for a
`data-chart-ready` attribute that `ChartPreviewWidget`'s price-action
counterpart sets once `lightweight-charts` finishes its initial render (its
own signal, not legend-text polling — this chart is self-rendered so the
ready state is unambiguous), then screenshots.

## Component: LLM prompt (new system prompt in `llm-analysis.ts`)

A second `SYSTEM_PROMPT_PRICE_ACTION` constant, selected by `config`.
Structurally same `ChartCaption` JSON output (no type changes needed), but:

- Describes the price-action toolset (trendline, fib retracement, key
  levels, long/short box, volume) instead of EMA/RSI/MACD.
- States plainly that the trendline/fib/key levels/long-short box are
  **already computed and drawn** — the model's job is to explain the visible
  setup, cite the actual numbers passed in `PriceActionSetup`, and never
  invent different levels than what's on the chart.
- `keyLevels`/`riskReward` in the resulting `ChartCaption` are populated from
  `PriceActionSetup` directly (not re-derived by the LLM) — the LLM only
  fills in the narrative/reasoning/hashtags/confidence fields. This removes
  the class of bug where the caption text disagrees with the image.
- When `longShortBox` is `null` (sideways market), the prompt instructs the
  model to state no qualifying setup exists rather than force a bias.

## Orchestrator changes (`lib/chart-analysis/orchestrator.ts`)

`runChartAnalysisPipeline` branches once on `input.config` right after
fetching market data:

```ts
if (input.config === 'price_action') {
  const setup = computePriceActionSetup(marketData[0].ohlcv); // primary timeframe
  chartImage = await generatePriceActionScreenshot(instrument, timeframes[0], setup);
  ({ caption, model } = await analyzeChartWithPriceAction(instrument, displayPair, timeframes, setup, chartImage));
} else {
  chartImage = await generateChartScreenshot(instrument, timeframes);
  ({ caption, model } = await analyzeChartWithVision(instrument, displayPair, timeframes, marketData, chartImage));
}
```

Everything else (job record creation, status transitions, storage,
duration/metadata tracking, error handling) is shared and untouched.

## UI Changes (`app/admin/tools/chart-analysis/ChartAnalysisClient.tsx`)

- A segmented control ("Indicators" / "Price Action") added next to the
  existing instrument/timeframe selectors, defaulting to **Indicators**
  (Config 1) so existing behavior is unchanged unless the admin explicitly
  switches it.
- Selected config is included in the `POST /api/admin/chart-analysis` body.
- History list rows get a small config badge (reusing the existing
  `STATUS_COLOR`-style inline badge pattern) so old (`indicators`, unlabeled
  historically) and new (`price_action`) runs are visually distinguishable.
- Detail/caption panel (`CaptionPanel`) needs no structural change — it
  already renders `keyLevels` and `riskReward` generically from
  `ChartCaption`, which both configs populate the same way.

## Error Handling

- If `computePriceActionSetup` can't find enough swing points (e.g. very
  short OHLCV range) to build a trendline or fib leg, those fields are
  `null` and the renderer simply skips drawing them — this is a normal
  "sideways/insufficient structure" outcome, not a job failure. Only actual
  fetch/screenshot/LLM errors fail the job, same as Config 1 today.
- `lightweight-charts` render failures (e.g. bad data shape) surface through
  the same `failChartAnalysis` path already used by the orchestrator's
  try/catch — no new error plumbing needed.

## Testing

- Unit tests for `computePriceActionSetup` against 2-3 fixed OHLCV fixtures
  (clear uptrend, clear downtrend, choppy/sideways) asserting: correct trend
  bias, non-empty key levels, trendline drawn iff not sideways, fib levels
  monotonic, long/short box direction matches trend and satisfies the ≥2:1
  ratio floor (or is `null` for sideways).
- Manual end-to-end verification via the admin dashboard: run one forex pair
  through Config 2, confirm the screenshot shows blue/white candles with a
  visible trendline, fib lines, S/R lines, and (when applicable) a long/short
  box, and that the caption's `keyLevels`/`riskReward` numbers match what's
  drawn.
- No changes to Config 1 behavior — spot-check one existing Config 1 run
  still works unmodified after the shared orchestrator/types edits.

## Open Questions / Follow-ups (explicitly deferred, not blocking)

- A user-facing color picker for chart themes is out of scope for this
  phase; colors are hardcoded constants that can be revisited later if
  wanted.
- Whether to eventually port Config 1 off the TradingView embed widget onto
  the same self-hosted `lightweight-charts` renderer (for consistent color
  control across both configs) is a separate future decision, not part of
  this design.
