import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VALID_OUTCOMES = ["pending", "won", "lost", "invalidated"];

export async function PATCH(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, outcome, outcome_pnl } = await req.json();

  if (!VALID_OUTCOMES.includes(outcome)) {
    return NextResponse.json({ error: "Invalid outcome value" }, { status: 400 });
  }

  const db = await getSupabaseAdminClient();
  const { error } = await db
    .from("trading_signals")
    .update({ outcome, outcome_pnl: outcome_pnl ?? null })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
