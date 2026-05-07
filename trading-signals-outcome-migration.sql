-- Signal Outcome Tracker — run in Supabase SQL Editor
-- Safe to re-run: uses IF NOT EXISTS / idempotent ALTER TABLE pattern

ALTER TABLE trading_signals
  ADD COLUMN IF NOT EXISTS outcome     text    DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS outcome_pnl numeric;

-- outcome values: pending | won | lost | invalidated
-- outcome_pnl: optional R:R or pips, stored as a number
