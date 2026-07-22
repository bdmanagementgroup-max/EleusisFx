-- Nightly multi-agent directional bias — one row per instrument per night
-- Supplementary to trading_signals; run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS agent_bias (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at         timestamptz DEFAULT now(),
  run_date           date        NOT NULL,
  instrument         text        NOT NULL,   -- canonical Yahoo symbol, e.g. EURUSD=X
  display_pair       text        NOT NULL,   -- EUR/USD
  rating             text        NOT NULL,   -- Buy | Overweight | Hold | Underweight | Sell
  executive_summary  text        NOT NULL,
  bull_case          text,
  bear_case          text,
  trader_action      text,                   -- Buy | Hold | Sell
  entry_price        numeric,
  stop_loss          numeric,
  position_sizing    text,
  full_debate        jsonb,                  -- per-role transcript, for admin review + transparency
  status             text        NOT NULL DEFAULT 'pending_review',  -- pending_review | published | rejected
  reviewed_by        uuid        REFERENCES auth.users(id),
  reviewed_at        timestamptz,
  outcome            text        DEFAULT 'pending',  -- pending | correct | incorrect
  outcome_checked_at timestamptz,
  UNIQUE (run_date, instrument)
);

ALTER TABLE agent_bias ENABLE ROW LEVEL SECURITY;

-- Clients (and the public dashboard read) only ever see published rows.
-- Admin reads/writes go through the service-role client, which bypasses RLS
-- entirely — see every existing admin route in this repo — so no admin
-- policy is needed here.
CREATE POLICY "Clients read published agent_bias" ON agent_bias
  FOR SELECT USING (status = 'published');

NOTIFY pgrst, 'reload schema';
