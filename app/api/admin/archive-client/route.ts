import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const authClient = await getSupabaseServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const supabase = await getSupabaseAdminClient();

    // Fetch the application
    const { data: app, error: fetchErr } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const name = [app.first_name, app.last_name].filter(Boolean).join(" ") || app.email;

    // Insert into past_clients — preserve created_at so it counts in the correct year
    const { data: pastClient, error: insertErr } = await supabase
      .from("past_clients")
      .insert({
        name,
        email: app.email ?? null,
        phone: app.whatsapp ?? null,
        prop_firm: app.prop_firm ?? null,
        notes: app.notes ?? null,
        source_file: "applications",
        challenge_result: null,
        phase_status: "in_progress",
        created_at: app.created_at ?? new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: `Failed to create past client: ${insertErr.message}` }, { status: 500 });
    }

    // Delete the application
    const { error: deleteErr } = await supabase
      .from("applications")
      .delete()
      .eq("id", id);

    if (deleteErr) {
      return NextResponse.json({ error: `Moved to past clients but failed to remove application: ${deleteErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pastClientId: pastClient.id });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
