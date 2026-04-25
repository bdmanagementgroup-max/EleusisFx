import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, excerpt, category, content, published } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("articles").insert({
        title, slug, excerpt, category, content,
        published: published ?? false,
        published_at: published ? new Date().toISOString() : null,
        read_time: Math.ceil((content?.split(" ")?.length ?? 0) / 200),
      });
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
