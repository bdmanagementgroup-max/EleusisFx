import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const authClient = await getSupabaseServerClient();
    const { data: { user: adminUser } } = await authClient.auth.getUser();
    if (!adminUser || adminUser.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      first_name = "", last_name = "",
      email, password,
      prop_firm = "", phase = 1, phase_status = "in_progress",
      balance = 100000, profit_goal = 10, days_allowed = 30,
    } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const supabase = await getSupabaseAdminClient();
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || email.split("@")[0];

    const { data: user, error: userErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });

    const { error: metricsErr } = await supabase.from("client_metrics").insert({
      user_id: user.user.id,
      prop_firm,
      phase,
      phase_status,
      balance,
      equity: balance,
      profit_goal,
      days_allowed,
    });

    if (metricsErr) {
      await supabase.auth.admin.deleteUser(user.user.id);
      return NextResponse.json({ error: metricsErr.message }, { status: 500 });
    }

    // Also write to applications table so the client appears on /admin/clients
    await supabase.from("applications").insert({
      email,
      first_name: first_name || email.split("@")[0],
      last_name,
      prop_firm,
      status: "active",
    });

    return NextResponse.json({ id: user.user.id, email });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
