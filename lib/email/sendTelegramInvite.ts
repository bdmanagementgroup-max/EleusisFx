import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTelegramInviteEmail(email: string, inviteLink: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[Email] RESEND_API_KEY not configured");
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM || "noreply@eleusisfx.uk",
      to: email,
      subject: "Welcome to Eleusis FX Signals — Join Our Telegram Community",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f8ef7;">Welcome to Eleusis FX Signals 🎯</h1>
          
          <p>Thank you for subscribing! Your payment has been processed successfully.</p>
          
          <p>You now have access to our private Telegram signals channel where you'll receive:</p>
          <ul>
            <li>Daily trading signals (3x per trading session)</li>
            <li>Real-time alerts when new setups align with our confluence framework</li>
            <li>Updates on macro events affecting your trade setup</li>
            <li>Access to our trader community</li>
          </ul>

          <div style="background: #08090f; border: 1px solid #4f8ef7; padding: 24px; margin: 32px 0; text-align: center;">
            <p style="color: #7eb3ff; margin: 0 0 16px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
              Join Our Private Channel
            </p>
            <a href="${inviteLink}" style="display: inline-block; background: #4f8ef7; color: white; text-decoration: none; padding: 12px 32px; border-radius: 4px; font-weight: 600;">
              Accept Telegram Invite
            </a>
          </div>

          <p><strong>What's next?</strong></p>
          <ol>
            <li>Click the button above to join our Telegram channel</li>
            <li>Introduce yourself in the welcome message</li>
            <li>Check your dashboard at <a href="https://eleusisfx.uk/dashboard/signals">dashboard/signals</a> to view historical signals</li>
            <li>Set up Telegram notifications so you don't miss alerts</li>
          </ol>

          <p style="color: #999; font-size: 12px;">
            Questions? Reply to this email or visit <a href="https://eleusisfx.uk">eleusisfx.uk</a>
          </p>
        </div>
      `,
    });

    console.log(`[Email] Telegram invite sent to ${email}`);
  } catch (error) {
    console.error("[Email] Failed to send Telegram invite:", error);
  }
}

export async function generateTelegramInviteLink(): Promise<string | null> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_SUBSCRIBER_CHANNEL_ID;

  if (!botToken || !channelId) {
    console.error("[Telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_SUBSCRIBER_CHANNEL_ID");
    return null;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channelId,
        expire_date: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
        member_limit: 1, // One-time use invite
      }),
    });

    const data = (await response.json()) as { ok: boolean; result?: { invite_link: string }; description?: string };

    if (data.ok && data.result?.invite_link) {
      return data.result.invite_link;
    }

    console.error("[Telegram] Failed to generate invite link:", data.description);
    return null;
  } catch (error) {
    console.error("[Telegram] Error generating invite link:", error);
    return null;
  }
}
