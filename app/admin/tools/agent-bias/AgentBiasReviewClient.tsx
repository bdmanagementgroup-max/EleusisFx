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

type Tab = "pending_review" | "published" | "rejected";

const TAB_LABEL: Record<Tab, string> = {
  pending_review: "Pending",
  published: "Approved",
  rejected: "Rejected",
};

const STATUS_BADGE: Record<Tab, { label: string; color: string }> = {
  pending_review: { label: "Pending", color: "rgba(210,220,240,0.58)" },
  published: { label: "Approved", color: "#22c55e" },
  rejected: { label: "Rejected", color: "#ef4444" },
};

export default function AgentBiasReviewClient({ initialRows }: { initialRows: AgentBiasRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [tab, setTab] = useState<Tab>("pending_review");
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
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      } else {
        const body = await res.json().catch(() => ({}));
        alert(`Failed to update: ${body.error ?? res.statusText}`);
      }
    } finally {
      setBusyId(null);
    }
  }

  const counts: Record<Tab, number> = {
    pending_review: rows.filter((r) => r.status === "pending_review").length,
    published: rows.filter((r) => r.status === "published").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };
  const visibleRows = rows.filter((r) => r.status === tab);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: tab === t ? "2px solid #4f8ef7" : "2px solid transparent",
              color: tab === t ? "#e8eaf0" : "rgba(210,220,240,0.58)",
              padding: "10px 4px",
              marginRight: 20,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {TAB_LABEL[t]} ({counts[t]})
          </button>
        ))}
      </div>

      {visibleRows.length === 0 && (
        <div style={{ padding: 40, background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, textAlign: "center" }}>
          <p style={{ color: "rgba(210,220,240,0.88)" }}>
            {tab === "pending_review" ? "No bias runs waiting for review." : `No ${TAB_LABEL[tab].toLowerCase()} runs yet.`}
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        {visibleRows.map((row) => {
          const expanded = expandedId === row.id;
          const color = RATING_COLOR[row.rating] ?? "rgba(210,220,240,0.58)";
          const badge = STATUS_BADGE[row.status as Tab] ?? STATUS_BADGE.pending_review;
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
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {(row.bull_case || row.bear_case || row.full_debate?.riskDebate) && (
                    <button
                      onClick={() => setExpandedId(expanded ? null : row.id)}
                      style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#e8eaf0", padding: "8px 14px", borderRadius: 2, cursor: "pointer", fontSize: 12 }}
                    >
                      {expanded ? "Hide debate" : "View debate"}
                    </button>
                  )}
                  {tab === "pending_review" ? (
                    <>
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
                    </>
                  ) : (
                    <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: badge.color, padding: "8px 4px" }}>
                      {badge.label}
                    </div>
                  )}
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
    </div>
  );
}
