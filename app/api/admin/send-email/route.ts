import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { to, subject, html } = await req.json() as {
    to: string[];
    subject: string;
    html: string;
  };

  if (!to?.length || !subject || !html) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  // Resend batch.send supports up to 100 emails per call — chunk if needed
  const BATCH_SIZE = 100;
  const chunks: string[][] = [];
  for (let i = 0; i < to.length; i += BATCH_SIZE) {
    chunks.push(to.slice(i, i + BATCH_SIZE));
  }

  let sent = 0;
  let failed = 0;

  for (const chunk of chunks) {
    const { data, error } = await resend.batch.send(
      chunk.map((recipient) => ({ from, to: recipient, subject, html }))
    );
    if (error || !data) {
      failed += chunk.length;
    } else {
      sent += data.length;
    }
  }

  return NextResponse.json({ sent, failed });
}
