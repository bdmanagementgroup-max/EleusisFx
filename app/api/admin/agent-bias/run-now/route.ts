import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { runAgentBiasDispatch } from "@/lib/agent-bias/dispatch";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Manual override — always runs regardless of the agent_bias_cron_enabled
// toggle, matching "fire the agents now if needed" even when the nightly
// schedule is paused.
export async function POST() {
  const auth = await getSupabaseServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  const result = await runAgentBiasDispatch();
  return NextResponse.json(result);
}
