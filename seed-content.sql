-- ============================================================
-- Run this in Supabase SQL Editor
-- Seeds: articles, resources, and adds challenge_result column
-- ============================================================

-- 1. Add challenge_result column to past_clients
ALTER TABLE past_clients ADD COLUMN IF NOT EXISTS challenge_result text;

-- 2. Seed articles (3 hardcoded fallback articles)
INSERT INTO articles (slug, title, excerpt, category, content, published, published_at, read_time)
VALUES
  (
    'what-is-an-ftmo-challenge',
    'What Is an FTMO Challenge and How Does It Work?',
    'A complete breakdown of the FTMO evaluation process — phases, rules, drawdown limits, and what you need to know before starting your challenge.',
    'Prop Firms',
    'A complete breakdown of the FTMO evaluation process — phases, rules, drawdown limits, and what you need to know before starting your challenge.',
    true,
    '2025-06-01T00:00:00Z',
    8
  ),
  (
    'why-traders-fail-prop-firm-evaluation',
    'Why Most Traders Fail Their Prop Firm Evaluation',
    'The three most common reasons traders get disqualified — and how professional evaluation services eliminate these risks entirely.',
    'Strategy',
    'The three most common reasons traders get disqualified — and how professional evaluation services eliminate these risks entirely.',
    true,
    '2025-05-01T00:00:00Z',
    7
  ),
  (
    'ftmo-vs-true-forex-funds',
    'FTMO vs True Forex Funds: Which Prop Firm Is Right for You?',
    'A side-by-side comparison of the two most popular prop firms — fees, rules, payout structures, and which suits different trading styles.',
    'Funding',
    'A side-by-side comparison of the two most popular prop firms — fees, rules, payout structures, and which suits different trading styles.',
    true,
    '2025-04-01T00:00:00Z',
    9
  )
ON CONFLICT (slug) DO NOTHING;

-- 3. Seed resources
INSERT INTO resources (category, title, url, description, active)
VALUES
  ('Prop Firm Comparison Guides', 'FTMO vs True Forex Funds', '/articles/ftmo-vs-true-forex-funds', 'Side-by-side comparison of rules, profit splits, fees, and payout structures.', true),
  ('Prop Firm Comparison Guides', 'What Is an FTMO Challenge?', '/articles/what-is-an-ftmo-challenge', 'Complete breakdown of phases, rules, drawdown limits, and evaluation structure.', true),
  ('Prop Firm Comparison Guides', 'Why Traders Fail Evaluations', '/articles/why-traders-fail-prop-firm-evaluation', 'The three most common failure patterns and how to avoid them.', true),
  ('Trading Tools & Calculators', 'Position Size Calculator', '/resources/position-size-calculator', 'Calculate your lot size based on account balance, risk %, and stop loss pips.', true),
  ('Trading Tools & Calculators', 'Risk/Reward Calculator', '/resources/risk-reward-calculator', 'Quickly calculate R:R ratios and potential profit vs. loss for any trade.', true),
  ('Trading Tools & Calculators', 'Drawdown Tracker', '/resources/drawdown-tracker', 'Track your daily and max drawdown against FTMO limits in real-time.', true),
  ('Downloadable Guides', '5 Fatal Mistakes Guide (PDF)', '/#free-guide', 'The most common prop firm evaluation mistakes — and exactly how to avoid them.', true);
