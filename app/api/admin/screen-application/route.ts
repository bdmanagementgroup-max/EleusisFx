import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing application id" }, { status: 400 });
  }

  const adminClient = await getSupabaseAdminClient();
  const { data: app, error } = await adminClient
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const fields = [
    `First Name: ${app.first_name ?? "—"}`,
    `Last Name: ${app.last_name ?? "—"}`,
    `Email: ${app.email ?? "—"}`,
    `Prop Firm: ${app.prop_firm ?? "—"}`,
    `Status: ${app.status ?? "—"}`,
    `WhatsApp: ${app.whatsapp ?? "—"}`,
    `Notes: ${app.notes ?? "—"}`,
    `Submitted: ${app.created_at ?? "—"}`,
  ];

  const extraKeys = Object.keys(app).filter(
    (k) => !["id", "first_name", "last_name", "email", "prop_firm", "status", "whatsapp", "notes", "created_at"].includes(k)
  );
  for (const k of extraKeys) {
    if (app[k] !== null && app[k] !== undefined) {
      fields.push(`${k}: ${app[k]}`);
    }
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const systemPrompt = `You are a risk screening assistant for Eleusis FX, a prop trading firm's onboarding team. Eleusis FX evaluates traders on prop challenges: 87% pass rate, 10% profit target, 30 days, max 8% drawdown.

Assess each application for: completeness, any red flags in prop firm choice, timeline signals, and anything unusual.

Risk score: 1 (safe, clear genuine trader) to 10 (concerning — possible fraudulent intent, rule-exploiter, or unrealistic expectations).

Return ONLY a valid JSON object with exactly these keys — no markdown fence, no extra text, no explanation:
{
  "score": <number 1-10>,
  "label": <"Low Risk" | "Medium Risk" | "High Risk">,
  "flags": <array of 0-3 strings, each under 12 words>,
  "recommendation": <string, 1-2 sentences, practical, addressed to the Eleusis admin team>,
  "resources": <array of 1-2 strings chosen from: "Send 5 Fatal Mistakes PDF", "Send 30-Day Blueprint PDF", "Request video call", "Ask for trading history", "Monitor closely">
}

Label rules: 1-3 = "Low Risk", 4-6 = "Medium Risk", 7-10 = "High Risk". Keep flags to 0-3 items, each under 12 words.`;

  const userMessage = `Screen this application:\n\n${fields.join("\n")}`;

  const response = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";

  let result;
  try {
    result = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  return NextResponse.json(result);
}
