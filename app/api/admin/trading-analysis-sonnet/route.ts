/**
 * Testing endpoint: Trading analysis using Claude Sonnet instead of Opus
 *
 * Purpose: A/B test Sonnet vs Opus for cost/quality trade-off
 * Cost savings: Sonnet 4.6 is same price as Opus 4.7 in current pricing, but historically cheaper
 * Quality trade-off: Slightly lower analysis quality but still very capable
 *
 * Usage: POST /api/admin/trading-analysis-sonnet with same body as /api/admin/trading-analysis
 * Response: Same format, tagged with model="sonnet" in metadata
 */

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { logAPIUsage, calculateAnthropicCost } from "@/lib/api-cost-tracking";
import {
  FOREX_PAIRS,
  CRYPTO_PAIRS,
  SYSTEM_PROMPT,
  fetchMarketTA,
} from "@/lib/trading/indicators";
import { sendToTelegram } from "@/lib/telegram/sendToTelegram";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not set — add it to Vercel environment variables and redeploy" }),
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

  const anthropic = new Anthropic({ apiKey, maxRetries: 3 });
  const encoder = new TextEncoder();
  const chunks: string[] = [];
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const msgStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        });
        for await (const event of msgStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const text = event.delta.text;
            chunks.push(text);
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
        const body_md = chunks.join("");

        // Log API usage after stream completes
        const finalMsg = await msgStream.finalMessage();
        const inputTokens = finalMsg.usage?.input_tokens || 0;
        const outputTokens = finalMsg.usage?.output_tokens || 0;
        const cost = calculateAnthropicCost(inputTokens, outputTokens, "sonnet");
        const requestDuration = Date.now() - startTime;

        logAPIUsage({
          service: "anthropic",
          endpoint: "/api/admin/trading-analysis-sonnet",
          method: "POST",
          cost,
          tokens_input: inputTokens,
          tokens_output: outputTokens,
          status: "success",
          request_duration_ms: requestDuration,
          metadata: { model: "claude-sonnet-4-6", session, focus, newsLevel, macroMode: body.macroMode, testFlag: "sonnet_comparison" },
        }).catch((err) => console.error("[Cost Tracking] Failed to log:", err));

        Promise.all([
          sendToTelegram(body_md).catch((err) =>
            console.error("[Telegram] Failed to post report:", err)
          ),
          supabase.from("signals").insert({
            session,
            focus,
            body_md,
            posted_telegram: false, // Don't auto-post test signals
            posted_instagram: false,
          }),
        ]);
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

        // Log error
        logAPIUsage({
          service: "anthropic",
          endpoint: "/api/admin/trading-analysis-sonnet",
          method: "POST",
          cost: 0,
          status: "error",
          error_message: errorMessage,
          request_duration_ms: Date.now() - startTime,
          metadata: { session, focus, newsLevel, testFlag: "sonnet_comparison" },
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
      "X-Model": "claude-sonnet-4-6",
      "X-Test-Flag": "sonnet_comparison"
    },
  });
}
