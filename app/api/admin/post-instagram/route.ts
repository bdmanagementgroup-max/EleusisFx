import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const BASE = "https://graph.facebook.com/v20.0";

export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { imageUrl, caption = "" } = await req.json();

  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!igId || !token) {
    return NextResponse.json(
      { error: "Instagram env vars not configured" },
      { status: 500 }
    );
  }

  // Step 1: Create media container
  const containerRes = await fetch(`${BASE}/${igId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      caption,
      access_token: token,
    }),
  });

  const containerData = await containerRes.json();

  if (!containerRes.ok || containerData.error) {
    const msg = containerData.error?.message ?? "Failed to create media container";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const creationId: string = containerData.id;

  // Step 2: Publish the container
  const publishRes = await fetch(`${BASE}/${igId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: creationId,
      access_token: token,
    }),
  });

  const publishData = await publishRes.json();

  if (!publishRes.ok || publishData.error) {
    const msg = publishData.error?.message ?? "Failed to publish post";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ postId: publishData.id });
}
