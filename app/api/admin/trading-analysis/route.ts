import { NextRequest, after } from "next/server";
import OpenAI from "openai";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { logAPIUsage } from "@/lib/api-cost-tracking";
import {
  FOREX_PAIRS,
  CRYPTO_PAIRS,
  SYSTEM_PROMPT,
  fetchMarketTA,
} from "@/lib/trading/indicators";
import { sendToTelegram } from "@/lib/telegram/sendToTelegram";
import { sendToDiscord } from "@/lib/discord/sendToDiscord";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OPENROUTER_API_KEY not set — add it to Vercel environment variables and redeploy" }),
      { status: 500 }
    );
  }

  const body = await req.json();
  const { session, focus, newsLevel } = body;
  const macroMode: boolean = body.macroMode ?? false;

  const forexPairs = focus === "crypto" ? [] : FOREX_PAIRS;
  const cryptoPairs = focus === "forex" ? [] : CRYPTO_PAIRS;

  const [forexData, cryptoData] = await Promise.all([
    forexPairs.length > 0 ? fetchMarketTA(forexPairs) : Promise.resolve("Forex skipped."),
    cryptoPairs.length > 0 ? fetchMarketTA(cryptoPairs) : Promise.resolve("Crypto skipped."),
  ]);

  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const newsCtx =
    newsLevel === "major" ? "⚠️ MAJOR HIGH-IMPACT NEWS DUE TODAY (NFP/FOMC/CPI) — flag risk on correlated pairs or avoid."
    : newsLevel === "light" ? "Minor news scheduled today. Flag pairs with correlated data risk."
    : "No major news events today. Clean technical environment.";

  const focusCtx =
    focus === "forex" ? "Scan FOREX pairs only."
    : focus === "crypto" ? "Scan CRYPTO pairs only."
    : "Scan both FOREX and CRYPTO.";

  const macroInstruction = macroMode ? `

---
**MACRO MODE — REQUIRED ADDITIONAL SECTION:**

Before outputting individual signals, open with a "### MACRO OVERVIEW" section covering:
1. **Dollar Strength** — Derive DXY bias from all USD pairs (EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, USDCHF, NZDUSD). State clearly: USD Bullish / USD Bearish / USD Neutral.
2. **Market Regime** — Based on ATR across major pairs: Trending, Ranging, or High Volatility. Name the 2–3 pairs with highest current ATR.
3. **Correlation Clusters** — Identify which pairs are moving together (e.g. GBP pairs, commodity currencies). Warn about stacking correlated positions.
4. **Risk Sentiment** — Risk-On, Risk-Off, or Mixed. Base on: JPY strength/weakness, AUD/NZD direction, BTC trend.
5. **${session} Session Bias** — 2 sentences on what this session typically drives and what to watch for today given the macro context.

Keep the macro overview to 5 bullet-style paragraphs, one per point above. Then proceed to individual pair signals as normal.
` : "";

  const userMessage = `Run the Eleusis Fx market analysis.

**Date:** ${dateStr}
**Session:** ${session}
**Market Focus:** ${focusCtx}
**News Environment:** ${newsCtx}

---
**LIVE TECHNICAL DATA (Yahoo Finance — Daily OHLCV, indicators calculated server-side):**

${forexPairs.length > 0 ? `FOREX:\n${forexData}` : ""}

${cryptoPairs.length > 0 ? `CRYPTO:\n${cryptoData}` : ""}
${macroInstruction}
---

Use the indicator values above as your primary analysis foundation. Derive DXY bias yourself from the USD pairs. Apply the full confluence framework. Only report pairs with genuine 3+ signal alignment.`;

  const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://eleusisfx.com",
      "X-Title": "Eleusis FX Trading Analysis",
    },
  });

  const encoder = new TextEncoder();
  const chunks: string[] = [];
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // NOTE: OpenRouter retired the free tier of gpt-oss-120b and deepseek-r1
        // (they now 404 → "use the paid slug"). These are the currently-free,
        // instruction-following models. gpt-oss-20b is first because it's the
        // same family as the old default and best preserves the signal format
        // that parseSignals() depends on. Free tier still 429s under load — the
        // loop falls through, and a paid fallback can be appended if credited.
        const FREE_MODEL_CANDIDATES = [
          "openai/gpt-oss-20b:free",
          "qwen/qwen3-next-80b-a3b-instruct:free",
          "meta-llama/llama-3.3-70b-instruct:free",
        ];

        type StreamChunk = { choices: Array<{ delta?: { content?: string | null } }> };

        let completion: AsyncIterable<StreamChunk> | undefined;
        let lastErr: unknown;
        for (const model of FREE_MODEL_CANDIDATES) {
          try {
            completion = await openrouter.chat.completions.create({
              model,
              max_tokens: 4096,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMessage },
              ],
              stream: true,
            });
            break;
          } catch (err) {
            lastErr = err;
            console.warn(`[OpenRouter] ${model} failed, trying next free model`, err);
          }
        }
        if (!completion) throw lastErr ?? new Error("All free models rate-limited");

        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            chunks.push(text);
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();

        const body_md = chunks.join("");
        const requestDuration = Date.now() - startTime;

        logAPIUsage({
          service: "openrouter",
          endpoint: "/api/admin/trading-analysis",
          method: "POST",
          cost: 0,
          status: "success",
          request_duration_ms: requestDuration,
          metadata: { model: "openai/gpt-oss-20b:free", session, focus, newsLevel, macroMode: body.macroMode },
        }).catch((err) => console.error("[Cost Tracking] Failed to log:", err));

        // after() keeps the Vercel function alive after the stream response is sent
        after(async () => {
          try {
            console.log("[Telegram] Starting post to channel...");
            await sendToTelegram(body_md);
            console.log("[Telegram] ✅ Posted successfully");
          } catch (err) {
            console.error("[Telegram] ❌ Failed to post report:", err);
          }
          try {
            console.log("[Discord] Starting post to channel...");
            await sendToDiscord(body_md);
            console.log("[Discord] ✅ Posted successfully");
          } catch (err) {
            console.error("[Discord] ❌ Failed to post report:", err);
          }
          try {
            await supabase.from("signals").insert({
              session,
              focus,
              body_md,
              posted_telegram: true,
              posted_instagram: false,
            });
          } catch (err) {
            console.error("[Supabase] ❌ Failed to save signal:", err);
          }
        });
      } catch (err) {
        let msg = "Analysis failed";
        let errorMessage = "";
        if (err instanceof Error) {
          try {
            const parsed = JSON.parse(err.message);
            msg = parsed?.error?.message ?? err.message;
          } catch {
            msg = err.message;
          }
          errorMessage = err.message;
        }

        logAPIUsage({
          service: "openrouter",
          endpoint: "/api/admin/trading-analysis",
          method: "POST",
          cost: 0,
          status: "error",
          error_message: errorMessage,
          request_duration_ms: Date.now() - startTime,
          metadata: { session, focus, newsLevel },
        }).catch((err) => console.error("[Cost Tracking] Failed to log error:", err));

        controller.enqueue(encoder.encode(`\n\n[ERROR] ${msg}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
