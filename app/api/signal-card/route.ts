import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";
import { signalCardElement, type CardSignal } from "@/lib/signal-cards/signalCard";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BUCKET = "signal-cards";

// ─── Font loading (cached across warm invocations) ────────────────────────────

type FontSpec = { name: string; data: Buffer; weight: 400 | 700 | 800; style: "normal" };
let fontCache: FontSpec[] | null = null;

async function loadFonts(): Promise<FontSpec[]> {
  if (fontCache) return fontCache;
  const dir = path.join(process.cwd(), "lib/signal-cards/fonts");
  const [mono, monoBold, syne700, syne800] = await Promise.all([
    readFile(path.join(dir, "SpaceMono-Regular.ttf")),
    readFile(path.join(dir, "SpaceMono-Bold.ttf")),
    readFile(path.join(dir, "Syne-700.woff")),
    readFile(path.join(dir, "Syne-800.woff")),
  ]);
  fontCache = [
    { name: "Space Mono", data: mono, weight: 400, style: "normal" },
    { name: "Space Mono", data: monoBold, weight: 700, style: "normal" },
    { name: "Syne", data: syne700, weight: 700, style: "normal" },
    { name: "Syne", data: syne800, weight: 800, style: "normal" },
  ];
  return fontCache;
}

// ─── POST — render a single signal to a 1080×1080 PNG and upload ──────────────

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { signalId } = await req.json();
  if (!signalId) {
    return NextResponse.json({ error: "Missing signalId" }, { status: 400 });
  }

  const db = await getSupabaseAdminClient();
  const { data: signal, error: sigErr } = await db
    .from("trading_signals")
    .select("id, pair, direction, session, timeframe, confluence, entry_price, stop_loss, tp1, tp2, risk_reward, invalidation, created_at")
    .eq("id", signalId)
    .single();

  if (sigErr || !signal) {
    return NextResponse.json({ error: sigErr?.message ?? "Signal not found" }, { status: 404 });
  }

  try {
    const dateStr = new Date(signal.created_at).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });

    const fonts = await loadFonts();
    const svg = await satori(signalCardElement(signal as CardSignal, dateStr), {
      width: 1080,
      height: 1080,
      fonts,
    });

    const png = new Resvg(svg, { fitTo: { mode: "width", value: 1080 } })
      .render()
      .asPng();

    const filePath = `${signalId}.png`;
    const { error: upErr } = await db.storage
      .from(BUCKET)
      .upload(filePath, png, { contentType: "image/png", upsert: true });

    if (upErr) {
      return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 });
    }

    const { data: pub } = db.storage.from(BUCKET).getPublicUrl(filePath);
    // Cache-bust because the path is stable and regeneration overwrites in place.
    const url = `${pub.publicUrl}?v=${signal.created_at ? new Date(signal.created_at).getTime() : ""}${Date.now()}`;

    await db.from("trading_signals").update({ card_url: url }).eq("id", signalId);

    return NextResponse.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Card render failed";
    console.error("[signal-card] render error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
