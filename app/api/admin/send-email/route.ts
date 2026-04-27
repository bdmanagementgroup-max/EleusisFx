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
  const results = await Promise.allSettled(
    to.map((recipient) =>
      resend.emails.send({ from, to: recipient, subject, html })
    )
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  const sent = results.length - failed;

  return NextResponse.json({ sent, failed });
}
