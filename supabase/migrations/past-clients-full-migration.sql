-- past_clients: add all columns needed by the admin edit form + overview page
-- Safe to re-run (IF NOT EXISTS on every column)

ALTER TABLE past_clients
  ADD COLUMN IF NOT EXISTS prop_firm      text,
  ADD COLUMN IF NOT EXISTS phase          int       DEFAULT 1,
  ADD COLUMN IF NOT EXISTS phase_status   text      DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS balance        numeric,
  ADD COLUMN IF NOT EXISTS equity         numeric,
  ADD COLUMN IF NOT EXISTS daily_drawdown numeric,
  ADD COLUMN IF NOT EXISTS max_drawdown   numeric,
  ADD COLUMN IF NOT EXISTS profit_target  numeric,
  ADD COLUMN IF NOT EXISTS profit_goal    numeric   DEFAULT 10,
  ADD COLUMN IF NOT EXISTS days_used      int,
  ADD COLUMN IF NOT EXISTS days_allowed   int       DEFAULT 30;

-- Back-fill phase_status from challenge_result where not already set
UPDATE past_clients
SET phase_status = CASE
  WHEN LOWER(challenge_result) = 'passed' THEN 'passed'
  WHEN LOWER(challenge_result) = 'failed' THEN 'failed'
  ELSE 'unknown'
END
WHERE (phase_status IS NULL OR phase_status = 'unknown')
  AND challenge_result IS NOT NULL;

NOTIFY pgrst, 'reload schema';
