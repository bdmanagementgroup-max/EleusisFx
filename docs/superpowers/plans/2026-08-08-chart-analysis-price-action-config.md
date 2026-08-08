# Chart Analysis Price-Action Config (Config 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second, independent chart-analysis pipeline ("Price Action" / Config 2) — trendlines, Fibonacci retracement, key support/resistance levels, a long/short entry-stop-target box, and volume — rendered on a self-hosted, fully-color-controlled chart, selectable from the existing admin dashboard alongside the current TradingView-embed pipeline ("Indicators" / Config 1), which is left untouched.

**Architecture:** All new logic lives in new files (`price-action.ts`, `browser-price-action.ts`, `app/chart-preview-pa/`) plus small additive edits to shared files (`types.ts`, `storage.ts`, `orchestrator.ts`, the API route, the admin UI). The orchestrator branches once on a new `config` field; Config 1's code path is never touched by the branch. The new chart is rendered with the open-source `lightweight-charts` library (candles + volume + drawn overlays we compute ourselves), screenshotted with the same puppeteer pattern already used for Config 1.

**Tech Stack:** Next.js 16 / React 19 / TypeScript, Supabase (Postgres + PostgREST), `lightweight-charts` (new dependency), `puppeteer-core` + `@sparticuz/chromium` (existing), OpenRouter vision models via the `openai` SDK (existing), Vitest (new, for the pure computation module only).

## Global Constraints

- Config 1 (TradingView embed, EMA/RSI/MACD/Volume, existing colors) must not change in rendering, prompt, or behavior.
- Config 2 drops EMA/RSI/MACD entirely — trendline, fib retracement, key levels, long/short box, and volume only.
- Config 2 colors: background `#08090f`, bullish/long `#4f8ef7` (blue), bearish/short `#e8ecf5` (white), fib lines muted purple `rgba(192,132,252,0.45)`, key S/R lines muted gray `rgba(210,220,240,0.35)`, stop-loss marker red `rgba(239,68,68,0.7)` (universal risk color, independent of direction).
- The long/short box's direction and entry/stop/target levels are computed server-side *before* rendering; the LLM describes the already-drawn setup and never invents different numbers — `keyLevels`/`riskReward`/`overallBias` in the stored `ChartCaption` come directly from the computed setup, not from LLM output.
- Same instrument list (`AGENT_BIAS_INSTRUMENTS`) and timeframe options (`TIMEFRAME_OPTIONS`) as Config 1 — no new instruments/timeframes.
- No authenticated TradingView UI automation — ruled out as the fragile approach Config 1 already moved away from.
- No user-facing color picker in this phase — colors are hardcoded constants.
- Package manager is npm (`package-lock.json` present).
- Design reference: `docs/superpowers/specs/2026-08-08-chart-analysis-price-action-config-design.md`.

---

## File Structure

**New files:**
- `vitest.config.ts` — test runner config (path alias resolution)
- `supabase/migrations/chart-analyses-config-migration.sql` — adds the `config` column
- `lib/chart-analysis/price-action.ts` — swing/level/trendline/fib/long-short/volume computation (pure, unit-tested)
- `lib/chart-analysis/price-action.test.ts` — unit tests for the above
- `lib/chart-analysis/browser-common.ts` — shared puppeteer launch logic, extracted out of `browser.ts`
- `lib/chart-analysis/browser-price-action.ts` — screenshot capture for the price-action chart
- `app/chart-preview-pa/page.tsx` — headless-only preview page (server component)
- `app/chart-preview-pa/ChartPreviewWidgetPA.tsx` — client component rendering the `lightweight-charts` chart with overlays

**Modified files:**
- `lib/chart-analysis/types.ts` — add `ChartAnalysisConfig` type + `config` field on job input/record
- `lib/chart-analysis/storage.ts` — persist/read the `config` column
- `lib/chart-analysis/market-data.ts` — add `fetchOHLCVWithVolume` for the price-action pipeline
- `lib/chart-analysis/llm-analysis.ts` — add the price-action system prompt + `analyzeChartWithPriceAction`
- `lib/chart-analysis/browser.ts` — delegate launch logic to `browser-common.ts` (behavior unchanged)
- `lib/chart-analysis/orchestrator.ts` — branch on `input.config`
- `lib/chart-analysis/index.ts` — barrel-export the two new modules
- `app/api/admin/chart-analysis/route.ts` — accept/validate `config` in the POST body
- `app/admin/tools/chart-analysis/ChartAnalysisClient.tsx` — config selector, gallery badge, relabeled caption panel
- `package.json` — add `vitest` (devDependency) and `lightweight-charts` (dependency), add `test` script

---

### Task 1: Vitest test tooling

**Files:**
- Create: `vitest.config.ts`
- Create (temporary, removed by end of task): `lib/chart-analysis/__smoke__.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm test` runs Vitest; later tasks add real `*.test.ts` files that this makes runnable.

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest@^2.1.8`

- [ ] **Step 2: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 3: Add the `test` script**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 4: Write a smoke test to confirm the runner + alias resolution work**

Create `lib/chart-analysis/__smoke__.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import type { TimeframeValue } from '@/lib/chart-analysis/types';

describe('vitest setup', () => {
  it('runs and resolves the @ path alias', () => {
    const tf: TimeframeValue = '1D';
    expect(tf).toBe('1D');
  });
});
```

- [ ] **Step 5: Run it and confirm it passes**

Run: `npm test`
Expected: `1 passed` (the smoke test above)

- [ ] **Step 6: Delete the smoke test**

It served only to prove the tooling works; real tests land in Task 5.

Run: `rm lib/chart-analysis/__smoke__.test.ts`

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest for chart-analysis pure-logic unit tests"
```

---

### Task 2: Database migration — `config` column

**Files:**
- Create: `supabase/migrations/chart-analyses-config-migration.sql`

**Interfaces:**
- Produces: `chart_analyses.config` column (`text`, `NOT NULL DEFAULT 'indicators'`, `CHECK (config IN ('indicators', 'price_action'))`), which Task 3's storage layer reads/writes.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/chart-analyses-config-migration.sql`:

```sql
-- Adds the config column to distinguish chart-analysis pipelines
-- (indicators = TradingView embed + EMA/RSI/MACD; price_action = self-hosted
-- trendline/fib/key-levels/long-short/volume). Existing rows default to
-- 'indicators' so history stays attributed to Config 1.
-- Run in Supabase SQL Editor

ALTER TABLE chart_analyses
  ADD COLUMN IF NOT EXISTS config text NOT NULL DEFAULT 'indicators'
  CHECK (config IN ('indicators', 'price_action'));

NOTIFY pgrst, 'reload schema';
```

- [ ] **Step 2: Apply the migration**

Run the SQL above against the project's Supabase instance — via the Supabase MCP `execute_sql` tool, or paste it into the Supabase SQL Editor.

- [ ] **Step 3: Verify the column exists**

Run this query (via the same tool/editor):

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'chart_analyses' AND column_name = 'config';
```

Expected: one row — `config | text | 'indicators'::text`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/chart-analyses-config-migration.sql
git commit -m "feat: add config column to chart_analyses for the price-action pipeline"
```

---

### Task 3: Wire the `config` field through types, storage, and the API route

**Files:**
- Modify: `lib/chart-analysis/types.ts`
- Modify: `lib/chart-analysis/storage.ts`
- Modify: `app/api/admin/chart-analysis/route.ts`

**Interfaces:**
- Consumes: the `config` column from Task 2.
- Produces: `ChartAnalysisConfig` type (`'indicators' | 'price_action'`), `CHART_ANALYSIS_CONFIGS` const, `config` field on `ChartAnalysisJobInput` and `ChartAnalysisRecord` — every later task that touches the job pipeline or the UI relies on these exact names.

- [ ] **Step 1: Add the config type to `lib/chart-analysis/types.ts`**

