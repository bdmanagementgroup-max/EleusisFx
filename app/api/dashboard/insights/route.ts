import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const [{ data: metrics }, { data: history }] = await Promise.all([
      supabase
        .from("client_metrics")
        .select("balance, equity, daily_drawdown, max_drawdown, profit_target, profit_goal, days_used, days_allowed, phase, phase_status, prop_firm")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("equity_history")
        .select("recorded_at, equity")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: true })
        .limit(30),
    ]);

    if (!metrics) {
      return NextResponse.json({ insights: [] });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ insights: [] });
    }

    const equitySeries = (history ?? []).map((r) => Number(r.equity));

    const userMessage = `
Trader metrics:
- Prop firm: ${metrics.prop_firm ?? "Unknown"}
- Phase: ${metrics.phase ?? "Unknown"} (${metrics.phase_status ?? "Unknown"})
- Balance: $${metrics.balance ?? 0}
- Current equity: $${metrics.equity ?? 0}
- Daily drawdown used: ${metrics.daily_drawdown ?? 0}%
- Max drawdown used: ${metrics.max_drawdown ?? 0}%
- Profit target reached: ${metrics.profit_target ?? 0}% of ${metrics.profit_goal ?? 0}% goal
- Days used: ${metrics.days_used ?? 0} of ${metrics.days_allowed ?? 0} allowed
- Equity history (last ${equitySeries.length} entries): [${equitySeries.join(", ")}]
`.trim();

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: `You are a trading performance analyst reviewing a prop challenge trader's progress.
Return ONLY a JSON array of 3-4 strings. No markdown. No wrapper object. No explanation.
Each string is one insight sentence, under 15 words, specific to the trader's numbers.
Cover: consistency trend from equity history variance, pace vs profit target, drawdown health, days-remaining trajectory.
Be honest — if they are behind pace or showing high drawdown, say so clearly but constructively.
Example output format: ["Insight one here.", "Insight two here.", "Insight three here."]`,
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "[]";

    let insights: string[] = [];
    try {
      const parsed = JSON.parse(text.trim());
      if (Array.isArray(parsed)) {
        insights = parsed.filter((s): s is string => typeof s === "string");
      }
    } catch {
      insights = [];
    }

    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json({ insights: [] });
  }
}
