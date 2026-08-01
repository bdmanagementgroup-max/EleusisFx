"use client";

import { useState } from "react";

export interface AgentBiasRow {
  id: string;
  run_date: string;
  instrument: string;
  display_pair: string;
  rating: string;
  executive_summary: string;
  bull_case: string | null;
  bear_case: string | null;
  trader_action: string | null;
  entry_price: number | null;
  stop_loss: number | null;
  position_sizing: string | null;
  full_debate: Record<string, string> | null;
  status: string;
}

const RATING_COLOR: Record<string, string> = {
  Buy: "#22c55e",
  Overweight: "#22c55e",
  Hold: "rgba(210,220,240,0.58)",
  Underweight: "#ef4444",
  Sell: "#ef4444",
};

export default function AgentBiasReviewClient({ initialRows }: { initialRows: AgentBiasRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(id: string, status: "published" | "rejected") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/agent-bias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r.id !== id));
      } else {
        const body = await res.json().catch(() => ({}));
        alert(`Failed to update: ${body.error ?? res.statusText}`);
      }
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div style={{ padding: 40, background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, textAlign: "center" }}>
        <p style={{ color: "rgba(210,220,240,0.88)" }}>No bias runs waiting for review.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
      {rows.map((row) => {
        const expanded = expandedId === row.id;
        const color = RATING_COLOR[row.rating] ?? "rgba(210,220,240,0.58)";
        return (
          <div key={row.id} style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "24px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#e8eaf0" }}>
                  {row.display_pair}
                </div>
                <div style={{ fontSize: 11, color: "rgba(210,220,240,0.58)" }}>{row.run_date}</div>
              </div>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color, background: `${color}1a`, padding: "6px 12px", borderRadius: 2 }}>
                {row.rating}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setExpandedId(expanded ? null : row.id)}
                  style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#e8eaf0", padding: "8px 14px", borderRadius: 2, cursor: "pointer", fontSize: 12 }}
                >
                  {expanded ? "Hide debate" : "View debate"}
                </button>
                <button
                  disabled={busyId === row.id}
                  onClick={() => review(row.id, "rejected")}
                  style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444", padding: "8px 14px", borderRadius: 2, cursor: "pointer", fontSize: 12 }}
                >
                  Reject
                </button>
                <button
                  disabled={busyId === row.id}
                  onClick={() => review(row.id, "published")}
                  style={{ background: "#4f8ef7", border: "none", color: "#fff", padding: "8px 14px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                >
                  Approve
                </button>
              </div>
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(210,220,240,0.88)", marginTop: 16 }}>
              {row.executive_summary}
            </p>

            {row.trader_action && (
              <div style={{ fontSize: 12, color: "rgba(210,220,240,0.58)", marginTop: 8 }}>
                Trader: {row.trader_action}
                {row.entry_price != null && ` · Entry ${row.entry_price}`}
                {row.stop_loss != null && ` · Stop ${row.stop_loss}`}
                {row.position_sizing && ` · ${row.position_sizing}`}
              </div>
            )}

            {expanded && (
              <div style={{ marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "grid", gap: 16 }}>
                {row.bull_case && (
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#22c55e", marginBottom: 6 }}>Bull case</div>
                    <p style={{ fontSize: 13, color: "rgba(210,220,240,0.88)", lineHeight: 1.7 }}>{row.bull_case}</p>
                  </div>
                )}
                {row.bear_case && (
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#ef4444", marginBottom: 6 }}>Bear case</div>
                    <p style={{ fontSize: 13, color: "rgba(210,220,240,0.88)", lineHeight: 1.7 }}>{row.bear_case}</p>
                  </div>
                )}
                {row.full_debate?.riskDebate && (
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 6 }}>Risk debate</div>
                    <p style={{ fontSize: 13, color: "rgba(210,220,240,0.88)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{row.full_debate.riskDebate}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
