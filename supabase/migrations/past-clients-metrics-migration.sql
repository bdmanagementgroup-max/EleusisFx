-- Add trading metric columns to past_clients
-- Safe to re-run (IF NOT EXISTS on each column)

ALTER TABLE past_clients
  ADD COLUMN IF NOT EXISTS phase         int      DEFAULT 1,
  ADD COLUMN IF NOT EXISTS phase_status  text     DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS balance       numeric,
  ADD COLUMN IF NOT EXISTS equity        numeric,
  ADD COLUMN IF NOT EXISTS daily_drawdown numeric,
  ADD COLUMN IF NOT EXISTS max_drawdown  numeric,
  ADD COLUMN IF NOT EXISTS profit_target numeric,
  ADD COLUMN IF NOT EXISTS profit_goal   numeric  DEFAULT 10,
  ADD COLUMN IF NOT EXISTS days_used     int,
  ADD COLUMN IF NOT EXISTS days_allowed  int      DEFAULT 30;

-- Back-fill phase_status from existing challenge_result where known
UPDATE past_clients
SET phase_status = CASE
  WHEN LOWER(challenge_result) = 'passed' THEN 'passed'
  WHEN LOWER(challenge_result) = 'failed' THEN 'failed'
  ELSE 'unknown'
END
WHERE phase_status = 'unknown' AND challenge_result IS NOT NULL;

NOTIFY pgrst, 'reload schema';