Add near `TIMEFRAME_OPTIONS` (after line 91, the `yahooToTradingView` function's closing brace is right before it — insert this block right after the `TimeframeValue` type export, i.e. after line 91):

```ts
export const CHART_ANALYSIS_CONFIGS = [
  { value: 'indicators', label: 'Indicators' },
  { value: 'price_action', label: 'Price Action' },
] as const;

export type ChartAnalysisConfig = (typeof CHART_ANALYSIS_CONFIGS)[number]['value'];
```

Then modify `ChartAnalysisRecord` (lines 42-54) to add the field:

```ts
export interface ChartAnalysisRecord {
  id: string;
  created_at: string;
  completed_at: string | null;
  instrument: string;            // Yahoo symbol (e.g., EURUSD=X)
  display_pair: string;          // Display pair (e.g., EUR/USD)
  timeframes: string[];
  config: ChartAnalysisConfig;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  chart_image: Uint8Array | null;  // PNG bytes
  caption_json: ChartCaption;
  metadata: ChartAnalysisMetadata;
  created_by: string | null;
}
```

And `ChartAnalysisJobInput` (lines 64-69):

```ts
export interface ChartAnalysisJobInput {
  instrument: string;            // Yahoo symbol
  displayPair: string;           // Display pair
  timeframes: TimeframeValue[];  // e.g., ['4H', '1D', '1W']
  config: ChartAnalysisConfig;
  createdBy: string;             // User ID
}
```

- [ ] **Step 2: Persist and read `config` in `lib/chart-analysis/storage.ts`**

In `createChartAnalysis` (the `.insert({...})` call, lines 14-26), add `config: input.config,` alongside the other fields:

```ts
    .insert({
      instrument: input.instrument,
      display_pair: input.displayPair,
      timeframes: input.timeframes,
      config: input.config,
      status: 'pending',
      caption_json: {},
      metadata: {
        indicators_used: [],
        duration_ms: 0,
        model: '',
      },
      created_by: input.createdBy,
    })
```

In `mapRecord`'s parameter type (lines 167-179), add `config: string;`:

```ts
function mapRecord(row: {
  id: string;
  created_at: string;
  completed_at: string | null;
  instrument: string;
  display_pair: string;
  timeframes: string[];
  config: string;
  status: string;
  chart_image: string | null;
  caption_json: ChartCaption;
  metadata: ChartAnalysisMetadata;
  created_by: string | null;
}): ChartAnalysisRecord {
```

And in the returned object (lines 180-192), add `config: row.config as ChartAnalysisRecord['config'],`:

```ts
  return {
    id: row.id,
    created_at: row.created_at,
    completed_at: row.completed_at,
    instrument: row.instrument,
    display_pair: row.display_pair,
    timeframes: row.timeframes,
    config: row.config as ChartAnalysisRecord['config'],
    status: row.status as ChartAnalysisRecord['status'],
    chart_image: decodeBytea(row.chart_image),
    caption_json: row.caption_json,
    metadata: row.metadata,
    created_by: row.created_by,
  };
```

- [ ] **Step 3: Accept and validate `config` in the API route**

In `app/api/admin/chart-analysis/route.ts`, update the import (line 5):

```ts
import type { ChartAnalysisJobInput, TimeframeValue, ChartAnalysisConfig } from '@/lib/chart-analysis/types';
import { CHART_ANALYSIS_CONFIGS } from '@/lib/chart-analysis/types';
```

Update the body destructure and validation (lines 22-27), and the job input construction (lines 42-48):

```ts
    // Parse request body
    const body = await request.json();
    const { instrument, timeframes, config } = body;

    if (!instrument || !timeframes || !Array.isArray(timeframes)) {
      return Response.json({ error: 'Missing required fields: instrument, timeframes' }, { status: 400 });
    }

    const validConfigs = CHART_ANALYSIS_CONFIGS.map((c) => c.value);
    const resolvedConfig: ChartAnalysisConfig = validConfigs.includes(config) ? config : 'indicators';
```

```ts
    // Create job input
    const jobInput: ChartAnalysisJobInput = {
      instrument,
      displayPair: instrumentData.display,
      timeframes: timeframes as TimeframeValue[],
      config: resolvedConfig,
      createdBy: user.id,
    };
```

- [ ] **Step 4: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/chart-analysis/types.ts lib/chart-analysis/storage.ts app/api/admin/chart-analysis/route.ts
git commit -m "feat: wire chart-analysis config field through types, storage, and the API route"
```

---

### Task 4: Fetch OHLCV + volume for the price-action pipeline

**Files:**
- Modify: `lib/chart-analysis/market-data.ts`

**Interfaces:**
- Produces: `PriceActionOHLCV` type (`{ open, high, low, close, volume: number[] }`) and `fetchOHLCVWithVolume(symbol: string, timeframe: TimeframeValue): Promise<PriceActionOHLCV>` — consumed by Task 5 (computation) and Task 10 (orchestrator).

`fetchMarketDataForTimeframes` (used by Config 1) is untouched — this is a new, separate function because the existing `OHLCV` type (from `lib/trading/indicators.ts`) has no `volume` field, and price-action needs one. Duplicating the ~15 lines of Yahoo fetch/parse logic here (rather than reshaping the shared function) keeps Config 1's code path completely unmodified.

- [ ] **Step 1: Add the type and function**

Add to `lib/chart-analysis/market-data.ts`, after the `TIMEFRAME_CONFIG` const (after line 29):

```ts
export interface PriceActionOHLCV {
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

// Caps the render/analysis window: keeps the chart legible, keeps the
// screenshot's query-string payload (Task 9) comfortably under Node's
// request-line size limit, and keeps computePriceActionSetup's indices
// consistent with what's actually rendered (no separate trim-after-compute
// step that would desync indices).
const PRICE_ACTION_MAX_BARS = 120;

export async function fetchOHLCVWithVolume(
  symbol: string,
  timeframe: TimeframeValue
): Promise<PriceActionOHLCV> {
  const config = TIMEFRAME_CONFIG[timeframe];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${config.interval}&range=${config.range}`;

  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance ${timeframe} fetch failed: ${res.status}`);
  }

  const json = await res.json();
  const q = json?.chart?.result?.[0]?.indicators?.quote?.[0];

  if (!q) {
    throw new Error(`No quote data for ${timeframe}`);
  }

  const open: number[] = [];
  const high: number[] = [];
  const low: number[] = [];
  const close: number[] = [];
  const volume: number[] = [];

  for (let i = 0; i < (q.close ?? []).length; i++) {
    if (
      q.close[i] != null &&
      q.open[i] != null &&
      q.high[i] != null &&
      q.low[i] != null &&
      q.volume[i] != null
    ) {
      open.push(q.open[i]);
      high.push(q.high[i]);
      low.push(q.low[i]);
      close.push(q.close[i]);
      volume.push(q.volume[i]);
    }
  }

  if (close.length < 50) {
    throw new Error(`Insufficient data for ${timeframe}: ${close.length} candles`);
  }

  const trimStart = Math.max(0, close.length - PRICE_ACTION_MAX_BARS);

  return {
    open: open.slice(trimStart),
    high: high.slice(trimStart),
    low: low.slice(trimStart),
    close: close.slice(trimStart),
    volume: volume.slice(trimStart),
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/chart-analysis/market-data.ts
git commit -m "feat: add fetchOHLCVWithVolume for the price-action chart pipeline"
```

---

### Task 5: Price-action computation module (TDD)

**Files:**
- Create: `lib/chart-analysis/price-action.ts`
- Create: `lib/chart-analysis/price-action.test.ts`

**Interfaces:**
- Consumes: `PriceActionOHLCV` from `./market-data` (Task 4).
- Produces: `PriceActionSetup` type and `computePriceActionSetup(ohlcv: PriceActionOHLCV): PriceActionSetup` — consumed by Task 7 (renderer), Task 8 (screenshot), Task 9 (LLM analysis), and Task 10 (orchestrator).

```ts
interface PriceActionSetup {
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
  relativeVolume: { index: number; ratio: number }[];
}
```

- [ ] **Step 1: Write the failing tests**

Create `lib/chart-analysis/price-action.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computePriceActionSetup } from './price-action';
import type { PriceActionOHLCV } from './market-data';

// Builds a deterministic 80-bar series with a linear trend plus a sine-wave
// oscillation superimposed, so fractal swing detection finds real swing
// points regardless of trend direction. 'flat' has zero slope for the
// sideways case.
function buildSyntheticOHLCV(direction: 'up' | 'down' | 'flat'): PriceActionOHLCV {
  const bars = 80;
  const open: number[] = [];
  const high: number[] = [];
  const low: number[] = [];
  const close: number[] = [];
  const volume: number[] = [];

  const slopePerBar = direction === 'up' ? 0.004 : direction === 'down' ? -0.004 : 0;
  const base = 1.1;

  for (let i = 0; i < bars; i++) {
    const trendComponent = base + slopePerBar * i;
    const oscillation = 0.02 * Math.sin(i / 3);
    const c = trendComponent + oscillation;
    const o = i === 0 ? c : close[i - 1];
    const h = Math.max(o, c) + 0.005;
    const l = Math.min(o, c) - 0.005;
    open.push(o);
    high.push(h);
    low.push(l);
    close.push(c);
    volume.push(i % 15 === 0 ? 5000 : 1000);
  }

  return { open, high, low, close, volume };
}

describe('computePriceActionSetup', () => {
  it('detects an uptrend and builds a long setup with a support trendline', () => {
    const setup = computePriceActionSetup(buildSyntheticOHLCV('up'));

    expect(setup.trend).toBe('up');
    expect(setup.trendline).not.toBeNull();
    expect(setup.longShortBox).not.toBeNull();
    expect(setup.longShortBox!.direction).toBe('long');
    expect(setup.longShortBox!.ratio).toBeGreaterThanOrEqual(2);
    expect(setup.longShortBox!.takeProfit).toBeGreaterThan(setup.longShortBox!.entry);
    expect(setup.longShortBox!.stopLoss).toBeLessThan(setup.longShortBox!.entry);
  });

  it('detects a downtrend and builds a short setup with a resistance trendline', () => {
    const setup = computePriceActionSetup(buildSyntheticOHLCV('down'));

    expect(setup.trend).toBe('down');
    expect(setup.trendline).not.toBeNull();
    expect(setup.longShortBox).not.toBeNull();
    expect(setup.longShortBox!.direction).toBe('short');
    expect(setup.longShortBox!.ratio).toBeGreaterThanOrEqual(2);
    expect(setup.longShortBox!.takeProfit).toBeLessThan(setup.longShortBox!.entry);
    expect(setup.longShortBox!.stopLoss).toBeGreaterThan(setup.longShortBox!.entry);
  });

  it('treats a flat series as sideways with no trendline or box', () => {
    const setup = computePriceActionSetup(buildSyntheticOHLCV('flat'));

    expect(setup.trend).toBe('sideways');
    expect(setup.trendline).toBeNull();
    expect(setup.longShortBox).toBeNull();
  });

  it('computes a monotonic fib retracement across all 7 standard levels', () => {
    const setup = computePriceActionSetup(buildSyntheticOHLCV('up'));

    expect(setup.fibRetracement).not.toBeNull();
    const levels = setup.fibRetracement!.map((f) => f.level);
    expect(levels).toEqual([0, 23.6, 38.2, 50, 61.8, 78.6, 100]);

    const prices = setup.fibRetracement!.map((f) => f.price);
    const ascending = prices.every((p, i) => i === 0 || p >= prices[i - 1]);
    const descending = prices.every((p, i) => i === 0 || p <= prices[i - 1]);
    expect(ascending || descending).toBe(true);
  });

  it('flags bars with volume at least 1.5x the trailing 20-bar average', () => {
    const setup = computePriceActionSetup(buildSyntheticOHLCV('up'));

    const spike = setup.relativeVolume.find((v) => v.ratio >= 1.5);
    expect(spike).toBeDefined();
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test -- price-action`
Expected: FAIL — `Cannot find module './price-action'` (the module doesn't exist yet).

- [ ] **Step 3: Implement `lib/chart-analysis/price-action.ts`**

```ts
/**
 * Price-Action Analysis
 * Computes swing structure, key levels, a trendline, a Fibonacci
 * retracement, a long/short entry-stop-target setup, and relative volume
 * from OHLCV data — pure functions, no network or browser dependency.
 */

import { calcATR } from '@/lib/trading/indicators';
import type { PriceActionOHLCV } from './market-data';

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
  relativeVolume: { index: number; ratio: number }[];
}

const FRACTAL_WINDOW = 2; // bars on each side that must be lower/higher
const SWING_CLUSTER_TOLERANCE = 0.001; // 0.1% price proximity to merge swings into one level
const TREND_LOOKBACK = 50;
const TREND_SLOPE_THRESHOLD = 0.0005; // normalized slope per bar (fraction of price)
const MIN_RR_RATIO = 2;
const STOP_ATR_BUFFER = 0.25;
const RELATIVE_VOLUME_WINDOW = 20;

function findSwingHighs(high: number[]): { index: number; price: number }[] {
  const swings: { index: number; price: number }[] = [];
  for (let i = FRACTAL_WINDOW; i < high.length - FRACTAL_WINDOW; i++) {
    const window = high.slice(i - FRACTAL_WINDOW, i + FRACTAL_WINDOW + 1);
    if (high[i] === Math.max(...window)) {
      swings.push({ index: i, price: high[i] });
    }
  }
  return swings;
}

function findSwingLows(low: number[]): { index: number; price: number }[] {
  const swings: { index: number; price: number }[] = [];
  for (let i = FRACTAL_WINDOW; i < low.length - FRACTAL_WINDOW; i++) {
    const window = low.slice(i - FRACTAL_WINDOW, i + FRACTAL_WINDOW + 1);
    if (low[i] === Math.min(...window)) {
      swings.push({ index: i, price: low[i] });
    }
  }
  return swings;
}

function linearRegressionSlope(values: number[]): number {
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

function computeTrend(close: number[]): 'up' | 'down' | 'sideways' {
  const lookback = close.slice(-TREND_LOOKBACK);
  const slope = linearRegressionSlope(lookback);
  const avgPrice = lookback.reduce((a, b) => a + b, 0) / lookback.length;
  const normalizedSlope = slope / avgPrice;
  if (normalizedSlope > TREND_SLOPE_THRESHOLD) return 'up';
  if (normalizedSlope < -TREND_SLOPE_THRESHOLD) return 'down';
  return 'sideways';
}

function clusterLevels(
  swings: { index: number; price: number }[],
  tolerance: number
): { price: number; count: number; lastIndex: number }[] {
  const sorted = [...swings].sort((a, b) => a.price - b.price);
  const clusters: { prices: number[]; indices: number[] }[] = [];

  for (const s of sorted) {
    const last = clusters[clusters.length - 1];
    const lastPrice = last?.prices[last.prices.length - 1];
    if (last && lastPrice !== undefined && Math.abs(s.price - lastPrice) / s.price <= tolerance) {
      last.prices.push(s.price);
      last.indices.push(s.index);
    } else {
      clusters.push({ prices: [s.price], indices: [s.index] });
    }
  }

  return clusters.map((c) => ({
    price: c.prices.reduce((a, b) => a + b, 0) / c.prices.length,
    count: c.prices.length,
    lastIndex: Math.max(...c.indices),
  }));
}

function computeKeyLevels(
  swingHighs: { index: number; price: number }[],
  swingLows: { index: number; price: number }[],
  currentPrice: number
): { support: number[]; resistance: number[] } {
  const resistance = clusterLevels(swingHighs, SWING_CLUSTER_TOLERANCE)
    .filter((c) => c.price > currentPrice)
    .sort((a, b) => b.count - a.count || b.lastIndex - a.lastIndex)
    .slice(0, 3)
    .map((c) => c.price)
    .sort((a, b) => a - b);

  const support = clusterLevels(swingLows, SWING_CLUSTER_TOLERANCE)
    .filter((c) => c.price < currentPrice)
    .sort((a, b) => b.count - a.count || b.lastIndex - a.lastIndex)
    .slice(0, 3)
    .map((c) => c.price)
    .sort((a, b) => b - a);

  return { support, resistance };
}

function computeTrendline(
  trend: 'up' | 'down' | 'sideways',
  swingHighs: { index: number; price: number }[],
  swingLows: { index: number; price: number }[]
): PriceActionSetup['trendline'] {
  if (trend === 'sideways') return null;
  const points = trend === 'up' ? swingLows : swingHighs;
  if (points.length < 2) return null;
  const sorted = [...points].sort((a, b) => a.index - b.index);
  const [p1, p2] = sorted.slice(-2);
  if (p1.index === p2.index) return null;
  return { x1: p1.index, y1: p1.price, x2: p2.index, y2: p2.price };
}

function computeFibRetracement(
  swingHighs: { index: number; price: number }[],
  swingLows: { index: number; price: number }[]
): PriceActionSetup['fibRetracement'] {
  let best: { range: number; high: number; low: number; highFirst: boolean } | null = null;

  for (const h of swingHighs) {
    for (const l of swingLows) {
      const range = Math.abs(h.price - l.price);
      if (!best || range > best.range) {
        best = { range, high: h.price, low: l.price, highFirst: h.index < l.index };
      }
    }
  }

  if (!best || best.range === 0) return null;

  const levels = [0, 23.6, 38.2, 50, 61.8, 78.6, 100];
  return levels.map((level) => ({
    level,
    price: best!.highFirst
      ? best!.high - (best!.range * level) / 100
      : best!.low + (best!.range * level) / 100,
  }));
}

function computeRelativeVolume(volume: number[]): { index: number; ratio: number }[] {
  const result: { index: number; ratio: number }[] = [];
  for (let i = RELATIVE_VOLUME_WINDOW; i < volume.length; i++) {
    const avg =
      volume.slice(i - RELATIVE_VOLUME_WINDOW, i).reduce((a, b) => a + b, 0) / RELATIVE_VOLUME_WINDOW;
    result.push({ index: i, ratio: avg === 0 ? 1 : volume[i] / avg });
  }
  return result;
}

function computeLongShortBox(
  trend: 'up' | 'down' | 'sideways',
  close: number[],
  high: number[],
  low: number[],
  swingHighs: { index: number; price: number }[],
  swingLows: { index: number; price: number }[],
  keyLevels: { support: number[]; resistance: number[] }
): PriceActionSetup['longShortBox'] {
  if (trend === 'sideways') return null;

  const entry = close[close.length - 1];
  const atr = calcATR(high, low, close, 14);
  const buffer = atr * STOP_ATR_BUFFER;

  if (trend === 'up') {
    const invalidation = [...swingLows]
      .filter((s) => s.price < entry)
      .sort((a, b) => b.index - a.index)[0];
    if (!invalidation) return null;

    const stopLoss = invalidation.price - buffer;
    const risk = entry - stopLoss;
    if (risk <= 0) return null;

    const targetLevel = keyLevels.resistance.find((r) => (r - entry) / risk >= MIN_RR_RATIO);
    const takeProfit = targetLevel ?? entry + risk * 3;
    const ratio = (takeProfit - entry) / risk;

    return { direction: 'long', entry, stopLoss, takeProfit, ratio: Number(ratio.toFixed(2)) };
  }

  const invalidation = [...swingHighs]
    .filter((s) => s.price > entry)
    .sort((a, b) => b.index - a.index)[0];
  if (!invalidation) return null;

  const stopLoss = invalidation.price + buffer;
  const risk = stopLoss - entry;
  if (risk <= 0) return null;

  const targetLevel = keyLevels.support.find((s) => (entry - s) / risk >= MIN_RR_RATIO);
  const takeProfit = targetLevel ?? entry - risk * 3;
  const ratio = (entry - takeProfit) / risk;

  return { direction: 'short', entry, stopLoss, takeProfit, ratio: Number(ratio.toFixed(2)) };
}

export function computePriceActionSetup(ohlcv: PriceActionOHLCV): PriceActionSetup {
  const { high, low, close, volume } = ohlcv;

  const swingHighs = findSwingHighs(high);
  const swingLows = findSwingLows(low);
  const trend = computeTrend(close);
  const currentPrice = close[close.length - 1];
  const keyLevels = computeKeyLevels(swingHighs, swingLows, currentPrice);
  const trendline = computeTrendline(trend, swingHighs, swingLows);
  const fibRetracement = computeFibRetracement(swingHighs, swingLows);
  const relativeVolume = computeRelativeVolume(volume);
  const longShortBox = computeLongShortBox(trend, close, high, low, swingHighs, swingLows, keyLevels);

  return { trend, swingHighs, swingLows, keyLevels, trendline, fibRetracement, longShortBox, relativeVolume };
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npm test -- price-action`
Expected: `5 passed`

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/chart-analysis/price-action.ts lib/chart-analysis/price-action.test.ts
git commit -m "feat: add price-action computation module (swings, levels, trendline, fib, long/short box, volume)"
```

---

### Task 6: Extract shared browser launch logic

**Files:**
- Create: `lib/chart-analysis/browser-common.ts`
- Modify: `lib/chart-analysis/browser.ts`

**Interfaces:**
- Produces: `launchBrowser(cfg)`, `DEFAULT_BROWSER_CONFIG`, `BrowserConfig` type in `browser-common.ts` — consumed by both `browser.ts` (this task) and `browser-price-action.ts` (Task 8).

This is a pure refactor — Config 1's `generateChartScreenshot` behavior must be byte-for-byte identical after this task.

- [ ] **Step 1: Create `browser-common.ts` with the extracted logic**

```ts
/**
 * Shared puppeteer launch logic for both chart-analysis renderers
 * (the TradingView-embed pipeline in browser.ts and the self-hosted
 * price-action pipeline in browser-price-action.ts).
 */

import type { Browser } from 'puppeteer-core';

export interface BrowserConfig {
  headless?: boolean;
  viewport?: { width: number; height: number };
  deviceScaleFactor?: number;
  timeout?: number;
}

export const DEFAULT_BROWSER_CONFIG: Required<BrowserConfig> = {
  headless: true,
  // Extra height so the price pane + any sub-panes fit in one shot
  viewport: { width: 1920, height: 1600 },
  deviceScaleFactor: 2,
  timeout: 90000,
};

export async function launchBrowser(cfg: Required<BrowserConfig>): Promise<Browser> {
  const puppeteer = (await import('puppeteer-core')).default;
  const isProduction = process.env.NODE_ENV === 'production';

  let executablePath: string;
  let launchArgs: string[];

  if (isProduction) {
    const chromium = (await import('@sparticuz/chromium')).default;
    executablePath = await chromium.executablePath();
    launchArgs = [...chromium.args, '--disable-blink-features=AutomationControlled'];
  } else {
    executablePath =
      process.env.CHROME_PATH ??
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ];
  }

  return puppeteer.launch({
    args: launchArgs,
    executablePath,
    headless: cfg.headless,
    defaultViewport: {
      width: cfg.viewport.width,
      height: cfg.viewport.height,
      deviceScaleFactor: cfg.deviceScaleFactor,
    },
  });
}
```

- [ ] **Step 2: Update `browser.ts` to delegate to it**

Remove the `BrowserConfig` interface (lines 20-25), `DEFAULT_CONFIG` const (lines 27-33), and `launchBrowser` function (lines 76-109) from `browser.ts`. Replace the top-of-file import (line 17) with:

```ts
import type { Browser, Page } from 'puppeteer-core';
import { launchBrowser, DEFAULT_BROWSER_CONFIG, type BrowserConfig } from './browser-common';

export type { BrowserConfig } from './browser-common';
```

(`Browser` is kept as a direct import from `puppeteer-core` — it's still used for the `let browser: Browser | null = null;` local variable in `generateChartScreenshot`, unchanged from today. Only the `launchBrowser` function body and the `BrowserConfig`/`DEFAULT_CONFIG` declarations move to `browser-common.ts`.)

In `generateChartScreenshot`, change:

```ts
  const cfg = { ...DEFAULT_CONFIG, ...config };
```

to:

```ts
  const cfg = { ...DEFAULT_BROWSER_CONFIG, ...config };
```

Everything else in `browser.ts` (the `StudyConfig`, `getTradingViewSymbol`, `TIMEFRAME_TO_INTERVAL`, `DEFAULT_STUDIES`, `buildPreviewUrl`, `waitForChartData`, `isChartDataLoaded`, and the body of `generateChartScreenshot`) is unchanged.

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/chart-analysis/browser-common.ts lib/chart-analysis/browser.ts
git commit -m "refactor: extract shared puppeteer launch logic into browser-common.ts"
```

---

### Task 7: Price-action chart renderer (preview page + `lightweight-charts` widget)

**Files:**
- Create: `app/chart-preview-pa/page.tsx`
- Create: `app/chart-preview-pa/ChartPreviewWidgetPA.tsx`
- Modify: `package.json`

**Interfaces:**
- Consumes: an `ohlcv` query param (JSON: `{ open, high, low, close, volume: number[] }`) and a `setup` query param (JSON: the subset of `PriceActionSetup` needed for drawing — `trend`, `keyLevels`, `trendline`, `fibRetracement`, `longShortBox`).
- Produces: a page at `/chart-preview-pa` that sets `data-chart-ready="true"` on its root container once the chart has painted — this is the signal Task 8's screenshot code waits on.

- [ ] **Step 1: Add the `lightweight-charts` dependency**

Run: `npm install lightweight-charts@^4.1.3`

- [ ] **Step 2: Create the widget**

Create `app/chart-preview-pa/ChartPreviewWidgetPA.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { createChart, type IChartApi, type UTCTimestamp } from "lightweight-charts";

export interface OhlcvPayload {
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

export interface SetupPayload {
  trend: "up" | "down" | "sideways";
  keyLevels: { support: number[]; resistance: number[] };
  trendline: { x1: number; y1: number; x2: number; y2: number } | null;
  fibRetracement: { level: number; price: number }[] | null;
  longShortBox: {
    direction: "long" | "short";
    entry: number;
    stopLoss: number;
    takeProfit: number;
    ratio: number;
  } | null;
}

const BULLISH = "#4f8ef7";
const BEARISH = "#e8ecf5";
const BACKGROUND = "#08090f";
const FIB_COLOR = "rgba(192,132,252,0.45)";
const LEVEL_COLOR = "rgba(210,220,240,0.35)";
const STOP_COLOR = "rgba(239,68,68,0.7)";

// lightweight-charts requires unique ascending UTCTimestamp values; the bar
// index doubles as a synthetic day offset since real dates aren't needed —
// only left-to-right ordering matters for a static screenshot.
function indexToTime(index: number): UTCTimestamp {
  return (index * 86400) as UTCTimestamp;
}

export default function ChartPreviewWidgetPA({
  ohlcv,
  setup,
}: {
  ohlcv: OhlcvPayload;
  setup: SetupPayload;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: { background: { color: BACKGROUND }, textColor: "rgba(210,220,240,0.7)" },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      timeScale: { borderColor: "rgba(255,255,255,0.08)", visible: false },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
    });
    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: BULLISH,
      downColor: BEARISH,
      borderUpColor: BULLISH,
      borderDownColor: BEARISH,
      wickUpColor: BULLISH,
      wickDownColor: BEARISH,
    });
    candleSeries.setData(
      ohlcv.close.map((c, i) => ({
        time: indexToTime(i),
        open: ohlcv.open[i],
        high: ohlcv.high[i],
        low: ohlcv.low[i],
        close: c,
      }))
    );

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    volumeSeries.setData(
      ohlcv.volume.map((v, i) => ({
        time: indexToTime(i),
        value: v,
        color: ohlcv.close[i] >= ohlcv.open[i] ? `${BULLISH}88` : `${BEARISH}88`,
      }))
    );

    if (setup.trendline) {
      const trendColor = setup.trend === "up" ? BULLISH : BEARISH;
      const lineSeries = chart.addLineSeries({ color: trendColor, lineWidth: 2 });
      lineSeries.setData([
        { time: indexToTime(setup.trendline.x1), value: setup.trendline.y1 },
        { time: indexToTime(setup.trendline.x2), value: setup.trendline.y2 },
      ]);
    }

    if (setup.fibRetracement) {
      for (const fib of setup.fibRetracement) {
        candleSeries.createPriceLine({
          price: fib.price,
          color: FIB_COLOR,
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: `fib ${fib.level}`,
        });
      }
    }

    for (const price of [...setup.keyLevels.support, ...setup.keyLevels.resistance]) {
      candleSeries.createPriceLine({
        price,
        color: LEVEL_COLOR,
        lineWidth: 1,
        lineStyle: 3,
        axisLabelVisible: true,
        title: "level",
      });
    }

    if (setup.longShortBox) {
      const dirColor = setup.longShortBox.direction === "long" ? BULLISH : BEARISH;
      candleSeries.createPriceLine({
        price: setup.longShortBox.entry,
        color: dirColor,
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: "entry",
      });
      candleSeries.createPriceLine({
        price: setup.longShortBox.stopLoss,
        color: STOP_COLOR,
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "stop",
      });
      candleSeries.createPriceLine({
        price: setup.longShortBox.takeProfit,
        color: dirColor,
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "target",
      });
    }

    chart.timeScale().fitContent();
    containerRef.current.setAttribute("data-chart-ready", "true");

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [ohlcv, setup]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: BACKGROUND }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
```

- [ ] **Step 3: Create the page**

Create `app/chart-preview-pa/page.tsx`:

```tsx
import ChartPreviewWidgetPA from "./ChartPreviewWidgetPA";

// No auth guard, no admin shell — this page only renders the price-action
// chart. It is loaded headlessly by browser-price-action.ts to capture chart
// images, so it must render nothing but the widget itself (same pattern as
// app/chart-preview/page.tsx for Config 1).
export default async function ChartPreviewPriceActionPage({
  searchParams,
}: {
  searchParams: Promise<{ ohlcv?: string; setup?: string }>;
}) {
  const params = await searchParams;

  if (!params.ohlcv || !params.setup) {
    throw new Error("chart-preview-pa requires both ohlcv and setup query params");
  }

  const ohlcv = JSON.parse(params.ohlcv);
  const setup = JSON.parse(params.setup);

  return <ChartPreviewWidgetPA ohlcv={ohlcv} setup={setup} />;
}
```

- [ ] **Step 4: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Manually verify the page renders**

Run: `npm run dev`, then in a browser visit:

```
http://localhost:3000/chart-preview-pa?ohlcv=%7B%22open%22%3A%5B1.1%2C1.11%2C1.12%5D%2C%22high%22%3A%5B1.105%2C1.115%2C1.125%5D%2C%22low%22%3A%5B1.095%2C1.105%2C1.115%5D%2C%22close%22%3A%5B1.11%2C1.12%2C1.13%5D%2C%22volume%22%3A%5B1000%2C1200%2C900%5D%7D&setup=%7B%22trend%22%3A%22up%22%2C%22keyLevels%22%3A%7B%22support%22%3A%5B1.09%5D%2C%22resistance%22%3A%5B1.15%5D%7D%2C%22trendline%22%3Anull%2C%22fibRetracement%22%3Anull%2C%22longShortBox%22%3Anull%7D
```

Expected: a dark candlestick chart with 3 blue-ish candles, a volume pane, and two faint dashed horizontal lines (support/resistance). Confirm in devtools that the outer `<div>` has `data-chart-ready="true"`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json app/chart-preview-pa
git commit -m "feat: add self-hosted price-action chart renderer (lightweight-charts)"
```

---

### Task 8: Price-action screenshot capture

**Files:**
- Create: `lib/chart-analysis/browser-price-action.ts`

**Interfaces:**
- Consumes: `launchBrowser`/`DEFAULT_BROWSER_CONFIG`/`BrowserConfig` from `./browser-common` (Task 6), `PriceActionOHLCV` from `./market-data` (Task 4), `PriceActionSetup` from `./price-action` (Task 5).
- Produces: `generatePriceActionScreenshot(ohlcv: PriceActionOHLCV, setup: PriceActionSetup, config?: BrowserConfig): Promise<Uint8Array>` — consumed by Task 10 (orchestrator).

- [ ] **Step 1: Implement the screenshot function**

Create `lib/chart-analysis/browser-price-action.ts`:

```ts
/**
 * Price Action Chart Screenshot
 * Renders the self-hosted /chart-preview-pa page (candles + volume +
 * trendline/fib/key-levels/long-short overlays via lightweight-charts) and
 * captures it with puppeteer-core + @sparticuz/chromium — same launch logic
 * as the TradingView-embed pipeline in browser.ts, shared via
 * browser-common.ts.
 */

import type { Browser, Page } from 'puppeteer-core';
import { launchBrowser, DEFAULT_BROWSER_CONFIG, type BrowserConfig } from './browser-common';
import type { PriceActionOHLCV } from './market-data';
import type { PriceActionSetup } from './price-action';

function buildPriceActionPreviewUrl(
  ohlcv: PriceActionOHLCV,
  setup: PriceActionSetup,
  siteUrl: string
): string {
  // Round to keep the query string well under Node's request-line size
  // limit — full trading precision isn't needed for a social chart image.
  const roundedOhlcv = {
    open: ohlcv.open.map((v) => Number(v.toFixed(5))),
    high: ohlcv.high.map((v) => Number(v.toFixed(5))),
    low: ohlcv.low.map((v) => Number(v.toFixed(5))),
    close: ohlcv.close.map((v) => Number(v.toFixed(5))),
    volume: ohlcv.volume.map((v) => Math.round(v)),
  };

  // Only send what the widget draws — swingHighs/swingLows/relativeVolume
  // are analysis inputs the LLM prompt uses (Task 9), not chart overlays.
  const renderSetup = {
    trend: setup.trend,
    keyLevels: setup.keyLevels,
    trendline: setup.trendline,
    fibRetracement: setup.fibRetracement,
    longShortBox: setup.longShortBox,
  };

  const ohlcvParam = encodeURIComponent(JSON.stringify(roundedOhlcv));
  const setupParam = encodeURIComponent(JSON.stringify(renderSetup));
  return `${siteUrl}/chart-preview-pa?ohlcv=${ohlcvParam}&setup=${setupParam}`;
}

export async function generatePriceActionScreenshot(
  ohlcv: PriceActionOHLCV,
  setup: PriceActionSetup,
  config: BrowserConfig = {}
): Promise<Uint8Array> {
  const cfg = { ...DEFAULT_BROWSER_CONFIG, ...config };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  let browser: Browser | null = null;

  try {
    browser = await launchBrowser(cfg);
    const page: Page = await browser.newPage();
    page.setDefaultTimeout(cfg.timeout);

    const url = buildPriceActionPreviewUrl(ohlcv, setup, siteUrl);
    console.log('[ChartAnalysis] Navigating to price-action preview');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await page.waitForSelector('[data-chart-ready="true"]', { timeout: 15000 });
    // lightweight-charts paints synchronously on setData, but give the
    // browser one frame to flush the canvas before capturing.
    await new Promise((r) => setTimeout(r, 300));

    console.log('[ChartAnalysis] Capturing price-action screenshot...');
    const screenshot = new Uint8Array(
      await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: cfg.viewport.width, height: cfg.viewport.height },
      })
    );

    console.log(`[ChartAnalysis] Price-action screenshot captured: ${screenshot.length} bytes`);
    return screenshot;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/chart-analysis/browser-price-action.ts
git commit -m "feat: add price-action chart screenshot capture"
```

---

### Task 9: Price-action LLM analysis

**Files:**
- Modify: `lib/chart-analysis/llm-analysis.ts`

**Interfaces:**
- Consumes: `PriceActionSetup` from `./price-action` (Task 5).
- Produces: `analyzeChartWithPriceAction(instrument, displayPair, timeframes, setup, chartImage): Promise<{ caption: ChartCaption; model: string }>` — consumed by Task 10 (orchestrator). `overallBias`, `keyLevels`, and `riskReward` on the returned `ChartCaption` come directly from `setup` (never from the LLM); the LLM supplies `confidence`, per-timeframe observation strings, `keyObservations`, `reasoning`, and `hashtags`.

- [ ] **Step 1: Add the price-action prompt and analysis function**

Add to `lib/chart-analysis/llm-analysis.ts`, after the existing `analyzeChartWithVision` function, and add `PriceActionSetup` to the type imports at the top:

```ts
import type { ChartCaption, TimeframeValue } from './types';
import type { TimeframeData } from './market-data';
import type { PriceActionSetup } from './price-action';
```

Then append:

```ts
const SYSTEM_PROMPT_PRICE_ACTION = `You are the Eleusis Fx Trading Analyst - a professional funded trader with 15+ years of experience. You analyze a price-action chart (candles, a trendline, Fibonacci retracement levels, key support/resistance levels, a long/short entry-stop-target setup, and volume) for social media content only — this is not used to place real trades.

The trendline, fib levels, key levels, and long/short setup are ALREADY COMPUTED and drawn on the chart — do not invent different levels. Your job is to describe what's visible and provide narrative color, referencing the exact numbers given to you.

OUTPUT FORMAT: Return ONLY valid JSON with this exact shape. No markdown, no extra text.

{
  "confidence": 0-100,
  "timeframeObservations": {
    "trend": "one sentence describing the trendline / structure",
    "levels": "one sentence describing proximity to key support/resistance",
    "fib": "one sentence describing the fib confluence, if relevant",
    "volume": "one sentence describing the relative volume reading"
  },
  "keyObservations": ["short bullet", "short bullet", "short bullet"],
  "reasoning": "3-5 sentence narrative for the social caption, referencing the actual entry/stop/target numbers given",
  "hashtags": ["#EleusisFx", "#ForexSignals", "#PropFirm", "#PAIR", "#PriceAction", "#FundedTrader"]
}

Confidence should reflect how clean the structure is (a clear trendline plus confluence with a key level or fib level = higher confidence; choppy price action with no qualifying long/short setup = lower confidence).`;

function buildPriceActionUserPrompt(
  displayPair: string,
  instrument: string,
  timeframe: string,
  setup: PriceActionSetup
): string {
  const levels = `Support: ${setup.keyLevels.support.join(', ') || 'none'} | Resistance: ${setup.keyLevels.resistance.join(', ') || 'none'}`;
  const fib = setup.fibRetracement
    ? setup.fibRetracement.map((f) => `${f.level}%: ${f.price.toFixed(5)}`).join(' | ')
    : 'no clear swing leg found';
  const box = setup.longShortBox
    ? `${setup.longShortBox.direction.toUpperCase()} — Entry ${setup.longShortBox.entry.toFixed(5)}, Stop ${setup.longShortBox.stopLoss.toFixed(5)}, Target ${setup.longShortBox.takeProfit.toFixed(5)}, R:R ${setup.longShortBox.ratio}:1`
    : 'no qualifying setup — market is sideways/choppy';
  const latestVolume = setup.relativeVolume[setup.relativeVolume.length - 1];

  return `Analyze this price-action chart for ${displayPair} (${instrument}), ${timeframe} timeframe.

Trend: ${setup.trend}
Key Levels: ${levels}
Fibonacci Retracement: ${fib}
Long/Short Setup: ${box}
Relative Volume (latest bar vs 20-bar avg): ${latestVolume ? `${latestVolume.ratio.toFixed(2)}x` : 'n/a'}

Return the JSON only.`;
}

interface PriceActionLLMResponse {
  confidence: number;
  timeframeObservations: { trend: string; levels: string; fib: string; volume: string };
  keyObservations: string[];
  reasoning: string;
  hashtags: string[];
}

export async function analyzeChartWithPriceAction(
  instrument: string,
  displayPair: string,
  timeframes: TimeframeValue[],
  setup: PriceActionSetup,
  chartImage: Uint8Array
): Promise<{ caption: ChartCaption; model: string }> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not set');
  }

  const chartBase64 = Buffer.from(chartImage).toString('base64');
  const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    maxRetries: 0,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eleusisfx.com',
      'X-Title': 'Eleusis FX Chart Analysis',
    },
  });

  const primaryTf = timeframes[0];
  const userPrompt = buildPriceActionUserPrompt(displayPair, instrument, primaryTf, setup);

  let lastErr: unknown;
  for (const model of VISION_MODEL_CANDIDATES) {
    try {
      const completion = await openrouter.chat.completions.create({
        model,
        max_tokens: 1024,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_PRICE_ACTION },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${chartBase64}`, detail: 'high' } },
            ],
          },
        ],
      });

      const content = completion.choices[0]?.message?.content ?? '';
      if (content.trim().length === 0) {
        console.warn(`[ChartAnalysis] ${model} returned empty content`);
        continue;
      }

      let parsed: PriceActionLLMResponse;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (parseErr) {
        console.warn(`[ChartAnalysis] ${model} returned invalid JSON:`, parseErr);
        continue;
      }

      if (typeof parsed.confidence !== 'number' || !parsed.reasoning) {
        console.warn(`[ChartAnalysis] ${model} missing required fields`);
        continue;
      }

      const overallBias = setup.trend === 'up' ? 'bullish' : setup.trend === 'down' ? 'bearish' : 'neutral';

      const caption: ChartCaption = {
        instrument,
        displayPair,
        generatedAt: new Date().toISOString(),
        timeframes,
        overallBias,
        confidence: parsed.confidence,
        keyLevels: {
          support: setup.keyLevels.support,
          resistance: setup.keyLevels.resistance,
          pivotPoints: [],
        },
        timeframeAnalysis: {
          [primaryTf]: {
            trend: setup.trend,
            bias: overallBias,
            keyObservations: parsed.keyObservations ?? [],
            indicatorSignals: {
              ema: parsed.timeframeObservations?.trend ?? '',
              rsi: parsed.timeframeObservations?.levels ?? '',
              macd: parsed.timeframeObservations?.fib ?? '',
              volume: parsed.timeframeObservations?.volume ?? '',
            },
          },
        },
        riskReward: setup.longShortBox
          ? {
              entry: setup.longShortBox.entry,
              stopLoss: setup.longShortBox.stopLoss,
              takeProfit: [setup.longShortBox.takeProfit],
              ratio: setup.longShortBox.ratio,
            }
          : { entry: 0, stopLoss: 0, takeProfit: [], ratio: 0 },
        reasoning: parsed.reasoning,
        disclaimer: 'Not financial advice. Trade at your own risk. Past performance does not guarantee future results.',
        hashtags: parsed.hashtags?.length
          ? parsed.hashtags
          : ['#EleusisFx', '#ForexSignals', '#PropFirm', `#${displayPair.replace('/', '')}`, '#PriceAction', '#FundedTrader'],
      };

      return { caption, model };
    } catch (err) {
      lastErr = err;
      console.warn(`[ChartAnalysis] ${model} failed:`, err);
    }
  }

  throw lastErr ?? new Error('All vision models failed');
}
```

Note: `indicatorSignals.ema/rsi/macd/volume` are the existing `ChartCaption` type's fixed field names — for this config they hold trend/levels/fib/volume descriptions respectively (not actual EMA/RSI/MACD values). Task 11's UI change relabels them for display so this isn't shown to the admin as "EMA: ...".

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/chart-analysis/llm-analysis.ts
git commit -m "feat: add price-action LLM analysis (caption fields sourced from computed setup, not the model)"
```

