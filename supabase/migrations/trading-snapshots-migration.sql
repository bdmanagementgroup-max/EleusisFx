-- Trading analysis snapshots
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS trading_snapshots (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  session     text        NOT NULL,
  focus       text        NOT NULL,
  news_level  text        NOT NULL,
  content     text        NOT NULL
);

-- Admin-only: no public RLS needed (accessed via service role key)
ALTER TABLE trading_snapshots ENABLE ROW LEVEL SECURITY;
