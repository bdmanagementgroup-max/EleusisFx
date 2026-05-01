import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

// GET /api/admin/trading-snapshots          — list (no content)
// GET /api/admin/trading-snapshots?id=...   — single with content
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getSupabaseAdminClient();
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const { data, error } = await db
      .from("trading_snapshots")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  }

  const { data, error } = await db
    .from("trading_snapshots")
    .select("id, created_at, session, focus, news_level")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ snapshots: data });
}

// POST /api/admin/trading-snapshots — save new snapshot
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { session, focus, newsLevel, content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "No content" }, { status: 400 });

  const db = await getSupabaseAdminClient();
  const { data, error } = await db
    .from("trading_snapshots")
    .insert({ session, focus, news_level: newsLevel, content })
    .select("id, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/admin/trading-snapshots?id=...
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = await getSupabaseAdminClient();
  const { error } = await db.from("trading_snapshots").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
