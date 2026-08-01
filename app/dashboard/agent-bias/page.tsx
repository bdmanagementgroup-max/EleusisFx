import { getSupabaseServerClient } from "@/lib/supabase/server";
import AgentBiasCard, { type PublishedBiasRow } from "./AgentBiasCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Outlook — Eleusis FX Dashboard",
};

export default async function AgentBiasPage() {
  const supabase = await getSupabaseServerClient();

  const { data: rows, error } = await supabase
    .from("agent_bias")
    .select("id, run_date, display_pair, rating, executive_summary, bull_case, bear_case")
    .eq("status", "published")
    .order("run_date", { ascending: false })
    .limit(50);

  if (error) {
    console.error("agent_bias fetch failed:", error);
  }

  const list = (rows ?? []) as PublishedBiasRow[];
  const latestDate = list[0]?.run_date;
  const latest = latestDate ? list.filter((r) => r.run_date === latestDate) : [];

  return (
    <div style={{ padding: "40px 40px 80px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>
          AI Outlook
        </div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1 }}>
          Daily Agent Bias
        </h1>
      </div>

      <div style={{ padding: "14px 20px", background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 4, marginBottom: 32, fontSize: 13, color: "rgba(210,220,240,0.88)" }}>
        Experimental — a supplementary directional bias from an automated multi-agent debate, not a trade instruction. See <a href="/dashboard/signals" style={{ color: "#4f8ef7" }}>Signals</a> for the primary service.
      </div>

      {latest.length === 0 && (
        <div style={{ padding: 40, background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, textAlign: "center" }}>
          <p style={{ color: "rgba(210,220,240,0.88)" }}>No bias published yet. Check back soon.</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {latest.map((row) => (
          <AgentBiasCard key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
}
