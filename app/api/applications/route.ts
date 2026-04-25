import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, propFirm, notes } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const notionKey = process.env.NOTION_API_KEY;
    const notionDb = process.env.NOTION_LEADS_DATABASE_ID;

    if (notionKey && notionDb) {
      const { Client } = await import("@notionhq/client");
      const notion = new Client({ auth: notionKey });

      const notesContent = [
        propFirm ? `Prop Firm: ${propFirm}` : null,
        phone ? `Phone/WhatsApp: ${phone}` : null,
        notes ? `Notes: ${notes}` : null,
      ].filter(Boolean).join("\n");

      await notion.pages.create({
        parent: { database_id: notionDb },
        properties: {
          "Name": {
            title: [{ text: { content: `${firstName} ${lastName}` } }],
          },
          "Email": {
            rich_text: [{ text: { content: email } }],
          },
          "Notes": {
            rich_text: [{ text: { content: notesContent } }],
          },
          "Source": {
            select: { name: "Website" },
          },
          "Status": {
            select: { name: "New" },
          },
          "Submitted At": {
            date: { start: new Date().toISOString() },
          },
        },
      });
    }

    // Also write to Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("applications").insert({
        first_name: firstName,
        last_name: lastName,
        email,
        whatsapp: phone,
        prop_firm: propFirm,
        notes,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Application submission error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
