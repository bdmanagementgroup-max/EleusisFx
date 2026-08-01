import { getSupabaseAdminClient } from "@/lib/supabase/server";
import AgentBiasReviewClient, { type AgentBiasRow } from "./AgentBiasReviewClient";
import AgentBiasControls from "./AgentBiasControls";

export const dynamic = "force-dynamic";

export default async function AgentBiasReviewPage() {
  const supabase = await getSupabaseAdminClient();
  const { data: rows, error } = await supabase
    .from("agent_bias")
    .select("id, run_date, instrument, display_pair, rating, executive_summary, bull_case, bear_case, trader_action, entry_price, stop_loss, position_sizing, full_debate, status")
    .order("run_date", { ascending: false })
    .order("display_pair", { ascending: true })
    .limit(300);

  const headerSection = (
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
  );

  if (error) {
    console.error("agent_bias fetch failed:", error);
    return (
      <div style={{ padding: "40px 40px 80px" }}>
        {headerSection}
        <AgentBiasControls />
        <div style={{
          backgroundColor: "#08090f",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
          padding: 24,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#ef4444", marginBottom: 8 }}>
            Database Fetch Failed
          </div>
          <p style={{ fontSize: 13, color: "rgba(210,220,240,0.88)", marginBottom: 12 }}>
            Failed to load agent bias review queue. Please check your connection and try refreshing the page.
          </p>
          <p style={{ fontSize: 11, color: "rgba(210,220,240,0.58)", fontFamily: "monospace" }}>
            Error: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 40px 80px" }}>
      {headerSection}
      <AgentBiasControls />
      <AgentBiasReviewClient initialRows={(rows ?? []) as AgentBiasRow[]} />
    </div>
  );
}
