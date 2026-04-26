"use client";

import { useState } from "react";

type MetricsRow = {
  user_id: string;
  email: string;
  prop_firm: string | null;
  phase: number;
  phase_status: string;
  balance: number;
  equity: number;
  daily_drawdown: number;
  max_drawdown: number;
  profit_target: number;
  profit_goal: number;
  days_used: number;
  days_allowed: number;
  updated_at: string | null;
};

const PHASE_STATUSES = ["in_progress", "passed", "failed"];

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "#020305", border: "1px solid rgba(255,255,255,0.1)",
  color: "#e8eaf0", fontSize: 13, padding: "8px 10px",
  outline: "none", fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
  color: "rgba(232,234,240,0.3)", display: "block", marginBottom: 6,
};

export default function MetricsClient({ rows: initial }: { rows: MetricsRow[] }) {
  const [rows, setRows] = useState(initial);
  const [selected, setSelected] = useState<MetricsRow | null>(null);
  const [fields, setFields] = useState<Partial<MetricsRow>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function openRow(row: MetricsRow) {
    setSelected(row);
    setFields({ ...row });
    setSaved(false);
  }

  function set(key: keyof MetricsRow, value: string | number) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    const res = await fetch("/api/admin/metrics", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: selected.user_id, ...fields }),
    });
    const updated = await res.json();
    setSaving(false);
    if (!updated.error) {
      const merged = { ...updated, email: selected.email };
      setRows((prev) => prev.map((r) => (r.user_id === selected.user_id ? merged : r)));
      setSelected(merged);
      setFields(merged);
      setSaved(true);
    }
  }

  if (rows.length === 0) {
    return (
      <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "40px 28px", fontSize: 13, color: "rgba(210,220,240,0.88)" }}>
        No client metrics yet. Create a client account first.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* List */}
      <div style={{ flex: 1 }}>
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          {rows.map((row) => (
            <div
              key={row.user_id}
              onClick={() => openRow(row)}
              style={{
                display: "grid", gridTemplateColumns: "1fr auto auto auto",
                padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                alignItems: "center", gap: 16, cursor: "pointer",
                background: selected?.user_id === row.user_id ? "rgba(79,142,247,0.06)" : "transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (selected?.user_id !== row.user_id) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
              onMouseLeave={(e) => { if (selected?.user_id !== row.user_id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div>
                <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 600, fontSize: 14, color: "#e8eaf0" }}>{row.email}</div>
                <div style={{ fontSize: 11, color: "rgba(210,220,240,0.88)" }}>{row.prop_firm || "No prop firm"}</div>
              </div>
              <span style={{ fontSize: 11, color: "rgba(210,220,240,0.88)" }}>Phase {row.phase}</span>
              <span style={{
                fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", padding: "3px 10px",
                background: row.phase_status === "passed" ? "rgba(34,197,94,0.08)" : row.phase_status === "failed" ? "rgba(239,68,68,0.08)" : "rgba(79,142,247,0.08)",
                color: row.phase_status === "passed" ? "#22c55e" : row.phase_status === "failed" ? "#ef4444" : "#4f8ef7",
              }}>
                {row.phase_status.replace("_", " ")}
              </span>
              <span style={{ fontSize: 12, color: "#22c55e" }}>${Number(row.balance).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit panel */}
      {selected && (
        <div style={{
          width: 340, flexShrink: 0, background: "#08090f",
          border: "1px solid rgba(79,142,247,0.2)", padding: "28px 24px",
          position: "sticky", top: 20,
        }}>
          <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 16, color: "#e8eaf0", marginBottom: 4 }}>
            {selected.email}
          </div>
          <div style={{ fontSize: 11, color: "rgba(210,220,240,0.4)", marginBottom: 24 }}>Edit challenge metrics</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Prop Firm</label>
              <input value={fields.prop_firm ?? ""} onChange={(e) => set("prop_firm", e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Phase</label>
                <select value={fields.phase ?? 1} onChange={(e) => set("phase", Number(e.target.value))} style={inputStyle}>
                  <option value={1}>Phase 1</option>
                  <option value={2}>Phase 2</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={fields.phase_status ?? "in_progress"} onChange={(e) => set("phase_status", e.target.value)} style={inputStyle}>
                  {PHASE_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Balance ($)</label>
                <input type="number" value={fields.balance ?? 0} onChange={(e) => set("balance", Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Equity ($)</label>
                <input type="number" value={fields.equity ?? 0} onChange={(e) => set("equity", Number(e.target.value))} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Daily DD (%)</label>
                <input type="number" step="0.01" value={fields.daily_drawdown ?? 0} onChange={(e) => set("daily_drawdown", Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Max DD (%)</label>
                <input type="number" step="0.01" value={fields.max_drawdown ?? 0} onChange={(e) => set("max_drawdown", Number(e.target.value))} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Profit Target (%)</label>
                <input type="number" step="0.01" value={fields.profit_target ?? 0} onChange={(e) => set("profit_target", Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Profit Goal (%)</label>
                <input type="number" step="0.01" value={fields.profit_goal ?? 10} onChange={(e) => set("profit_goal", Number(e.target.value))} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Days Used</label>
                <input type="number" value={fields.days_used ?? 0} onChange={(e) => set("days_used", Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Days Allowed</label>
                <input type="number" value={fields.days_allowed ?? 30} onChange={(e) => set("days_allowed", Number(e.target.value))} style={inputStyle} />
              </div>
            </div>

            <button
              onClick={save}
              disabled={saving}
              style={{
                background: "#4f8ef7", color: "#020305", border: "none",
                fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700,
                fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                padding: "12px", cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1, marginTop: 4,
              }}
            >
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
