"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PHASE_STATUSES = ["in_progress", "passed", "failed"];

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "#08090f", border: "1px solid rgba(255,255,255,0.1)",
  color: "#e8eaf0", fontSize: 13, padding: "10px 12px",
  outline: "none", fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
  color: "rgba(232,234,240,0.3)", display: "block", marginBottom: 6,
};

type Metrics = {
  user_id: string;
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
};

export default function ClientDetailClient({
  userId, metrics, equityCount,
}: {
  userId: string; metrics: Metrics; equityCount: number;
}) {
  const router = useRouter();

  // Equity entry state
  const today = new Date().toISOString().split("T")[0];
  const [equityDate, setEquityDate] = useState(today);
  const [equityValue, setEquityValue] = useState(String(metrics.equity));
  const [addingEquity, setAddingEquity] = useState(false);
  const [equityMsg, setEquityMsg] = useState("");

  // Edit metrics state
  const [fields, setFields] = useState<Metrics>({ ...metrics });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: keyof Metrics, value: string | number) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function addEquity(e: React.FormEvent) {
    e.preventDefault();
    setAddingEquity(true);
    setEquityMsg("");
    const res = await fetch("/api/admin/equity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, recorded_at: equityDate, equity: Number(equityValue) }),
    });
    const data = await res.json();
    setAddingEquity(false);
    if (data.error) {
      setEquityMsg(`Error: ${data.error}`);
    } else {
      setEquityMsg("Entry saved — refresh to see updated chart");
      router.refresh();
    }
  }

  async function saveMetrics(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/metrics", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = await res.json();
    setSaving(false);
    if (!data.error) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
      {/* Add equity entry */}
      <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.4)", marginBottom: 20 }}>
          Log Equity Entry
          {equityCount > 0 && <span style={{ marginLeft: 8, color: "#4f8ef7" }}>· {equityCount} entries recorded</span>}
        </div>
        <form onSubmit={addEquity} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={equityDate} onChange={(e) => setEquityDate(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Equity ($)</label>
            <input type="number" step="0.01" value={equityValue} onChange={(e) => setEquityValue(e.target.value)} required style={inputStyle} />
          </div>
          {equityMsg && (
            <div style={{ fontSize: 11, color: equityMsg.startsWith("Error") ? "#ef4444" : "#22c55e" }}>{equityMsg}</div>
          )}
          <button
            type="submit"
            disabled={addingEquity}
            style={{
              background: "#4f8ef7", color: "#020305", border: "none",
              fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700,
              fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              padding: "12px", cursor: addingEquity ? "not-allowed" : "pointer",
              opacity: addingEquity ? 0.6 : 1,
            }}
          >
            {addingEquity ? "Saving…" : "Log Entry"}
          </button>
        </form>
      </div>

      {/* Edit metrics */}
      <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.4)", marginBottom: 20 }}>Edit Metrics</div>
        <form onSubmit={saveMetrics} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Prop Firm</label>
            <input value={fields.prop_firm ?? ""} onChange={(e) => set("prop_firm", e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Phase</label>
              <select value={fields.phase} onChange={(e) => set("phase", Number(e.target.value))} style={inputStyle}>
                <option value={1}>Phase 1</option>
                <option value={2}>Phase 2</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={fields.phase_status} onChange={(e) => set("phase_status", e.target.value)} style={inputStyle}>
                {PHASE_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Balance ($)</label>
              <input type="number" value={fields.balance} onChange={(e) => set("balance", Number(e.target.value))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Equity ($)</label>
              <input type="number" value={fields.equity} onChange={(e) => set("equity", Number(e.target.value))} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Daily DD (%)</label>
              <input type="number" step="0.01" value={fields.daily_drawdown} onChange={(e) => set("daily_drawdown", Number(e.target.value))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Max DD (%)</label>
              <input type="number" step="0.01" value={fields.max_drawdown} onChange={(e) => set("max_drawdown", Number(e.target.value))} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Profit Target (%)</label>
              <input type="number" step="0.01" value={fields.profit_target} onChange={(e) => set("profit_target", Number(e.target.value))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Profit Goal (%)</label>
              <input type="number" step="0.01" value={fields.profit_goal} onChange={(e) => set("profit_goal", Number(e.target.value))} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Days Used</label>
              <input type="number" value={fields.days_used} onChange={(e) => set("days_used", Number(e.target.value))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Days Allowed</label>
              <input type="number" value={fields.days_allowed} onChange={(e) => set("days_allowed", Number(e.target.value))} style={inputStyle} />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              background: saving ? "rgba(79,142,247,0.3)" : saved ? "#22c55e" : "#4f8ef7",
              color: "#020305", border: "none",
              fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700,
              fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              padding: "12px", cursor: saving ? "not-allowed" : "pointer",
              transition: "background 0.3s",
            }}
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Metrics"}
          </button>
        </form>
      </div>
    </div>
  );
}
