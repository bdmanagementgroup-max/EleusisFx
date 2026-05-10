import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface DailyCostEntry {
  date: string;
  service: string;
  call_count: number;
  daily_cost: number;
  total_input_tokens: number;
  total_output_tokens: number;
}

interface MonthlyCostEntry {
  month: string;
  service: string;
  call_count: number;
  total_cost: number;
  avg_cost: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_response_time_ms: number;
  error_count: number;
}

export async function GET(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verify admin access
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const view = searchParams.get("view") || "monthly"; // "daily" or "monthly"
  const month = searchParams.get("month"); // e.g. "2026-05" for May 2026
  const service = searchParams.get("service"); // Filter by service

  try {
    if (view === "daily") {
      return getDailyCosts(supabase, service);
    } else {
      return getMonthlyCosts(supabase, month, service);
    }
  } catch (err) {
    console.error("[Cost Summary] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch cost summary" },
      { status: 500 }
    );
  }
}

async function getDailyCosts(supabase: any, service?: string | null) {
  let query = supabase.from("daily_cost_trend").select("*").order("date", { ascending: false }).limit(90);

  if (service) {
    query = query.eq("service", service);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Calculate totals
  const totalByDate = new Map<string, number>();
  (data as DailyCostEntry[]).forEach((entry) => {
    const current = totalByDate.get(entry.date) || 0;
    totalByDate.set(entry.date, current + entry.daily_cost);
  });

  const dailyTotals = Array.from(totalByDate.entries()).map(([date, cost]) => ({
    date,
    total_cost: cost,
  }));

  const allCosts = data as DailyCostEntry[];
  const totalCost = allCosts.reduce((sum, entry) => sum + entry.daily_cost, 0);
  const totalCalls = allCosts.reduce((sum, entry) => sum + entry.call_count, 0);
  const totalInputTokens = allCosts.reduce((sum, entry) => sum + entry.total_input_tokens, 0);
  const totalOutputTokens = allCosts.reduce((sum, entry) => sum + entry.total_output_tokens, 0);

  return NextResponse.json({
    view: "daily",
    period: "last 90 days",
    summary: {
      total_cost: totalCost.toFixed(2),
      total_calls: totalCalls,
      total_input_tokens: totalInputTokens,
      total_output_tokens: totalOutputTokens,
      avg_daily_cost: (totalCost / 90).toFixed(2),
    },
    data: allCosts,
    daily_totals: dailyTotals,
    filtered_by: { service: service || null },
  });
}

async function getMonthlyCosts(
  supabase: any,
  month?: string | null,
  service?: string | null
) {
  let query = supabase.from("monthly_cost_summary").select("*").order("month", { ascending: false });

  if (month) {
    // Filter by specific month (format: "2026-05")
    query = query.filter("month", "gte", `${month}-01`).filter("month", "lt", `${month.substring(0, 7)}-32`);
  }

  if (service) {
    query = query.eq("service", service);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Group by month for summary
  const byMonth = new Map<string, { cost: number; calls: number; tokens_in: number; tokens_out: number; errors: number }>();
  (data as MonthlyCostEntry[]).forEach((entry) => {
    const existing = byMonth.get(entry.month) || {
      cost: 0,
      calls: 0,
      tokens_in: 0,
      tokens_out: 0,
      errors: 0,
    };
    byMonth.set(entry.month, {
      cost: existing.cost + entry.total_cost,
      calls: existing.calls + entry.call_count,
      tokens_in: existing.tokens_in + entry.total_input_tokens,
      tokens_out: existing.tokens_out + entry.total_output_tokens,
      errors: existing.errors + entry.error_count,
    });
  });

  const monthlySummary = Array.from(byMonth.entries()).map(([month, stats]) => ({
    month,
    total_cost: stats.cost.toFixed(2),
    total_calls: stats.calls,
    total_input_tokens: stats.tokens_in,
    total_output_tokens: stats.tokens_out,
    error_count: stats.errors,
  }));

  const allData = data as MonthlyCostEntry[];
  const totalCost = allData.reduce((sum, entry) => sum + entry.total_cost, 0);
  const totalCalls = allData.reduce((sum, entry) => sum + entry.call_count, 0);

  return NextResponse.json({
    view: "monthly",
    period: month || "all time",
    summary: {
      total_cost: totalCost.toFixed(2),
      total_calls: totalCalls,
      avg_cost_per_call: totalCalls > 0 ? (totalCost / totalCalls).toFixed(4) : "0.0000",
    },
    by_month: monthlySummary,
    by_service: allData,
    filtered_by: { service: service || null, month: month || null },
  });
}
