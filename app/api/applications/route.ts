import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["new", "reviewed", "active", "funded", "pending"] as const;

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, notes } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const update: Record<string, unknown> = {};
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      update.status = status;
    }
    if (notes !== undefined) update.notes = notes;
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const supabase = await getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("applications")
      .update(update)
      .eq("id", id)
      .select("id, status, notes")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const supabase = await getSupabaseAdminClient();
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, propFirm, notes } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const notionKey = process.env.NOTION_API_KEY;
    const notionDb = process.env.NOTION_LEADS_DATABASE_ID;

    console.log("[applications] NOTION_API_KEY present:", !!notionKey);
    console.log("[applications] NOTION_LEADS_DATABASE_ID:", notionDb);

    if (!notionKey || !notionDb) {
      console.error("[applications] Missing Notion env vars");
      return NextResponse.json({ error: "Notion not configured" }, { status: 500 });
    }

    const { Client } = await import("@notionhq/client");
    const notion = new Client({ auth: notionKey });

    try {
      await notion.pages.create({
        parent: { database_id: notionDb },
        properties: {
          "Email": {
            title: [{ text: { content: email } }],
          },
          "Name": {
            rich_text: [{ text: { content: `${firstName} ${lastName}` } }],
          },
          "Prop Firm": {
            rich_text: [{ text: { content: propFirm || "" } }],
          },
          "Phone": {
            rich_text: [{ text: { content: phone || "" } }],
          },
          "Notes": {
            rich_text: [{ text: { content: notes || "" } }],
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
      console.log("[applications] Notion page created successfully");
    } catch (notionErr: any) {
      console.error("[applications] Notion error:", notionErr?.message);
      console.error("[applications] Notion error body:", JSON.stringify(notionErr?.body));
      // Don't return error — still try Supabase and return success to user
    }

    // Also write to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
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
        console.log("[applications] Supabase insert OK");
      } catch (sbErr: any) {
        console.error("[applications] Supabase error:", sbErr?.message);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[applications] Unhandled error:", err?.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
