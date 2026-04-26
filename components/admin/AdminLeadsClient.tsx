"use client";

import { useState } from "react";

type Lead = {
  id: string;
  email: string;
  source: string | null;
  created_at: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminLeadsClient({ leads: initial }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    setDeleting(id);
    const res = await fetch("/api/leads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setLeads((prev) => prev.filter((l) => l.id !== id));
    setDeleting(null);
  }

  if (leads.length === 0) {
    return (
      <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "40px 28px", fontSize: 13, color: "rgba(210,220,240,0.88)" }}>
        No email leads yet — they'll appear here when someone downloads the free guide.
      </div>
    );
  }

  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
      {leads.map(({ id, email, source, created_at }) => (
        <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 13, color: "#e8eaf0" }}>{email}</span>
          <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(210,220,240,0.88)" }}>{source ?? "free_guide"}</span>
          <span style={{ fontSize: 11, color: "rgba(210,220,240,0.58)", whiteSpace: "nowrap" }}>{formatDate(created_at)}</span>
          <button
            onClick={() => deleteLead(id)}
            disabled={deleting === id}
            style={{
              background: "transparent", border: "1px solid rgba(239,68,68,0.3)",
              color: "rgba(239,68,68,0.6)", fontSize: 9, letterSpacing: 1.5,
              textTransform: "uppercase", padding: "4px 10px",
              cursor: deleting === id ? "not-allowed" : "pointer",
              opacity: deleting === id ? 0.4 : 1, fontFamily: "inherit",
            }}
          >
            {deleting === id ? "…" : "Delete"}
          </button>
        </div>
      ))}
    </div>
  );
}
