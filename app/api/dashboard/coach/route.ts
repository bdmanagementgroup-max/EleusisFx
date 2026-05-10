import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { data: messages, error } = await supabase
      .from("coach_sessions")
      .select("id, user_id, message, role, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        messages: messages?.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.message,
        })) || [],
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load session history";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500 }
    );
  }

  const { messages } = await req.json();

  // Save user's latest message to session
  const userMessage = messages[messages.length - 1];
  if (userMessage?.role === "user") {
    await supabase.from("coach_sessions").insert({
      user_id: user.id,
      message: userMessage.content,
      role: "user",
    });
  }

  const adminClient = await getSupabaseAdminClient();

  const [{ data: metrics }, { data: history }, { data: signals }] = await Promise.all([
    supabase
      .from("client_metrics")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("equity_history")
      .select("recorded_at, equity")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: true })
      .limit(30),
    adminClient
      .from("trading_signals")
      .select("pair, direction, bias, entry_price, stop_loss, tp1, tp2, risk_reward, session, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const m = metrics ?? {};

  const daysRemaining =
    m.days_allowed != null && m.days_used != null
      ? m.days_allowed - m.days_used
      : null;

  const equitySeries =
    history && history.length > 0
      ? history
          .map(
            (r: { recorded_at: string; equity: number }, i: number) =>
              `Day ${i + 1}: $${Number(r.equity).toLocaleString()}`
          )
          .join(", ")
      : "No equity history available";

  const signalsBlock =
    signals && signals.length > 0
      ? signals
          .map((s: {
            pair: string;
            direction?: string;
            bias?: string;
            entry_price?: number | null;
            stop_loss?: number | null;
            tp1?: number | null;
            tp2?: number | null;
            risk_reward?: number | null;
            session?: string;
            created_at?: string;
          }) =>
            [
              `${s.pair} — ${s.direction ?? s.bias ?? "N/A"}`,
              s.entry_price != null ? `Entry: ${s.entry_price}` : null,
              s.stop_loss != null ? `SL: ${s.stop_loss}` : null,
              s.tp1 != null ? `TP1: ${s.tp1}` : null,
              s.tp2 != null ? `TP2: ${s.tp2}` : null,
              s.risk_reward != null ? `R:R ${s.risk_reward}` : null,
              s.session ? `Session: ${s.session}` : null,
            ]
              .filter(Boolean)
              .join(" | ")
          )
          .join("\n")
      : "No recent signals.";

  const system = `You are the Eleusis FX AI Trading Coach — a private performance analyst embedded in the trader's dashboard. You have real-time access to this trader's challenge metrics and provide honest, specific, data-driven coaching.

TRADER METRICS (live):
Prop Firm: ${m.prop_firm ?? "Unknown"}
Phase: ${m.phase ?? "Unknown"} — ${m.phase_status ?? "Unknown"}
Account Balance: $${m.balance != null ? Number(m.balance).toLocaleString() : "N/A"}
Current Equity: $${m.equity != null ? Number(m.equity).toLocaleString() : "N/A"}
Daily Drawdown Used: ${m.daily_drawdown != null ? m.daily_drawdown : "N/A"}%
Max Drawdown Used: ${m.max_drawdown != null ? m.max_drawdown : "N/A"}%
Profit Target Reached: ${m.profit_target != null ? m.profit_target : "N/A"}% of ${m.profit_goal != null ? m.profit_goal : "N/A"}% goal
Days Used: ${m.days_used != null ? m.days_used : "N/A"} of ${m.days_allowed != null ? m.days_allowed : "N/A"} allowed (${daysRemaining != null ? daysRemaining : "N/A"} remaining)
Equity History (last ${history?.length ?? 0} days): ${equitySeries}

RECENT AI SIGNALS (from our trading analysis tool):
${signalsBlock}

COACHING RULES:
- Always reference the trader's specific numbers — never give generic advice
- Be direct and honest: if they are behind pace, say so; if they are in danger of failing, tell them clearly
- Keep responses under 200 words unless the trader explicitly asks for more detail
- Use short paragraphs. No bullet lists unless listing specific action points.
- Never recommend specific trades or tell them what to buy/sell — only discuss risk management, discipline, and challenge strategy
- If the trader asks about something unrelated to trading, gently redirect`;

  const anthropic = new Anthropic({ apiKey, maxRetries: 3 });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      try {
        const msgStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: [
            {
              type: "text",
              text: system,
              cache_control: { type: "ephemeral" }
            }
          ],
          messages,
        });
        for await (const event of msgStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullResponse += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        // Save assistant response to session
        await supabase.from("coach_sessions").insert({
          user_id: user.id,
          message: fullResponse,
          role: "assistant",
        });

        controller.close();
      } catch (err) {
        let msg = "Coaching unavailable";
        if (err instanceof Error) {
          try {
            const parsed = JSON.parse(err.message);
            msg = parsed?.error?.message ?? err.message;
          } catch {
            msg = err.message;
          }
        }
        controller.enqueue(encoder.encode(`\n\n[ERROR] ${msg}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
