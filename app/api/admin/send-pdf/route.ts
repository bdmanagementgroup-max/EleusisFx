import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendPdfEmail, PDF_OPTIONS, type PdfKey } from "@/lib/email/sendPdfEmail";

export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, firstName, pdfKey } = await req.json();
  if (!email || !firstName || !pdfKey) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!PDF_OPTIONS.find((p) => p.key === pdfKey)) {
    return NextResponse.json({ error: "Invalid PDF key" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eleusisfx.uk";

  try {
    await sendPdfEmail({ to: email, firstName, pdfKey: pdfKey as PdfKey, siteUrl });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[send-pdf]", err);
    return NextResponse.json({ error: err?.message ?? "Send failed" }, { status: 500 });
  }
}
