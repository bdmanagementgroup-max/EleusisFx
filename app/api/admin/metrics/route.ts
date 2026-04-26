import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_FIELDS = [
  "prop_firm", "phase", "phase_status", "balance", "equity",
  "daily_drawdown", "max_drawdown", "profit_target", "profit_goal",
  "days_used", "days_allowed",
] as const;

export async function PATCH(req: NextRequest) {
  try {
    const authClient = await getSupabaseServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { user_id, ...fields } = await req.json();
    if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of ALLOWED_FIELDS) {
      if (key in fields) update[key] = fields[key];
    }

    const supabase = await getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("client_metrics")
      .update(update)
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
