-- Trade Reviews table — stores Claude-narrated review reports
CREATE TABLE IF NOT EXISTS trade_reviews (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      timestamptz DEFAULT now(),
  content         text        NOT NULL,
  signals_reviewed int        DEFAULT 0,
  won             int         DEFAULT 0,
  lost            int         DEFAULT 0,
  pending         int         DEFAULT 0,
  skipped         int         DEFAULT 0
);

ALTER TABLE trade_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access" ON trade_reviews FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
