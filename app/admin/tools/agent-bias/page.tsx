import { getSupabaseAdminClient } from "@/lib/supabase/server";
import AgentBiasReviewClient, { type AgentBiasRow } from "./AgentBiasReviewClient";

export const dynamic = "force-dynamic";

export default async function AgentBiasReviewPage() {
  const supabase = await getSupabaseAdminClient();
  const { data: rows } = await supabase
    .from("agent_bias")
    .select("id, run_date, instrument, display_pair, rating, executive_summary, bull_case, bear_case, trader_action, entry_price, stop_loss, position_sizing, full_debate, status")
    .eq("status", "pending_review")
    .order("run_date", { ascending: false })
    .order("display_pair", { ascending: true });

  return (
    <div style={{ padding: "40px 40px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>
          Tools
        </div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5 }}>
          Agent Bias Review
        </h1>
        <p style={{ fontSize: 13, color: "rgba(210,220,240,0.58)", marginTop: 8 }}>
          Nightly multi-agent directional bias, pending approval before it reaches the client dashboard.
        </p>
      </div>

      <AgentBiasReviewClient initialRows={(rows ?? []) as AgentBiasRow[]} />
    </div>
  );
}
