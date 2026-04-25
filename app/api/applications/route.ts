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

      await notion.pages.create({
        parent: { database_id: notionDb },
        properties: {
          // "Name" is the default title property in every Notion DB
          "Name": {
            title: [{ text: { content: `${firstName} ${lastName}` } }],
          },
          "Email": { email },
          "Phone": { phone_number: phone || "" },
          "Prop Firm": { rich_text: [{ text: { content: propFirm || "" } }] },
          "Notes": { rich_text: [{ text: { content: notes || "" } }] },
          "Status": { rich_text: [{ text: { content: "New" } }] },
          "Source": { rich_text: [{ text: { content: "Website" } }] },
        },
        // Full detail in page body — survives any property mismatch
        children: [
          {
            object: "block" as const,
            type: "heading_2" as const,
            heading_2: {
              rich_text: [{ type: "text" as const, text: { content: "Application Details" } }],
            },
          },
          ...([
            ["Name", `${firstName} ${lastName}`],
            ["Email", email],
            ["WhatsApp / Phone", phone || "—"],
            ["Prop Firm", propFirm || "—"],
            ["Submitted", new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })],
            ["Notes", notes || "—"],
          ] as [string, string][]).map(([label, value]) => ({
            object: "block" as const,
            type: "paragraph" as const,
            paragraph: {
              rich_text: [
                { type: "text" as const, text: { content: `${label}: ` }, annotations: { bold: true, italic: false, strikethrough: false, underline: false, code: false, color: "default" as const } },
                { type: "text" as const, text: { content: value } },
              ],
            },
          })),
        ],
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
