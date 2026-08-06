-- Chart Analysis Agent — stores generated TradingView chart analyses with captions
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS chart_analyses (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at         timestamptz DEFAULT now(),
  completed_at       timestamptz,
  instrument         text        NOT NULL,   -- canonical Yahoo symbol, e.g. EURUSD=X
  display_pair       text        NOT NULL,   -- EUR/USD
  timeframes         text[]      NOT NULL,   -- ['4H', '1D', '1W']
  status             text        NOT NULL DEFAULT 'pending',  -- pending | processing | completed | failed
  chart_image        bytea,                  -- PNG image data
  caption_json       jsonb       NOT NULL DEFAULT '{}',
  metadata           jsonb       DEFAULT '{}',  -- indicators_used, duration_ms, model, error
  created_by         uuid        REFERENCES auth.users(id)
);

ALTER TABLE chart_analyses ENABLE ROW LEVEL SECURITY;

-- Admins: full access (service role bypasses RLS anyway, but explicit for clarity)
CREATE POLICY "Admins can manage chart_analyses" ON chart_analyses
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Authenticated users: read only completed analyses
CREATE POLICY "Authenticated users read completed chart_analyses" ON chart_analyses
  FOR SELECT TO authenticated
  USING (status = 'completed');

-- Index for faster gallery queries
CREATE INDEX IF NOT EXISTS idx_chart_analyses_created_at_desc ON chart_analyses (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chart_analyses_status ON chart_analyses (status);

NOTIFY pgrst, 'reload schema';