"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PHASE_STATUSES = ["neutral", "ready_to_start", "in_progress", "passed", "failed"];

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

type PastClient = {
  id: string;
  name: string;
  prop_firm: string | null;
  phase: number | null;
  phase_status: string | null;
  balance: number | null;
  equity: number | null;
  daily_drawdown: number | null;
  max_drawdown: number | null;
  profit_target: number | null;
  profit_goal: number | null;
  days_used: number | null;
  days_allowed: number | null;
  challenge_result: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

export default function PastClientDetailClient({ client }: { client: PastClient }) {
  const router = useRouter();
  const [fields, setFields] = useState({
    prop_firm: client.prop_firm ?? "",
    phase: String(client.phase ?? 1),
    phase_status: client.phase_status ?? "in_progress",
    balance: String(client.balance ?? ""),
    equity: String(client.equity ?? ""),
    daily_drawdown: String(client.daily_drawdown ?? ""),
    max_drawdown: String(client.max_drawdown ?? ""),
    profit_target: String(client.profit_target ?? ""),
    profit_goal: String(client.profit_goal ?? 10),
    days_used: String(client.days_used ?? ""),
    days_allowed: String(client.days_allowed ?? 30),
    challenge_result: client.challenge_result ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    notes: client.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: string, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/past-clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: client.id, ...fields }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json();
      setError(j.error ?? "Save failed");
    } else {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "32px 28px", marginTop: 24 }}>
      <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "rgba(210,220,240,0.4)", marginBottom: 24 }}>
        Edit Metrics
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {/* Phase */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Phase</label>
            <select value={fields.phase} onChange={(e) => set("phase", e.target.value)} style={inputStyle}>
              <option value="0">Neutral</option>
              <option value="1">Phase 1</option>
              <option value="2">Phase 2</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Phase Status</label>
            <select value={fields.phase_status} onChange={(e) => set("phase_status", e.target.value)} style={inputStyle}>
              {PHASE_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Balance / Equity */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Balance ($)</label>
            <input type="number" value={fields.balance} onChange={(e) => set("balance", e.target.value)} placeholder="100000" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Equity ($)</label>
            <input type="number" value={fields.equity} onChange={(e) => set("equity", e.target.value)} placeholder="100000" style={inputStyle} />
          </div>
        </div>

        {/* Drawdown */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Daily Drawdown (%)</label>
            <input type="number" step="0.01" value={fields.daily_drawdown} onChange={(e) => set("daily_drawdown", e.target.value)} placeholder="0" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Max Drawdown (%)</label>
            <input type="number" step="0.01" value={fields.max_drawdown} onChange={(e) => set("max_drawdown", e.target.value)} placeholder="0" style={inputStyle} />
          </div>
        </div>

        {/* Profit */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Profit Target Achieved (%)</label>
            <input type="number" step="0.01" value={fields.profit_target} onChange={(e) => set("profit_target", e.target.value)} placeholder="0" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Profit Goal (%)</label>
            <input type="number" step="0.01" value={fields.profit_goal} onChange={(e) => set("profit_goal", e.target.value)} placeholder="10" style={inputStyle} />
          </div>
        </div>

        {/* Days */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Days Used</label>
            <input type="number" value={fields.days_used} onChange={(e) => set("days_used", e.target.value)} placeholder="0" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Days Allowed</label>
            <input type="number" value={fields.days_allowed} onChange={(e) => set("days_allowed", e.target.value)} placeholder="30" style={inputStyle} />
          </div>
        </div>

        {/* Prop firm / result */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Prop Firm</label>
            <input type="text" value={fields.prop_firm} onChange={(e) => set("prop_firm", e.target.value)} placeholder="FTMO" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Challenge Result</label>
            <input type="text" value={fields.challenge_result} onChange={(e) => set("challenge_result", e.target.value)} placeholder="passed / failed" style={inputStyle} />
          </div>
        </div>

        {/* Contact */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={fields.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input type="text" value={fields.phone} onChange={(e) => set("phone", e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea value={fields.notes} onChange={(e) => set("notes", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 16, fontSize: 12, color: "#ef4444" }}>{error}</div>
      )}

      <button
        onClick={save}
        disabled={saving}
        style={{
          marginTop: 20, padding: "10px 24px",
          background: saved ? "rgba(34,197,94,0.12)" : "rgba(79,142,247,0.12)",
          border: `1px solid ${saved ? "rgba(34,197,94,0.3)" : "rgba(79,142,247,0.3)"}`,
          color: saved ? "#22c55e" : "#4f8ef7",
          fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
          cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
        }}
      >
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
      </button>
    </div>
  );
}
