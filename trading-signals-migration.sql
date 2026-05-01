-- Individual trading signals — one row per signal produced by the agent
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS trading_signals (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   timestamptz DEFAULT now(),
  session_id   uuid        NOT NULL,   -- groups all signals from one analysis run
  session      text        NOT NULL,   -- London | New York | Asian | Overlap
  focus        text        NOT NULL,   -- all | forex | crypto
  news_level   text        NOT NULL,   -- none | light | major
  pair         text        NOT NULL,   -- EUR/USD
  direction    text        NOT NULL,   -- BUY | SELL
  bias         text,                   -- Bullish | Bearish
  timeframe    text,                   -- Daily → London
  confluence   text,                   -- JSON array of bullet strings
  setup_detail text,
  entry_price  text,
  stop_loss    text,
  tp1          text,
  tp2          text,
  risk_reward  text,
  invalidation text,
  content      text        NOT NULL    -- full raw signal block for reference
);

ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;
