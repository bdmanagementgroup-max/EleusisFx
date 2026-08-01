import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { runAgentBiasDispatch } from "@/lib/agent-bias/dispatch";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorizedCron(req: NextRequest): boolean {
  if (!process.env.CRON_SECRET) return false;
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

async function isCronEnabled(): Promise<boolean> {
  const supabase = await getSupabaseAdminClient();
  const { data } = await supabase
    .from("app_settings")
    .select("setting_value")
    .eq("setting_key", "agent_bias_cron_enabled")
    .maybeSingle();
  // Default to enabled if the flag is missing, so an unseeded row never
  // silently disables the feature.
  return data?.setting_value !== false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isCronEnabled())) {
    return NextResponse.json({ skipped: true, reason: "disabled via admin toggle" });
  }

  const result = await runAgentBiasDispatch();
  return NextResponse.json(result);
}
