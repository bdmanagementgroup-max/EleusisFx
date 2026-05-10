-- Create api_usage_log table for tracking API costs
CREATE TABLE IF NOT EXISTS api_usage_log (
  id BIGSERIAL PRIMARY KEY,
  service TEXT NOT NULL, -- 'anthropic', 'twelve_data', 'coingecko', 'stripe', etc.
  endpoint TEXT,         -- e.g. '/api/trading-analysis', '/api/market/forex'
  method TEXT,           -- 'GET', 'POST', etc.
  cost DECIMAL(10, 4),   -- Cost in GBP
  tokens_input INTEGER,  -- Input tokens (for LLM APIs)
  tokens_output INTEGER, -- Output tokens (for LLM APIs)
  status TEXT,           -- 'success', 'error', 'rate_limited'
  error_message TEXT,    -- Error details if failed
  request_duration_ms INTEGER, -- Response time in milliseconds
  user_id TEXT,          -- User ID if available
  session_id TEXT,       -- Session/request tracking
  metadata JSONB,        -- Additional metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_api_usage_service ON api_usage_log(service);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage_log(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_service_created ON api_usage_log(service, created_at DESC);

-- Create a view for monthly cost summary
CREATE OR REPLACE VIEW monthly_cost_summary AS
SELECT
  DATE_TRUNC('month', created_at)::DATE as month,
  service,
  COUNT(*) as call_count,
  SUM(cost) as total_cost,
  ROUND(AVG(cost::numeric), 4) as avg_cost,
  SUM(COALESCE(tokens_input, 0)) as total_input_tokens,
  SUM(COALESCE(tokens_output, 0)) as total_output_tokens,
  ROUND(AVG(request_duration_ms::numeric), 0) as avg_response_time_ms,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count
FROM api_usage_log
GROUP BY DATE_TRUNC('month', created_at), service
ORDER BY month DESC, service;

-- Create a view for daily cost trend
CREATE OR REPLACE VIEW daily_cost_trend AS
SELECT
  DATE(created_at) as date,
  service,
  COUNT(*) as call_count,
  SUM(cost) as daily_cost,
  SUM(COALESCE(tokens_input, 0)) as total_input_tokens,
  SUM(COALESCE(tokens_output, 0)) as total_output_tokens
FROM api_usage_log
GROUP BY DATE(created_at), service
ORDER BY date DESC, service;

-- Enable Row Level Security (optional, for multi-tenant safety)
-- ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all logs
-- CREATE POLICY "Admins can view all api usage" ON api_usage_log
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM auth.users
--       WHERE auth.users.id = auth.uid()
--       AND auth.users.raw_app_meta_data->>'role' = 'admin'
--     )
--   );
