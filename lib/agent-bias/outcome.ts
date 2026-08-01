import { getSupabaseAdminClient } from "@/lib/supabase/server";

const HOLD_TRADING_DAYS = 5;
const HOLD_FLAT_THRESHOLD_PCT = 1; // for Hold ratings: "correct" if |move| stays under this

interface DailyClose {
  timestamp: number;
  close: number;
}

async function fetchYahooDailyCloses(symbol: string): Promise<DailyClose[] | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1y`;
    const res = await fetch(url, { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    const timestamps: number[] = result?.timestamp ?? [];
    const closes: number[] = result?.indicators?.quote?.[0]?.close ?? [];
    const out: DailyClose[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] != null) out.push({ timestamp: timestamps[i], close: closes[i] });
    }
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

// Buy/Overweight expect the price to rise; Sell/Underweight expect it to
// fall; Hold is graded "correct" if price stayed roughly flat rather than
// moving decisively either way.
function directionMatchesRating(rating: string, pctMove: number): boolean {
  if (rating === "Buy" || rating === "Overweight") return pctMove > 0;
  if (rating === "Sell" || rating === "Underweight") return pctMove < 0;
  return Math.abs(pctMove) < HOLD_FLAT_THRESHOLD_PCT;
}

export async function resolvePendingOutcomes(): Promise<{ resolved: number }> {
  const supabase = await getSupabaseAdminClient();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - HOLD_TRADING_DAYS - 2); // small buffer for weekends
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const { data: pending } = await supabase
    .from("agent_bias")
    .select("id, instrument, rating, run_date")
    .eq("outcome", "pending")
    .lte("run_date", cutoffStr);

  if (!pending || pending.length === 0) return { resolved: 0 };

  let resolved = 0;
  for (const row of pending) {
    const closes = await fetchYahooDailyCloses(row.instrument);
    if (!closes) continue;

    const runDateMs = new Date(row.run_date).getTime() / 1000;
    const startIdx = closes.findIndex((c) => c.timestamp >= runDateMs);
    if (startIdx === -1 || startIdx + HOLD_TRADING_DAYS >= closes.length) continue; // not enough data yet, retry next run

    const startClose = closes[startIdx].close;
    const endClose = closes[startIdx + HOLD_TRADING_DAYS].close;
    const pctMove = ((endClose - startClose) / startClose) * 100;
    const outcome = directionMatchesRating(row.rating, pctMove) ? "correct" : "incorrect";

    await supabase
      .from("agent_bias")
      .update({ outcome, outcome_checked_at: new Date().toISOString() })
      .eq("id", row.id);
    resolved++;
  }

  return { resolved };
}
