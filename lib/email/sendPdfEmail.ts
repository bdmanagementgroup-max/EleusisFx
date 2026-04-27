import { Resend } from "resend";

export const PDF_OPTIONS = [
  { key: "5-fatal-mistakes",      label: "5 Fatal Mistakes That Kill Prop Accounts",  file: "eleusis-fx-5-fatal-mistakes.pdf" },
  { key: "30-day-blueprint",      label: "The 30-Day Evaluation Blueprint",             file: "eleusis-fx-30-day-blueprint.pdf" },
  { key: "funded-trader-mindset", label: "The Funded Trader Mindset",                  file: "eleusis-fx-funded-trader-mindset.pdf" },
] as const;

export type PdfKey = (typeof PDF_OPTIONS)[number]["key"];

interface SendPdfArgs {
  to: string;
  firstName: string;
  pdfKey: PdfKey;
  siteUrl: string;
}

export async function sendPdfEmail({ to, firstName, pdfKey, siteUrl }: SendPdfArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    console.warn("[email] RESEND_API_KEY or RESEND_FROM not configured — skipping PDF email");
    return;
  }

  const pdf = PDF_OPTIONS.find((p) => p.key === pdfKey);
  if (!pdf) throw new Error(`Unknown PDF key: ${pdfKey}`);

  const pdfUrl = `${siteUrl}/${pdf.file}`;
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `${pdf.label} — From Eleusis FX`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${pdf.label}</title>
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
          <h1 style="margin:0 0 16px;font-size:32px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">
            Just Keeping In Touch.
          </h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">
            Hi ${firstName}, we put together this resource for traders working toward getting funded. We thought you'd find it useful.
          </p>
        </td></tr>

        <!-- PDF download -->
        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Your Resource</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.2);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:28px 28px 24px;">
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#e8eaf0;letter-spacing:-0.5px;font-family:Arial,sans-serif;">
                ${pdf.label}
              </h2>
              <p style="margin:0 0 24px;font-size:13px;line-height:1.75;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">
                Click below to download your free guide. No sign-up required — it&apos;s yours.
              </p>
              <a href="${pdfUrl}" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Download Guide &rarr;</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Ready to Get Funded?</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.75;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">
            If you&apos;re ready to take your prop challenge seriously, we&apos;re here. Our team handles the challenge — you keep the profits.
          </p>
          <a href="${siteUrl}/#apply" style="display:inline-block;background:transparent;color:#4f8ef7;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:13px 24px;text-decoration:none;border:1px solid rgba(79,142,247,0.4);font-family:Arial,sans-serif;">Apply Now &rarr;</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:32px;">
          <p style="margin:0;font-size:11px;color:rgba(210,220,240,0.28);line-height:1.7;font-family:Arial,sans-serif;">
            Eleusis FX &nbsp;&middot;&nbsp; <a href="${siteUrl}" style="color:rgba(210,220,240,0.28);text-decoration:none;">${siteUrl.replace("https://", "")}</a><br>
            You received this because you previously enquired about our services. Reply directly to unsubscribe.
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
