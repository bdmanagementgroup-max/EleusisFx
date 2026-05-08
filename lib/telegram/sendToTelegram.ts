/**
 * Eleusis Fx — Telegram Report Poster
 *
 * Called automatically after every trading analysis run.
 * Converts the Claude-generated markdown report to Telegram HTML,
 * splits into ≤4000-char chunks (breaking at paragraph boundaries),
 * posts a branded header first, then the report, then a CTA footer.
 *
 * Env vars required:
 *   TELEGRAM_BOT_TOKEN   — from @BotFather
 *   TELEGRAM_CHANNEL_ID  — e.g. @eleusisfxofficial or numeric -100xxx
 */

const MAX_LEN = 4000; // Telegram hard limit is 4096; leave headroom

// ─── Markdown → Telegram-safe HTML ───────────────────────────────────────────
// Keeps formatting readable without MarkdownV2 escaping nightmares.

function mdToHtml(text: string): string {
  return (
    text
      // #### / ### / ## headings → bold
      .replace(/^#{1,4}\s+(.+)$/gm, "<b>$1</b>")
      // **bold**
      .replace(/\*\*(.+?)\*\*/gs, "<b>$1</b>")
      // *italic* (single asterisk only)
      .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/gs, "<i>$1</i>")
      // `code`
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Horizontal rules → visual divider
      .replace(/^---+$/gm, "─────────────────────────")
      // ✅ / ❌ signals already use emoji — leave them
      // Escape bare & that aren't already HTML entities
      .replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&amp;")
  );
}

// ─── Split text at paragraph boundaries, never exceeding MAX_LEN ─────────────

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
      // Single paragraph longer than MAX_LEN → split by line
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

// ─── Single message sender with one retry on 429 (rate limit) ─────────────────

async function postMessage(token: string, channelId: string, text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = JSON.stringify({
    chat_id: channelId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });

  const send = async () =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });

  let res = await send();

  // Telegram 429: retry after suggested delay
  if (res.status === 429) {
    const data = await res.json().catch(() => ({}));
    const retryAfter = data?.parameters?.retry_after ?? 5;
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    res = await send();
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API ${res.status}: ${err}`);
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function sendToTelegram(report: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!token || !channelId) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not set — skipping.");
    return;
  }

  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 1. Header
  const header =
    `📊 <b>ELEUSIS FX — MARKET ANALYSIS</b>\n` +
    `🗓 ${dateStr}\n` +
    `─────────────────────────\n` +
    `<i>Full report below. All setups require 3+ confluence signals minimum. Not financial advice.</i>`;

  await postMessage(token, channelId, header);
  await new Promise((r) => setTimeout(r, 400));

  // 2. Report body — convert and chunk
  const html = mdToHtml(report);
  const chunks = splitIntoChunks(html);

  for (let i = 0; i < chunks.length; i++) {
    await postMessage(token, channelId, chunks[i]);
    // Small delay between messages to avoid rate limiting
    if (i < chunks.length - 1) {
      await new Promise((r) => setTimeout(r, 350));
    }
  }

  // 3. Footer CTA
  await new Promise((r) => setTimeout(r, 400));
  const footer =
    `🔥 <b>Want a funded account without the grind?</b>\n\n` +
    `Eleusis Fx trades your prop firm evaluation for you — guaranteed pass + 20% profit share on the live account.\n\n` +
    `👉 <a href="https://eleusisfx.uk">eleusisfx.uk</a>\n` +
    `📩 DM @eleusisfx to apply\n\n` +
    `#EleusisFx #ForexSignals #PropFirm #FundedTrader #TradingSetup`;

  await postMessage(token, channelId, footer);

  console.log(`[Telegram] ✅ Report posted — ${chunks.length + 2} messages sent to ${channelId}`);
}
