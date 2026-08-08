-- Adds the config column to distinguish chart-analysis pipelines
-- (indicators = TradingView embed + EMA/RSI/MACD; price_action = self-hosted
-- trendline/fib/key-levels/long-short/volume). Existing rows default to
-- 'indicators' so history stays attributed to Config 1.
-- Run in Supabase SQL Editor

ALTER TABLE chart_analyses
  ADD COLUMN IF NOT EXISTS config text NOT NULL DEFAULT 'indicators'
  CHECK (config IN ('indicators', 'price_action'));

NOTIFY pgrst, 'reload schema';
