// One-shot: fetch market data → Claude Opus → post to Telegram
import { readFileSync } from "fs";
import { join } from "path";
import Anthropic from "@anthropic-ai/sdk";
import {
  FOREX_PAIRS, CRYPTO_PAIRS, SYSTEM_PROMPT, fetchMarketTA,
} from "../lib/trading/indicators";
import { sendToTelegram } from "../lib/telegram/sendToTelegram";

async function main() {
  // Load .env.local
  const envPath = join(process.cwd(), ".env.local");
  const envLines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of envLines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }

  const NOW = new Date();
  const dateStr = NOW.toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const hour = NOW.getUTCHours();
  const session =
    hour >= 7 && hour < 12  ? "London" :
    hour >= 12 && hour < 17 ? "New York" :
    hour >= 22 || hour < 2  ? "Asian" : "Overlap";

  console.log(`Running analysis — ${dateStr} — ${session} session`);
  console.log("Fetching OHLCV from Yahoo Finance...");

  const [forexData, cryptoData] = await Promise.all([
    fetchMarketTA(FOREX_PAIRS),
    fetchMarketTA(CRYPTO_PAIRS),
  ]);

  console.log("Market data fetched. Calling Claude Opus...");

  const userMessage = `Run the Eleusis Fx market analysis.

**Date:** ${dateStr}
**Session:** ${session}
**Market Focus:** Scan both FOREX and CRYPTO.
**News Environment:** No major news events today. Clean technical environment.

---
**LIVE TECHNICAL DATA (Yahoo Finance — Daily OHLCV, indicators calculated server-side):**

FOREX:
${forexData}

CRYPTO:
${cryptoData}

---

Use the indicator values above as your primary analysis foundation. Derive DXY bias yourself from the USD pairs. Apply the full confluence framework. Only report pairs with genuine 3+ signal alignment.`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY!, maxRetries: 3 });

  let fullReport = "";
  process.stdout.write("Streaming: ");
  const stream = anthropic.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      fullReport += event.delta.text;
      process.stdout.write(".");
    }
  }
  process.stdout.write("\n");

  console.log(`\nReport complete (${fullReport.length} chars). Posting to Telegram...`);
  await sendToTelegram(fullReport);
  console.log("Done — check the channel.");
}

main().catch(console.error);
