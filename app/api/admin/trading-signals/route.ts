import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

// GET ?session_id=...  → full signals for one run (includes content for export)
// GET                  → session list (no content, light)
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getSupabaseAdminClient();
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (sessionId) {
    const { data, error } = await db
      .from("trading_signals")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ signals: data ?? [] });
  }

  const { data, error } = await db
    .from("trading_signals")
    .select("id, session_id, created_at, session, focus, news_level, pair, direction, entry_price, stop_loss, tp1, tp2, risk_reward")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ signals: data ?? [] });
}

// POST — save all signals from one analysis run
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId, session, focus, newsLevel, signals } = await req.json();
  if (!Array.isArray(signals) || signals.length === 0)
    return NextResponse.json({ error: "No signals to save" }, { status: 400 });

  const rows = signals.map((s: Record<string, string>) => ({
    session_id:   sessionId,
    session,
    focus,
    news_level:   newsLevel,
    pair:         s.pair,
    direction:    s.direction,
    bias:         s.bias ?? null,
    timeframe:    s.timeframe ?? null,
    confluence:   s.confluence ?? null,
    setup_detail: s.setupDetail ?? null,
    entry_price:  s.entryPrice ?? null,
    stop_loss:    s.stopLoss ?? null,
    tp1:          s.tp1 ?? null,
    tp2:          s.tp2 ?? null,
    risk_reward:  s.riskReward ?? null,
    invalidation: s.invalidation ?? null,
    content:      s.content,
  }));

  const db = await getSupabaseAdminClient();
  const { error } = await db.from("trading_signals").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ saved: rows.length });
}

// DELETE ?session_id=...  — delete all signals for a run
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

  const db = await getSupabaseAdminClient();
  const { error } = await db.from("trading_signals").delete().eq("session_id", sessionId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
