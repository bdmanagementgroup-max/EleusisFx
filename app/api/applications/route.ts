import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";

const VALID_STATUSES = ["new", "reviewed", "active", "funded", "pending"] as const;

export async function PATCH(req: NextRequest) {
  try {
    const authClient = await getSupabaseServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
    const authClient = await getSupabaseServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    if (notionKey && notionDb) {
      try {
        const { Client } = await import("@notionhq/client");
        const notion = new Client({ auth: notionKey });
        await notion.pages.create({
          parent: { database_id: notionDb },
          properties: {
            "Email": { title: [{ text: { content: email } }] },
            "Name": { rich_text: [{ text: { content: `${firstName} ${lastName}` } }] },
            "Prop Firm": { rich_text: [{ text: { content: propFirm || "" } }] },
            "Phone": { rich_text: [{ text: { content: phone || "" } }] },
            "Notes": { rich_text: [{ text: { content: notes || "" } }] },
            "Source": { select: { name: "Website" } },
            "Status": { select: { name: "New" } },
            "Submitted At": { date: { start: new Date().toISOString() } },
          },
        });
        console.log("[applications] Notion page created successfully");
      } catch (notionErr: any) {
        console.error("[applications] Notion error:", notionErr?.message);
      }
    } else {
      console.log("[applications] Notion not configured — skipping");
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

    // Create Supabase client account + send welcome email
    if (supabaseUrl && supabaseKey) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eleusisfx.uk";
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { randomBytes } = await import("crypto");
        const tempPassword = randomBytes(12).toString("base64url");

        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
        });

        if (!createErr && newUser?.user) {
          await supabase.from("client_metrics").insert({
            user_id: newUser.user.id,
            prop_firm: propFirm ?? "",
            phase: 1,
            phase_status: "in_progress",
            balance: 100000,
            equity: 100000,
            profit_goal: 10,
            days_allowed: 30,
          });
          console.log("[applications] Client account created:", newUser.user.id);
          await sendWelcomeEmail({ to: email, firstName, tempPassword, siteUrl });
        } else if (createErr) {
          console.warn("[applications] Account already exists or create failed:", createErr.message);
          await sendWelcomeEmail({ to: email, firstName, siteUrl });
        }
      } catch (accountErr: any) {
        console.error("[applications] Account/email error:", accountErr?.message);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[applications] Unhandled error:", err?.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
