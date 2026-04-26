import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const authClient = await getSupabaseServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { user_id, recorded_at, equity } = await req.json();
    if (!user_id || !recorded_at || equity === undefined) {
      return NextResponse.json({ error: "user_id, recorded_at and equity are required" }, { status: 400 });
    }
    if (isNaN(Number(equity))) {
      return NextResponse.json({ error: "equity must be a number" }, { status: 400 });
    }

    const supabase = await getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("equity_history")
      .upsert({ user_id, recorded_at, equity }, { onConflict: "user_id,recorded_at" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
