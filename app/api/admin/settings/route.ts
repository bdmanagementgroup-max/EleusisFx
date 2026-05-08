import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["ai_coach_enabled"]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const settings: Record<string, any> = {};
    data?.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await getSupabaseAdminClient();

    const updates = Object.entries(body).map(([key, value]) => ({
      setting_key: key,
      setting_value: value,
    }));

    for (const update of updates) {
      await supabase
        .from("app_settings")
        .update({ setting_value: update.setting_value })
        .eq("setting_key", update.setting_key);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
