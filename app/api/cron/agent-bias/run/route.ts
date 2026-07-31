import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { findInstrument } from "@/lib/agent-bias/instruments";
import { runAgentBiasPipeline } from "@/lib/agent-bias/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorizedCron(req: NextRequest): boolean {
  if (!process.env.CRON_SECRET) return false;
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { instrument: yahooSymbol } = await req.json();
  const instrument = findInstrument(yahooSymbol);
  if (!instrument) {
    return NextResponse.json({ error: `Unknown instrument: ${yahooSymbol}` }, { status: 400 });
  }

  try {
    const result = await runAgentBiasPipeline(instrument);
    const runDate = new Date().toISOString().slice(0, 10);

    const supabase = await getSupabaseAdminClient();
    const { error } = await supabase.from("agent_bias").upsert(
      {
        run_date: runDate,
        instrument: instrument.yahoo,
        display_pair: instrument.display,
        rating: result.rating,
        executive_summary: result.executiveSummary,
        bull_case: result.bullCase,
        bear_case: result.bearCase,
        trader_action: result.traderAction,
        entry_price: result.entryPrice,
        stop_loss: result.stopLoss,
        position_sizing: result.positionSizing,
        full_debate: result.fullDebate,
        status: "pending_review",
      },
      { onConflict: "run_date,instrument" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ instrument: instrument.yahoo, rating: result.rating });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pipeline failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
