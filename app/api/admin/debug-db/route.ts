import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const info: Record<string, unknown> = {
    url,
    keyPresent: !!key,
    keyLength: key?.length,
    keyPrefix: key?.substring(0, 12),
  };

  if (!url || !key) {
    return NextResponse.json({ ...info, error: "Missing env vars" }, { status: 500 });
  }

  try {
    const sb = createClient(url, key);
    const { data, error } = await sb
      .from("applications")
      .select("id, first_name, email, status", { count: "exact" })
      .order("created_at", { ascending: false });

    info.queryError = error?.message ?? null;
    info.rowCount = data?.length ?? 0;
    info.rows = data;
  } catch (e: any) {
    info.queryError = e?.message;
  }

  return NextResponse.json(info);
}
