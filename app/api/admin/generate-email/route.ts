import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const systemPrompt = `You are an email copywriter for Eleusis FX, a prop trading firm. Write personalized client emails that feel human and direct — not corporate or fluffy.

Eleusis FX brand voice:
- Confident but warm
- Specific to the trader's actual numbers (never generic platitudes)
- Short sentences, minimal padding
- Always close with something actionable or encouraging

You must return ONLY a JSON object with exactly two keys (no markdown, no fence):
{ "subject": "...", "html": "..." }

The "html" value must be a complete, self-contained HTML email string using this exact outer wrapper:
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#020305;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#020305;padding:48px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">
        <tr><td style="padding-bottom:32px;"><span style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">ELEUSIS FX</span></td></tr>
        [YOUR CONTENT GOES HERE]
        <tr><td style="padding-top:28px;"><p style="margin:0;font-size:11px;color:rgba(210,220,240,0.28);line-height:1.7;font-family:Arial,sans-serif;">Eleusis FX &middot; <a href="https://eleusisfx.uk" style="color:rgba(210,220,240,0.28);text-decoration:none;">eleusisfx.uk</a><br>Questions? Reply to this email.</p></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>

All inner content must use:
- Headings: font-size 28-36px, font-weight 800, color #e8eaf0, font-family Arial,sans-serif
- Body text: font-size 14-15px, line-height 1.8, color rgba(210,220,240,0.88), font-family Arial,sans-serif
- Accent labels: font-size 10px, letter-spacing 3px, text-transform uppercase, color rgba(210,220,240,0.4)
- Links/CTAs: background #4f8ef7, color #020305, padding 14px 26px, font-size 10px, font-weight 700, letter-spacing 2.5px, uppercase

Always address the recipient by their first name (use the name provided). Always include a call-to-action link to https://eleusisfx.uk/login.`;

export async function POST(req: NextRequest) {
  // Admin auth check
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  const { recipientEmail, templateLabel } = await req.json() as {
    recipientEmail: string;
    templateLabel: string;
  };

  if (!recipientEmail) {
    return NextResponse.json({ error: "recipientEmail is required" }, { status: 400 });
  }

  const adminClient = await getSupabaseAdminClient();

  // Look up user by email in auth
  let firstName = recipientEmail.split("@")[0];
  let metricsContext = "";

  try {
    const { data: usersData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const matchedUser = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === recipientEmail.toLowerCase()
    );

    if (matchedUser) {
      // Extract first name from user_metadata.full_name
      const fullName = matchedUser.user_metadata?.full_name as string | undefined;
      if (fullName) {
        firstName = fullName.split(" ")[0];
      }

      // Fetch client_metrics
      const { data: metrics } = await adminClient
        .from("client_metrics")
        .select("*")
        .eq("user_id", matchedUser.id)
        .single();

      if (metrics) {
        metricsContext = `
Prop firm: ${metrics.prop_firm ?? "Unknown"}
Phase: ${metrics.phase ?? "Unknown"} — ${metrics.phase_status ?? "Unknown"}
Balance: $${metrics.balance ?? "Unknown"}
Current equity: $${metrics.equity ?? "Unknown"}
Daily drawdown: ${metrics.daily_drawdown ?? "Unknown"}%
Max drawdown used: ${metrics.max_drawdown ?? "Unknown"}%
Profit target reached: ${metrics.profit_target ?? "Unknown"}% of ${metrics.profit_goal ?? "Unknown"}% goal
Days used: ${metrics.days_used ?? "Unknown"} of ${metrics.days_allowed ?? "Unknown"}`;
      }
    }

    // If no client_metrics found, try past_clients by email
    if (!metricsContext) {
      const { data: pastClient } = await adminClient
        .from("past_clients")
        .select("*")
        .ilike("email", recipientEmail)
        .single();

      if (pastClient) {
        if (pastClient.name) {
          firstName = (pastClient.name as string).split(" ")[0];
        }
        metricsContext = `
Prop firm: ${pastClient.prop_firm ?? "Unknown"}
Phase: ${pastClient.phase ?? "Unknown"} — ${pastClient.phase_status ?? "Unknown"}
Balance: $${pastClient.balance ?? "Unknown"}
Current equity: $${pastClient.equity ?? "Unknown"}
Daily drawdown: ${pastClient.daily_drawdown ?? "Unknown"}%
Max drawdown used: ${pastClient.max_drawdown ?? "Unknown"}%
Profit target reached: ${pastClient.profit_target ?? "Unknown"}% of ${pastClient.profit_goal ?? "Unknown"}% goal
Days used: ${pastClient.days_used ?? "Unknown"} of ${pastClient.days_allowed ?? "Unknown"}`;
      }
    }
  } catch {
    // Non-fatal — fall back to generic personalisation
  }

  const userMessage = metricsContext
    ? `Template type: ${templateLabel}
Recipient: ${firstName} (${recipientEmail})
${metricsContext}

Write a personalized "${templateLabel}" email for this trader using their specific numbers. Reference at least 2 of their actual metric values in the email body.`
    : `Template type: ${templateLabel}
Recipient: ${firstName} (${recipientEmail})

No metrics data available for this recipient. Write a warm, personalized "${templateLabel}" email addressed to ${firstName}. Keep it concise and actionable.`;

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    let result: { subject?: string; html?: string };
    try {
      result = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
