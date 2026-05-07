import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServerClient } from "@/lib/supabase/server";
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not set — add it to Vercel environment variables and redeploy" },
      { status: 500 }
    );
  }

  const { session, focus, news } = await req.json();

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
    news === "major" ? "⚠️ MAJOR HIGH-IMPACT NEWS DUE TODAY (NFP/FOMC/CPI) — flag risk on correlated pairs or avoid."
    : news === "light" ? "Minor news scheduled today. Flag pairs with correlated data risk."
    : "No major news events today. Clean technical environment.";

  const focusCtx =
    focus === "forex" ? "Scan FOREX pairs only."
    : focus === "crypto" ? "Scan CRYPTO pairs only."
    : "Scan both FOREX and CRYPTO.";

  const userMessage = `Run the Eleusis Fx market analysis.

**Date:** ${dateStr}
**Session:** ${session}
**Market Focus:** ${focusCtx}
**News Environment:** ${newsCtx}

---
**LIVE TECHNICAL DATA (Yahoo Finance — Daily OHLCV, indicators calculated server-side):**

${forexPairs.length > 0 ? `FOREX:\n${forexData}` : ""}

${cryptoPairs.length > 0 ? `CRYPTO:\n${cryptoData}` : ""}

---

Use the indicator values above as your primary analysis foundation. Derive DXY bias yourself from the USD pairs. Apply the full confluence framework. Only report pairs with genuine 3+ signal alignment.`;

  try {
    const anthropic = new Anthropic({ apiKey, maxRetries: 3 });
    const msg = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const report = msg.content[0]?.type === "text" ? msg.content[0].text : "";

    return NextResponse.json({
      report,
      session,
      focus,
      news,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    let message = "Analysis failed";
    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message);
        message = parsed?.error?.message ?? err.message;
      } catch {
        message = err.message;
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
