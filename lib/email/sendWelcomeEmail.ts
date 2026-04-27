import { Resend } from "resend";

interface WelcomeEmailArgs {
  to: string;
  firstName: string;
  tempPassword?: string;
  resetLink?: string;
  siteUrl: string;
}

export async function sendWelcomeEmail({ to, firstName, tempPassword, resetLink, siteUrl }: WelcomeEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    console.warn("[email] RESEND_API_KEY or RESEND_FROM not configured — skipping welcome email");
    return;
  }

  const resend = new Resend(apiKey);
  const loginBtnUrl = resetLink ?? `${siteUrl}/login`;
  const loginBtnText = resetLink ? "Set Your Password &rarr;" : "Access Dashboard &rarr;";

  const credentialsBlock = tempPassword
    ? `<p style="margin:0 0 6px;font-size:13px;color:rgba(210,220,240,0.88);">
        <strong style="color:#e8eaf0;">Email:</strong>&nbsp;${to}
      </p>
      <p style="margin:0 0 20px;font-size:13px;color:rgba(210,220,240,0.88);">
        <strong style="color:#e8eaf0;">Password:</strong>&nbsp;
        <code style="background:rgba(79,142,247,0.12);border:1px solid rgba(79,142,247,0.25);padding:2px 10px;font-family:monospace;font-size:13px;color:#7eb3ff;letter-spacing:1px;">${tempPassword}</code>
      </p>`
    : `<p style="margin:0 0 20px;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;">
        Click the button below to set your password and access your dashboard.
      </p>`;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Welcome to Eleusis FX — Your Application Is Confirmed",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Welcome to Eleusis FX</title>
</head>
<body style="margin:0;padding:0;background:#020305;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#020305;padding:48px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">

        <!-- Logo -->
        <tr><td style="padding-bottom:40px;">
          <span style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">ELEUSIS FX</span>
        </td></tr>

        <!-- Hero -->
        <tr><td style="padding-bottom:36px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <h1 style="margin:0 0 16px;font-size:34px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">
            Application Received.
          </h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">
            Hi ${firstName}, your application is in. We review every submission within 24 hours and will follow up to confirm availability and walk you through the next steps.
          </p>
        </td></tr>

        <!-- Dashboard access -->
        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 20px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Your Dashboard</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.2);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:28px 28px 24px;">
              ${credentialsBlock}
              <a href="${loginBtnUrl}" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">${loginBtnText}</a>
            </td></tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;line-height:1.6;">
            Once your challenge starts, your dashboard tracks live equity, drawdown, and progress toward your profit target.
          </p>
        </td></tr>

        <!-- Free guides -->
        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Your Free Resources</p>
          <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#e8eaf0;letter-spacing:-0.5px;font-family:Arial,sans-serif;">
            3 Guides to Get You Started
          </h2>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.75;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">
            We've put together three guides covering everything you need to know before your challenge begins.
          </p>
          ${[
            { url: `${siteUrl}/eleusis-fx-5-fatal-mistakes.pdf`, label: "5 Fatal Mistakes That Kill Prop Accounts" },
            { url: `${siteUrl}/eleusis-fx-30-day-blueprint.pdf`, label: "The 30-Day Evaluation Blueprint" },
            { url: `${siteUrl}/eleusis-fx-funded-trader-mindset.pdf`, label: "The Funded Trader Mindset" },
          ].map(({ url, label }) => `
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;background:#08090f;border:1px solid rgba(255,255,255,0.06);">
            <tr><td style="padding:16px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">${label}</td>
                  <td align="right"><a href="${url}" style="display:inline-block;color:#4f8ef7;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;white-space:nowrap;font-family:Arial,sans-serif;">Download &rarr;</a></td>
                </tr>
              </table>
            </td></tr>
          </table>`).join("")}
        </td></tr>

        <!-- What happens next -->
        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 20px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">What Happens Next</p>
          <table cellpadding="0" cellspacing="0" border="0">
            ${[
              ["01", "We review your application within 24 hours."],
              ["02", "If there's a spot available, we'll confirm and run you through the plan."],
              ["03", "Once confirmed, we kick off your challenge — you track everything in the dashboard."],
            ].map(([n, t]) => `
            <tr>
              <td style="padding-bottom:16px;vertical-align:top;">
                <span style="display:inline-block;width:28px;height:28px;border:1px solid rgba(79,142,247,0.25);font-size:9px;letter-spacing:1px;color:#4f8ef7;text-align:center;line-height:28px;font-family:Arial,sans-serif;flex-shrink:0;">${n}</span>
              </td>
              <td style="padding:4px 0 16px 14px;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">${t}</td>
            </tr>`).join("")}
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:32px;">
          <p style="margin:0;font-size:11px;color:rgba(210,220,240,0.28);line-height:1.7;font-family:Arial,sans-serif;">
            Eleusis FX &nbsp;&middot;&nbsp; <a href="${siteUrl}" style="color:rgba(210,220,240,0.28);text-decoration:none;">${siteUrl.replace("https://", "")}</a><br>
            You received this because you applied via our website. Questions? Reply directly to this email.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
  if (error) throw new Error(error.message);
}
