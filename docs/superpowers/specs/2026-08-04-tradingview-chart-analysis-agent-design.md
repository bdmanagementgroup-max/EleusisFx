# TradingView Chart Analysis Agent - Design Specification

**Date**: 2026-08-04
**Project**: EleusisFx
**Feature**: Automated Technical Chart Analysis for Social Media

---

## 1. Overview

### Purpose
Build an agent that navigates to TradingView charts via browser automation, applies technical indicators and drawings, captures annotated charts, and generates structured analysis captions for social media posting. One instrument at a time, manually triggered via admin UI.

### Success Criteria
- Admin can select any of 16 instruments (12 forex + 4 crypto) and generate a finished chart + caption
- Chart shows comprehensive multi-timeframe technical analysis with indicators and key levels drawn
- Caption is structured JSON ready for social media posting (bias, key levels, reasoning, risk/reward)
- Outputs stored in database, downloadable via admin UI
- Uses existing EleusisFx branding on charts

---

## 2. Architecture

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      Admin UI (/admin/tools)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Chart Analysis Tool                                    │   │
│  │  - Instrument selector (16 instruments)                 │   │
│  │  - Timeframe selector (4H, 1D, 1W)                      │   │
│  │  - "Generate Analysis" button                           │   │
│  │  - Gallery of past generations with download            │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/admin/chart-analysis
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Route (/api/admin/chart-analysis)        │
│  - Validates request, checks auth                               │
│  - Spawns background job (or runs with extended timeout)        │
│  - Returns job ID for polling                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Chart Analysis Engine (lib/chart-analysis)   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Playwright      │  │ Market Data     │  │ LLM Analysis    │  │
│  │ Automation      │  │ Fetcher         │  │ Client          │  │
│  │ - Navigate TV   │  │ - Yahoo Finance │  │ - OpenRouter    │  │
│  │ - Apply indicators│  │ - Calculate   │  │ - Vision + text │  │
│  │ - Draw levels   │  │   indicators    │  │ - Structured    │  │
│  │ - Screenshot    │  │                 │  │   output        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Storage                              │
│  - chart_analyses table:                                        │
│    - id, instrument, timeframes, status, created_at            │
│    - chart_image (bytea or storage bucket ref)                 │
│    - caption_json (JSONB)                                       │
│    - metadata (indicators_used, duration_ms, model_used)       │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow
1. Admin selects instrument + timeframes → clicks "Generate"
2. API creates `chart_analyses` record with `status: 'processing'`
3. Background job runs Playwright automation:
   - Launches headless browser
   - Navigates to `https://tradingview.com/chart/?symbol=INSTRUMENT`
   - Waits for chart load, applies indicators (EMA 20/50/200, RSI, MACD, Volume)
   - Draws key levels (support/resistance from recent swings, trend lines)
   - Captures high-res screenshot (1920x1080 or higher)
4. Fetches OHLCV data for the instrument (Yahoo Finance) for all selected timeframes
5. LLM (vision-capable model via OpenRouter) analyzes:
   - Chart screenshot (visual analysis of drawn elements)
   - Market data (calculated indicator values, price action)
   - Produces structured JSON caption
6. Updates database record with image + caption + `status: 'completed'`
7. Admin UI polls for completion, shows in gallery with download buttons

---

## 3. Technical Specifications

### 3.1 Database Schema

```sql
-- New table for chart analyses
CREATE TABLE chart_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument TEXT NOT NULL,           -- e.g., 'EURUSD', 'BTCUSD'
  timeframes TEXT[] NOT NULL,         -- e.g., ['4H', '1D', '1W']
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  chart_image BYTEA,                  -- PNG image data (or use storage bucket)
  caption_json JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',        -- indicators_used, duration_ms, model, error
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- RLS: authenticated users can read, admins can insert/update
ALTER TABLE chart_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage chart analyses" ON chart_analyses
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Authenticated users can view completed analyses" ON chart_analyses
  FOR SELECT USING (auth.role() = 'authenticated' AND status = 'completed');
```

### 3.2 Caption JSON Structure

```typescript
interface ChartCaption {
  instrument: string;
  generatedAt: string;           // ISO timestamp
  timeframes: string[];
  overallBias: 'bullish' | 'bearish' | 'neutral';
  confidence: number;            // 0-100
  keyLevels: {
    support: number[];
    resistance: number[];
    pivotPoints: number[];
  };
  timeframeAnalysis: {
    [timeframe: string]: {
      trend: 'up' | 'down' | 'sideways';
      bias: 'bullish' | 'bearish' | 'neutral';
      keyObservations: string[];
      indicatorSignals: {
        ema: string;
        rsi: string;
        macd: string;
        volume: string;
      };
    };
  };
  riskReward: {
    entry: number;
    stopLoss: number;
    takeProfit: number[];
    ratio: number;
  };
  reasoning: string;             // Narrative explanation for caption
  disclaimer: string;            // Standard financial disclaimer
  hashtags: string[];            // For social posting
}
```

### 3.3 Playwright Automation Details

