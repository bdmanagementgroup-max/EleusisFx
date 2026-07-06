/**
 * Eleusis Fx — Discord Report Poster
 *
 * Called automatically after every trading analysis run, alongside sendToTelegram.
 * Discord webhooks natively render markdown (**bold**, `code`, etc.) so no
 * HTML conversion is needed — just chunk to Discord's 2000-char message limit.
 *
 * Env var required:
 *   DISCORD_WEBHOOK_SIGNALS — created manually in Discord:
 *     Server → right-click channel → Edit Channel → Integrations → Webhooks → New Webhook
 *   Must also be set in Vercel's environment variables for production.
 */

const MAX_LEN = 1900; // Discord hard limit is 2000; leave headroom

function splitIntoChunks(text: string): string[] {
  if (text.length <= MAX_LEN) return [text];

  const chunks: string[] = [];
  const paragraphs = text.split(/\n{2,}/);
  let current = "";

  for (const para of paragraphs) {
    const next = current ? `${current}\n\n${para}` : para;
    if (next.length <= MAX_LEN) {
      current = next;
    } else {
      if (current) chunks.push(current.trim());
      if (para.length > MAX_LEN) {
        const lines = para.split("\n");
        let buf = "";
        for (const line of lines) {
          const candidate = buf ? `${buf}\n${line}` : line;
          if (candidate.length > MAX_LEN) {
            if (buf) chunks.push(buf.trim());
            buf = line;
          } else {
            buf = candidate;
          }
        }
        current = buf;
      } else {
        current = para;
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

// ─── Single message sender with retry on 429 ─────────────────────────────────

async function postToWebhook(webhookUrl: string, content: string): Promise<void> {
  const send = async () =>
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

  let res = await send();

  if (res.status === 429) {
    const data = await res.json().catch(() => ({}));
    const retryAfter = data?.retry_after ?? 2;
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    res = await send();
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord webhook ${res.status}: ${err}`);
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function sendToDiscord(report: string): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_SIGNALS;

  if (!webhookUrl) {
    console.warn("[Discord] DISCORD_WEBHOOK_SIGNALS not set — skipping.");
    return;
  }

  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const header =
    `📊 **ELEUSIS FX — MARKET ANALYSIS**\n` +
    `🗓 ${dateStr}\n` +
    `─────────────────────────\n` +
    `*Full report below. All setups require 3+ confluence signals minimum. Not financial advice.*`;

  await postToWebhook(webhookUrl, header);
  await new Promise((r) => setTimeout(r, 400));

  const chunks = splitIntoChunks(report);
  for (let i = 0; i < chunks.length; i++) {
    await postToWebhook(webhookUrl, chunks[i]);
    if (i < chunks.length - 1) {
      await new Promise((r) => setTimeout(r, 350));
    }
  }

  const footer =
    `🔥 **Want a funded account without the grind?**\n\n` +
    `Eleusis Fx trades your prop firm evaluation for you — guaranteed pass + profit share on the live account.\n\n` +
    `👉 https://eleusisfx.uk\n` +
    `📩 DM @eleusisfx to apply`;

  await new Promise((r) => setTimeout(r, 400));
  await postToWebhook(webhookUrl, footer);

  console.log(`[Discord] ✅ Report posted — ${chunks.length + 2} messages sent`);
}
