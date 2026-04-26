import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("past_clients")
    .select("*")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const allowed = ["email", "phone", "address", "notes", "challenge_result"];
  const update: Record<string, string> = {};
  for (const k of allowed) {
    if (k in fields) update[k] = fields[k];
  }

  const supabase = await getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("past_clients")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
