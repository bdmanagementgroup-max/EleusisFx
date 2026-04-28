import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";

export async function POST(req: NextRequest) {
  try {
    const authClient = await getSupabaseServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, firstName } = await req.json();
    if (!email || !firstName) {
      return NextResponse.json({ error: "email and firstName required" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eleusisfx.uk";
    const supabase = await getSupabaseAdminClient();
    const { randomBytes } = await import("crypto");
    const tempPassword = randomBytes(12).toString("base64url");

    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    let accountCreated = false;

    if (!createErr && newUser?.user) {
      await supabase.from("client_metrics").insert({
        user_id: newUser.user.id,
        prop_firm: "",
        phase: 1,
        phase_status: "in_progress",
        balance: 100000,
        equity: 100000,
        profit_goal: 10,
        days_allowed: 30,
      });
      accountCreated = true;
      await sendWelcomeEmail({ to: email, firstName, tempPassword, siteUrl });
    } else {
      // Account already exists — generate a password reset link instead
      const { data: linkData } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: `${siteUrl}/auth/reset-password` },
      });
      const resetLink = linkData?.properties?.action_link;
      await sendWelcomeEmail({ to: email, firstName, resetLink: resetLink ?? undefined, siteUrl });
    }

    return NextResponse.json({ ok: true, accountCreated });
  } catch (err: any) {
    console.error("[send-welcome] Error:", err?.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
