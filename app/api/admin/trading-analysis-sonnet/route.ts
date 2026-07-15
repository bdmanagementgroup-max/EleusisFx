/**
 * Testing endpoint: Trading analysis using OpenRouter/Hermes (same as primary, no Telegram auto-post)
 *
 * Usage: POST /api/admin/trading-analysis-sonnet with same body as /api/admin/trading-analysis
 * Response: Same format, tagged with testFlag in metadata. Does NOT auto-post to Telegram.
 */

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { logAPIUsage } from "@/lib/api-cost-tracking";
import {
  FOREX_PAIRS,
  CRYPTO_PAIRS,
  SYSTEM_PROMPT,
  fetchMarketTA,
} from "@/lib/trading/indicators";

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
        // Free instruction models first (cost 0 when available), paid Claude
        // Sonnet as guaranteed fallback. Reasoning-only free models return empty
        // content on large prompts, so we read the stream inside the loop and
        // treat zero content as a failure — falling through, not returning nothing.
        const MODEL_CANDIDATES = [
          "qwen/qwen3-next-80b-a3b-instruct:free",
          "meta-llama/llama-3.3-70b-instruct:free",
          "anthropic/claude-sonnet-5", // paid fallback — funded OpenRouter account
        ];

        type StreamChunk = { choices: Array<{ delta?: { content?: string | null } }> };

        let usedModel: string | null = null;
        let lastErr: unknown;
        for (const model of MODEL_CANDIDATES) {
          try {
            const completion: AsyncIterable<StreamChunk> = await openrouter.chat.completions.create({
              model,
              max_tokens: 4096,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMessage },
              ],
              stream: true,
              // Disable extended thinking so the token budget produces content,
              // not reasoning (see trading-analysis route for the full rationale).
              ...({ reasoning: { enabled: false } } as object),
            });

            let modelChars = 0;
            for await (const chunk of completion) {
              const text = chunk.choices[0]?.delta?.content ?? "";
              if (text) {
                chunks.push(text);
                controller.enqueue(encoder.encode(text));
                modelChars += text.length;
              }
            }
            if (modelChars > 0) { usedModel = model; break; }
            console.warn(`[OpenRouter] ${model} returned 0 content chars, trying next model`);
          } catch (err) {
            lastErr = err;
            console.warn(`[OpenRouter] ${model} failed, trying next model`, err);
          }
        }
        if (!usedModel) throw lastErr ?? new Error("All models failed or returned empty content");
        controller.close();

        const body_md = chunks.join("");
        const requestDuration = Date.now() - startTime;

        logAPIUsage({
          service: "openrouter",
          endpoint: "/api/admin/trading-analysis-sonnet",
          method: "POST",
          cost: 0,
          status: "success",
          request_duration_ms: requestDuration,
          metadata: { model: usedModel, session, focus, newsLevel, macroMode: body.macroMode, testFlag: "hermes_test" },
        }).catch((err) => console.error("[Cost Tracking] Failed to log:", err));

        // Do NOT auto-post to Telegram from the test endpoint
        supabase.from("signals").insert({
          session,
          focus,
          body_md,
          posted_telegram: false,
          posted_instagram: false,
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
          endpoint: "/api/admin/trading-analysis-sonnet",
          method: "POST",
          cost: 0,
          status: "error",
          error_message: errorMessage,
          request_duration_ms: Date.now() - startTime,
          metadata: { session, focus, newsLevel, testFlag: "hermes_test" },
        }).catch((err) => console.error("[Cost Tracking] Failed to log error:", err));

        controller.enqueue(encoder.encode(`\n\n[ERROR] ${msg}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Model": "openrouter-fallback-chain",
    },
  });
}