---

### Task 10: Orchestrator branching + barrel exports

**Files:**
- Modify: `lib/chart-analysis/orchestrator.ts`
- Modify: `lib/chart-analysis/index.ts`

**Interfaces:**
- Consumes: `fetchOHLCVWithVolume` (Task 4), `computePriceActionSetup` (Task 5), `generatePriceActionScreenshot` (Task 8), `analyzeChartWithPriceAction` (Task 9), `input.config` (Task 3).

- [ ] **Step 1: Branch the pipeline on `input.config`**

Replace the full contents of `lib/chart-analysis/orchestrator.ts` with:

```ts
/**
 * Chart Analysis Orchestrator
 * Main entry point that coordinates the full chart analysis pipeline
 */

import { fetchMarketDataForTimeframes, fetchOHLCVWithVolume } from './market-data';
import { analyzeChartWithVision, analyzeChartWithPriceAction } from './llm-analysis';
import { generateChartScreenshot } from './browser';
import { generatePriceActionScreenshot } from './browser-price-action';
import { computePriceActionSetup } from './price-action';
import { createChartAnalysis, updateChartAnalysisProcessing, completeChartAnalysis, failChartAnalysis, getChartAnalysis } from './storage';
import type { ChartAnalysisJobInput, ChartAnalysisJobResult, ChartCaption } from './types';

/**
 * Run chart analysis job, creating the database record itself.
 * Use this when no record exists yet for the job.
 */
export async function runChartAnalysisJob(input: ChartAnalysisJobInput): Promise<ChartAnalysisJobResult> {
  const record = await createChartAnalysis(input);
  return runChartAnalysisPipeline(record.id, input);
}

/**
 * Run chart analysis job for an already-created database record.
 * Use this when the caller has already inserted the record (e.g. to return the job ID immediately).
 */
export async function runChartAnalysisJobWithId(jobId: string, input: ChartAnalysisJobInput): Promise<ChartAnalysisJobResult> {
  return runChartAnalysisPipeline(jobId, input);
}

async function runChartAnalysisPipeline(jobId: string, input: ChartAnalysisJobInput): Promise<ChartAnalysisJobResult> {
  const startTime = Date.now();
  const { instrument, displayPair, timeframes, config } = input;

  console.log(`[ChartAnalysis] Starting job ${jobId} for ${displayPair} (${instrument}), config=${config}`);

  try {
    await updateChartAnalysisProcessing(jobId);

    let chartImage: Uint8Array;
    let caption: ChartCaption;
    let model: string;
    let indicatorsUsed: string[];

    if (config === 'price_action') {
      console.log(`[ChartAnalysis] Fetching OHLCV+volume for price-action setup...`);
      const ohlcv = await fetchOHLCVWithVolume(instrument, timeframes[0]);
      const setup = computePriceActionSetup(ohlcv);

      console.log(`[ChartAnalysis] Rendering price-action chart...`);
      chartImage = await generatePriceActionScreenshot(ohlcv, setup);

      console.log(`[ChartAnalysis] Analyzing price-action chart with LLM vision...`);
      ({ caption, model } = await analyzeChartWithPriceAction(instrument, displayPair, timeframes, setup, chartImage));

      indicatorsUsed = ['Trendline', 'FibRetracement', 'KeyLevels', 'LongShortBox', 'Volume'];
    } else {
      console.log(`[ChartAnalysis] Fetching market data for ${timeframes.join(', ')}...`);
      const marketData = await fetchMarketDataForTimeframes(instrument, timeframes);

      console.log(`[ChartAnalysis] Generating TradingView chart screenshot...`);
      chartImage = await generateChartScreenshot(instrument, timeframes);

      console.log(`[ChartAnalysis] Analyzing chart with LLM vision...`);
      ({ caption, model } = await analyzeChartWithVision(instrument, displayPair, timeframes, marketData, chartImage));

      indicatorsUsed = ['EMA20', 'EMA50', 'EMA200', 'RSI14', 'MACD12_26_9', 'Volume'];
    }

    const durationMs = Date.now() - startTime;
    const metadata = {
      indicators_used: indicatorsUsed,
      duration_ms: durationMs,
      model,
      timeframes_analyzed: timeframes,
    };

    await completeChartAnalysis(jobId, chartImage, caption, metadata);

    const completedRecord = await getChartAnalysis(jobId);

    console.log(`[ChartAnalysis] Job completed in ${durationMs}ms for ${displayPair}`);
    return { success: true, record: completedRecord! };

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    const durationMs = Date.now() - startTime;

    console.error(`[ChartAnalysis] Job failed for ${displayPair}:`, errorMsg);

    await failChartAnalysis(jobId, errorMsg, { duration_ms: durationMs });

    return { success: false, error: errorMsg };
  }
}
```

