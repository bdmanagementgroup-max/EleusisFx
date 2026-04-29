import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// Resend POSTs inbound emails here.
// Secure the URL with ?secret=RESEND_INBOUND_SECRET in your Resend dashboard webhook config.
export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_INBOUND_SECRET;
  if (secret) {
    const provided = req.nextUrl.searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Resend inbound payload — handle both camelCase and their documented casing
  const body = await req.json() as Record<string, unknown>;

  const from_address =
    (body.from as string) ?? (body.From as string) ?? "";
  const from_name =
    (body.fromName as string) ?? (body.FromName as string) ?? null;
  const subject =
    (body.subject as string) ?? (body.Subject as string) ?? "(no subject)";
  const text_body =
    (body.text as string) ?? (body.BodyText as string) ?? null;
  const html_body =
    (body.html as string) ?? (body.BodyHtml as string) ?? null;
  const resend_id =
    (body.messageId as string) ?? (body.MessageId as string) ?? null;

  if (!from_address) {
    return NextResponse.json({ error: "Missing from address" }, { status: 400 });
  }

  const supabase = await getSupabaseAdminClient();
  const { error } = await supabase.from("received_emails").insert({
    resend_id,
    from_address,
    from_name,
    subject,
    text_body,
    html_body,
  });

  if (error) {
    console.error("inbound-email webhook:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
