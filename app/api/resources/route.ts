import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getClient() {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ resources: data ?? [] });
}

export async function POST(req: NextRequest) {
  try {
    const authClient = await getSupabaseServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { category, title, url, description } = await req.json();
    if (!title || !url) return NextResponse.json({ error: "Title and URL required" }, { status: 400 });
    const supabase = getClient();
    const { data, error } = await supabase
      .from("resources")
      .insert({ category: category ?? "General", title, url, description: description ?? "", active: true })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ resource: data });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authClient = await getSupabaseServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, active } = await req.json();
    if (!id || active === undefined) return NextResponse.json({ error: "id and active required" }, { status: 400 });
    const supabase = getClient();
    const { error } = await supabase.from("resources").update({ active }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
