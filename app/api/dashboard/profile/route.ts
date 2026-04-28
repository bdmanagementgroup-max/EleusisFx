import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_FIELDS = [
  "display_name", "phone", "address_1", "city", "postcode", "country", "avatar_url",
] as const;

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const body = await req.json();
    const update: Record<string, unknown> = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };
    for (const key of ALLOWED_FIELDS) {
      if (key in body) update[key] = body[key] ?? null;
    }

    const { data, error } = await supabase
      .from("client_profiles")
      .upsert(update, { onConflict: "user_id" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
