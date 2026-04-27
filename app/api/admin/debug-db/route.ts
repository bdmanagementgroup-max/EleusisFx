import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const info: Record<string, unknown> = {
    url,
    keyPresent: !!key,
    keyLength: key?.length,
    keyPrefix: key?.substring(0, 12),
  };

  if (!url || !key) {
    return NextResponse.json({ ...info, error: "Missing env vars" }, { status: 500 });
  }

  try {
    const sb = createClient(url, key);

    // Check applications table
    const { data: appData, error: appError, count } = await sb
      .from("applications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(10);

    info.applications = {
      error: appError?.message ?? null,
      errorCode: appError?.code ?? null,
      rowCount: count ?? 0,
      recentRows: appData ?? [],
      columns: appData?.[0] ? Object.keys(appData[0]) : [],
    };

    // Check leads table
    const { data: leadData, error: leadError, count: leadCount } = await sb
      .from("leads")
      .select("*", { count: "exact" })
      .limit(5);

    info.leads = {
      error: leadError?.message ?? null,
      rowCount: leadCount ?? 0,
    };

    // Check client_metrics (to see manually-created clients)
    const { data: metricData, error: metricError, count: metricCount } = await sb
      .from("client_metrics")
      .select("user_id, prop_firm, phase, phase_status, created_at", { count: "exact" } as any)
      .order("updated_at" as any, { ascending: false })
      .limit(10);

    info.client_metrics = {
      error: metricError?.message ?? null,
      rowCount: metricCount ?? 0,
      recentRows: metricData ?? [],
    };

  } catch (e: any) {
    info.queryError = e?.message;
  }

  return NextResponse.json(info, { status: 200 });
}