**TradingView URL Pattern**: `https://www.tradingview.com/chart/?symbol=TVC:INSTRUMENT`

**Indicators to Apply** (via TradingView UI automation):
- EMA 20, 50, 200 (Exponential Moving Averages)
- RSI (14)
- MACD (12, 26, 9)
- Volume

**Drawing Tools** (via TradingView drawing toolbar):
- Horizontal lines at recent swing highs/lows (support/resistance)
- Trend lines connecting higher lows / lower highs
- Fibonacci retracement (optional, from recent significant move)

**Screenshot Settings**:
- Viewport: 1920x1080 minimum
- Device scale factor: 2 (for retina quality)
- Format: PNG
- Full page: false (chart area only)

### 3.4 LLM Analysis Prompt

**Model**: Vision-capable model via OpenRouter (e.g., `google/gemini-2.5-flash`, `anthropic/claude-3.5-sonnet`)

**Input**:
- Chart screenshot (base64 encoded)
- Market data JSON (OHLCV + calculated indicators for each timeframe)
- Instrument symbol and timeframes

**Output**: Structured JSON matching `ChartCaption` interface

---

## 4. Admin UI Specification

### Location
New section in `/admin/tools/` - "Chart Analysis"

### Components
1. **Generator Form**:
   - Instrument dropdown (16 options from `lib/agent-bias/instruments.ts`)
   - Timeframe multi-select: 4H, 1D, 1W (default: all three)
   - "Generate Analysis" button (disabled while processing)
   - Status indicator (pending/processing/completed/failed)

2. **Gallery**:
   - Grid of completed analyses (newest first)
   - Each card shows: instrument, timeframes, bias badge, generated date, thumbnail
   - Actions: Download Chart (PNG), Download Caption (JSON), View Full Analysis

3. **Analysis Detail Modal**:
   - Full-size chart image
   - Formatted caption (rendered from JSON)
   - Copy caption button (for social posting)
   - Metadata panel (model used, duration, indicators applied)

---

## 5. Integration Points

### Existing Code Reuse
- **Instruments**: `lib/agent-bias/instruments.ts` - `FOREX_PAIRS` + `CRYPTO_PAIRS`
- **LLM Client**: `lib/agent-bias/llmClient.ts` pattern - OpenRouter via Vercel AI Gateway
- **Admin Auth**: Existing admin middleware pattern
- **Database**: Supabase client from `lib/supabase/`
- **Playwright**: Already in project (`.playwright-mcp/` directory exists)

### New Files to Create
```
lib/chart-analysis/
  ├── index.ts              # Main exports
  ├── browser.ts            # Playwright automation
  ├── market-data.ts        # Yahoo Finance fetch + indicator calc
  ├── llm-analysis.ts       # LLM vision analysis
  ├── storage.ts            # Supabase insert/update
  └── types.ts              # TypeScript interfaces

app/api/admin/chart-analysis/
  ├── route.ts              # POST (trigger), GET (list)
  └── [id]/route.ts         # GET (detail), DELETE

app/admin/tools/chart-analysis/
  ├── page.tsx              # Main tool page
  ├── ChartAnalysisForm.tsx
  ├── ChartGallery.tsx
  └── AnalysisDetailModal.tsx
```

---

## 6. Error Handling

| Scenario | Handling |
|----------|----------|
| TradingView blocked/bot detection | Retry with different user agent, longer delays; fallback to data-driven rendering |
| Playwright timeout | Max 5 min per run; mark job failed with error |
| LLM API error | Retry with fallback model; mark failed if all fail |
| Database insert fails | Log error, return 500, admin can retry |
| Chart load fails | Wait for network idle, retry once, then fail |

---

## 7. Security Considerations

- Admin-only access (existing admin middleware)
- CRON_SECRET not needed (manual trigger only)
- TradingView credentials NOT stored (public charts only)
- Rate limiting: max 5 concurrent generations per admin
- Sanitize all outputs before rendering in UI

---

## 8. Testing Strategy

1. **Unit Tests**: Market data fetching, indicator calculations, caption JSON validation
2. **Integration Tests**: Playwright automation against TradingView (mocked), LLM analysis with fixture images
3. **E2E Test**: Full flow from admin UI → API → automation → database → gallery display
4. **Manual Verification**: Generate charts for 2-3 instruments, verify quality

---

## 9. Future Enhancements (Out of Scope)

- Scheduled/cron-based generation
- Video recording of analysis process
- Multi-instrument batch generation
- Direct social media posting (Twitter/X, LinkedIn API)
- Custom indicator configurations per instrument
- Alerting when key levels are tested

---

## 10. Implementation Phases

1. **Phase 1**: Database migration + types + storage utilities
2. **Phase 2**: Playwright browser automation (navigate, apply indicators, draw, screenshot)
3. **Phase 3**: Market data fetching + indicator calculations
4. **Phase 4**: LLM vision analysis + caption generation
5. **Phase 5**: API route + background job handling
6. **Phase 6**: Admin UI (form, gallery, detail modal)
7. **Phase 7**: Integration testing + polish