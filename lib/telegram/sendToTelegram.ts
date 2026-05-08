const MAX_MESSAGE_LENGTH = 4000;

function splitMessage(text: string): string[] {
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > MAX_MESSAGE_LENGTH) {
    const breakAt = remaining.lastIndexOf("\n", MAX_MESSAGE_LENGTH);
    const splitAt = breakAt > 100 ? breakAt : MAX_MESSAGE_LENGTH;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).replace(/^\n+/, "");
  }
  if (remaining.trim()) chunks.push(remaining);
  return chunks;
}

export async function sendToTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !channelId) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not set — skipping");
    return;
  }

  const chunks = splitMessage(text);
  for (const chunk of chunks) {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: channelId, text: chunk }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[Telegram] sendMessage failed:", err);
    }
  }
}
