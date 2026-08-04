import { NextRequest, NextResponse } from "next/server";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import path from "path";

export const dynamic = "force-dynamic";

const EXPORT_DIR = "/Users/benjamindavies/Documents/Claude - Eleusis/Assets/IGSocialExports";

export async function POST(req: NextRequest) {
  try {
    const { signalId, url } = await req.json();
    if (!signalId || !url) {
      return NextResponse.json({ error: "Missing signalId or url" }, { status: 400 });
    }

    // Fetch the image from Supabase Storage
    const imgRes = await fetch(url);
    if (!imgRes.ok || !imgRes.body) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }

    // Ensure export directory exists
    const fs = await import("fs");
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }

    // Generate filename: eleusis-card-{PAIR}-{signalId-short}.png
    const pair = url.split("/").pop()?.split(".")[0]?.replace(/-/g, "") ?? signalId.slice(0, 8);
    const filename = `eleusis-card-${pair}.png`;
    const filepath = path.join(EXPORT_DIR, filename);

    // Stream to file
    const writeStream = createWriteStream(filepath);
    await pipeline(imgRes.body as any, writeStream);

    return NextResponse.json({ saved: true, path: filepath, filename });
  } catch {
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}