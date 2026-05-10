import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface APIUsageLog {
  service: string;
  endpoint?: string;
  method?: string;
  cost: number;
  tokens_input?: number;
  tokens_output?: number;
  status: 'success' | 'error' | 'rate_limited';
  error_message?: string;
  request_duration_ms?: number;
  user_id?: string;
  session_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Log API usage to Supabase for cost tracking
 * Usage: await logAPIUsage({ service: 'anthropic', tokens_input: 1500, tokens_output: 800, cost: 0.027 })
 */
export async function logAPIUsage(log: APIUsageLog): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from('api_usage_log').insert({
      ...log,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to log API usage:', error);
      // Don't throw - we don't want cost tracking to break the main API
    }
  } catch (err) {
    console.error('Error in logAPIUsage:', err);
    // Silent fail - cost tracking shouldn't impact user experience
  }
}

/**
 * Calculate cost for Anthropic API calls
 * Pricing as of May 2026:
 * - Claude Opus 4.7: $3/1M input, $15/1M output
 * - Claude Sonnet 4.6: $3/1M input, $15/1M output (new, testing)
 * - Claude Haiku: $0.80/1M input, $4/1M output
 * Conversion: £1 = ~$1.25 (approximate)
 */
export function calculateAnthropicCost(
  inputTokens: number,
  outputTokens: number,
  model: 'opus' | 'sonnet' | 'haiku' = 'opus'
): number {
  const pricing = {
    opus: { input: 3 / 1_000_000, output: 15 / 1_000_000 }, // $ per token
    sonnet: { input: 3 / 1_000_000, output: 15 / 1_000_000 }, // Same as Opus
    haiku: { input: 0.8 / 1_000_000, output: 4 / 1_000_000 },
  };

  const usdCost =
    inputTokens * pricing[model].input + outputTokens * pricing[model].output;

  // Convert USD to GBP (approximate rate)
  const gbpCost = usdCost / 1.25;

  return parseFloat(gbpCost.toFixed(6));
}

/**
 * Calculate cost for Stripe transactions
 * Standard: 1.4% + 20p
 */
export function calculateStripeCost(amountGBP: number): number {
  return amountGBP * 0.014 + 0.2;
}

/**
 * Get cost summary for a given date range
 */
export async function getCostSummary(
  startDate: Date,
  endDate: Date
): Promise<{
  [service: string]: {
    callCount: number;
    totalCost: number;
    avgCost: number;
  };
}> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('api_usage_log')
      .select('service, cost')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    const summary: {
      [service: string]: {
        callCount: number;
        totalCost: number;
        avgCost: number;
      };
    } = {};

    data?.forEach((row: any) => {
      if (!summary[row.service]) {
        summary[row.service] = { callCount: 0, totalCost: 0, avgCost: 0 };
      }
      summary[row.service].callCount += 1;
      summary[row.service].totalCost += row.cost;
    });

    // Calculate averages
    Object.keys(summary).forEach((service) => {
      summary[service].avgCost = summary[service].totalCost / summary[service].callCount;
    });

    return summary;
  } catch (err) {
    console.error('Error getting cost summary:', err);
    return {};
  }
}
