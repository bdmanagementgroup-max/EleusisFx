import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_INBOUND_SECRET;
  if (secret) {
    const provided = req.nextUrl.searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json() as Record<string, unknown>;

  // ForwardEmail sends `from` as either a plain string "Name <email>"
  // or as an object { text: "Name <email>", value: [{address, name}] }
  function resolveFrom(raw: unknown): { address: string; name: string | null } {
    if (typeof raw === "string") {
      const match = raw.match(/^(.*?)\s*<([^>]+)>$/);
      if (match) return { address: match[2].trim(), name: match[1].trim() || null };
      return { address: raw.trim(), name: null };
    }
    if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      // mailparser object format
      if (Array.isArray(obj.value) && obj.value.length > 0) {
        const v = obj.value[0] as Record<string, string>;
        return { address: v.address ?? "", name: v.name ?? null };
      }
      if (typeof obj.text === "string") {
        return resolveFrom(obj.text);
      }
    }
    return { address: "", name: null };
  }

  const fromRaw = body.from ?? body.From;
  const { address: from_address, name: from_name } = resolveFrom(fromRaw);

  const subject =
    (body.subject as string) ?? (body.Subject as string) ?? "(no subject)";

  const text_body =
    (body.text as string) ?? (body.BodyText as string) ?? null;

  const html_body =
    (body.html as string) ?? (body.BodyHtml as string) ?? null;

  const resend_id =
    (body.messageId as string) ?? (body.MessageId as string) ??
    (body.id as string) ?? null;

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