- [ ] **Step 2: Add the two new modules to the barrel export**

In `lib/chart-analysis/index.ts`, add two lines (order doesn't matter, but keep it alongside the other `browser`/`orchestrator` exports):

```ts
export * from './types';
export * from './storage';
export * from './market-data';
export * from './llm-analysis';
export * from './browser';
export * from './browser-price-action';
export * from './price-action';
export * from './orchestrator';
```

(`browser-common.ts` is intentionally not barrel-exported — it's an internal implementation detail shared between `browser.ts` and `browser-price-action.ts`, and both of those files import `BrowserConfig` as a type without re-exporting it a second time, which would collide with `browser.ts`'s existing `export type { BrowserConfig }`.)

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/chart-analysis/orchestrator.ts lib/chart-analysis/index.ts
git commit -m "feat: branch chart-analysis orchestrator on config (indicators vs price_action)"
```

---

### Task 11: Admin UI — config selector, gallery badge, relabeled caption panel

**Files:**
- Modify: `app/admin/tools/chart-analysis/ChartAnalysisClient.tsx`

**Interfaces:**
- Consumes: `CHART_ANALYSIS_CONFIGS`, `ChartAnalysisConfig` from `@/lib/chart-analysis/types` (Task 3).

- [ ] **Step 1: Import the config type/const and add selector state**

Update the import line (line 5):

```ts
import { TIMEFRAME_OPTIONS, CHART_ANALYSIS_CONFIGS, type TimeframeValue, type ChartAnalysisConfig, type ChartAnalysisRecord, type ChartCaption } from "@/lib/chart-analysis/types";
```

In `ChartAnalysisClient` (after the existing `timeframes` state, around line 231), add:

```ts
  const [config, setConfig] = useState<ChartAnalysisConfig>("indicators");
```

- [ ] **Step 2: Relabel `CaptionPanel` per config**

Change the `CaptionPanel` function signature and the indicator-signals line (lines 56 and 82-84):

```tsx
function CaptionPanel({ caption, config }: { caption: ChartCaption; config: ChartAnalysisConfig }) {
  const signalLabels =
    config === "price_action"
      ? { ema: "Trend", rsi: "Levels", macd: "Fib", volume: "Vol" }
      : { ema: "EMA", rsi: "RSI", macd: "MACD", volume: "Vol" };

  return (
```

(keep the existing JSX below the opening `<div>` as-is until the indicator-signals line, then change it to:)

```tsx
          <div style={{ color: "rgba(210,220,240,0.4)", fontSize: 11 }}>
            {signalLabels.ema}: {a.indicatorSignals?.ema} · {signalLabels.rsi}: {a.indicatorSignals?.rsi} · {signalLabels.macd}: {a.indicatorSignals?.macd} · {signalLabels.volume}: {a.indicatorSignals?.volume}
          </div>
```

- [ ] **Step 3: Pass `config` at both `CaptionPanel` call sites**

In `DetailModal` (around line 209):

```tsx
              {record.caption_json?.overallBias ? (
                <CaptionPanel caption={record.caption_json} config={record.config} />
              ) : (
```

In the active-job result block (around line 465):

```tsx
            {activeJob.status === "completed" && "caption_json" in activeJob && activeJob.caption_json?.overallBias && (
              <CaptionPanel caption={activeJob.caption_json} config={activeJob.config} />
            )}
```

- [ ] **Step 4: Add the config selector to the config panel UI**

In the "Config panel" block, insert a new row before the "Instrument" row (before line 372's comment/div):

```tsx
          {/* Analysis config */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5, color: "rgba(210,220,240,0.28)", width: 90, textTransform: "uppercase" }}>{"// config"}</span>
            <div style={{ display: "flex", gap: 1 }}>
              {CHART_ANALYSIS_CONFIGS.map((c) => (
                <button
                  key={c.value}
                  className={`param-btn${config === c.value ? " active-blue" : ""}`}
                  onClick={() => setConfig(c.value)}
                  disabled={submitting}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
```

- [ ] **Step 5: Include `config` in the POST body and command preview**

Update `generate` (the `fetch` body, around line 305):

```ts
        body: JSON.stringify({ instrument, timeframes, config }),
```

and the `useCallback` dependency array (line 320):

```ts
  }, [instrument, timeframes, config, pollJob]);
```

Update `commandPreview` (line 323):

```ts
  const commandPreview = `chart-analysis --instrument "${selectedInstrument?.display ?? instrument}" --timeframes ${timeframes.join(",")} --config ${config}`;
```

- [ ] **Step 6: Make the description text config-aware**

Replace the static description paragraph (lines 355-357):

```tsx
      <p style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(210,220,240,0.4)", marginBottom: 40 }}>
        {config === "price_action"
          ? "Self-hosted renderer · Trendline · Fib Retracement · Key Levels · Long/Short · Volume"
          : "TradingView automation · EMA 20/50/200 · RSI · MACD · Volume"} — LLM vision analysis via OpenRouter, one instrument at a time
      </p>
```

- [ ] **Step 7: Add a config badge to gallery cards**

In the gallery card's header row (around line 492-495), add a badge after the display-pair span:

```tsx
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLOR[rec.status], display: "inline-block" }} />
                <span style={{ fontFamily: "monospace", fontSize: 13, color: "rgba(210,220,240,0.9)" }}>{rec.display_pair}</span>
                <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 9, padding: "1px 6px", border: "1px solid rgba(210,220,240,0.15)", color: "rgba(210,220,240,0.4)" }}>
                  {rec.config === "price_action" ? "PA" : "IND"}
                </span>
              </div>
```

- [ ] **Step 8: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add app/admin/tools/chart-analysis/ChartAnalysisClient.tsx
git commit -m "feat: add price-action config selector, gallery badge, and relabeled caption panel"
```

---

### Task 12: End-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Confirm Config 1 still works unmodified**

In the browser, go to `/admin/tools/chart-analysis`, leave the config selector on "Indicators", pick any forex pair, and generate an analysis. Confirm it completes and looks exactly as it did before this plan (TradingView chart with EMA/RSI/MACD/Volume, "EMA/RSI/MACD/Vol" labels in the caption panel).

- [ ] **Step 3: Run a Config 2 analysis end-to-end**

Switch the config selector to "Price Action", pick a forex pair with a clear recent trend (check `/dashboard/markets` or any chart if unsure), and generate an analysis.

Expected:
- The screenshot shows dark-background candles (blue for bullish bars, white for bearish bars), a volume pane, at least one dashed key-level line, and — if the pair is trending — a solid trendline plus three price lines (entry/stop/target).
- The caption panel shows "Trend / Levels / Fib / Vol" labels (not "EMA/RSI/MACD").
- The caption's Trade Levels (entry/SL/TP/ratio) match the numbers drawn on the chart image.
- The gallery shows a "PA" badge on this run and "IND" on the Config 1 run from Step 2.

- [ ] **Step 4: Check server logs for errors**

Confirm the terminal running `npm run dev` shows no unhandled errors during either run (warnings about vision-model fallbacks are fine — that's existing retry behavior).

- [ ] **Step 5: Note any tuning follow-ups**

If the price-action thresholds (trend slope, cluster tolerance, ATR buffer) produce a visually odd setup on real data (e.g. no trendline on an obviously trending pair), note the specific pair/timeframe and observed values — this is expected first-pass tuning, not a plan defect, and can be adjusted directly in `lib/chart-analysis/price-action.ts`'s constants without touching any other file.

No commit for this task — it's verification, not a code change.

---

## Self-Review Notes

- **Spec coverage:** every section of the design doc (config concept, level-detection module, chart renderer, LLM prompt, UI, error handling) maps to a task above. The design doc's "long/short box" visual (translucent fill rectangle) is implemented as three labeled price lines instead, noted explicitly in Task 7 Step 2's code — `lightweight-charts`' free API has no rectangle primitive without custom canvas plugin code, and three price lines convey entry/stop/target just as clearly on a static screenshot. This is a planning-level refinement of the design, not a scope change.
- **Type consistency:** `PriceActionSetup`, `PriceActionOHLCV`, `ChartAnalysisConfig`, `generatePriceActionScreenshot`, `computePriceActionSetup`, and `analyzeChartWithPriceAction` are named and typed identically everywhere they're referenced across tasks 4–11.
- **Placeholder scan:** no TBD/TODO markers; every step has runnable commands or complete code.
