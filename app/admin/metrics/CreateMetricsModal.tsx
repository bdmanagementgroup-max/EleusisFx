"use client";

import { useState } from "react";

const PROP_FIRMS = ["FTMO", "FundedTrader", "E8", "The5ers", "True Forex Funds", "Topstep", "Earn2Trade", "City Traders Imperium"];
const PHASE_STATUSES = ["in_progress", "passed", "failed"];

interface CreateMetricsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMetricsModal({ onClose, onSuccess }: CreateMetricsModalProps) {
  const [userId, setUserId] = useState("");
  const [propFirm, setPropFirm] = useState("");
  const [phase, setPhase] = useState(1);
  const [phaseStatus, setPhaseStatus] = useState("in_progress");
  const [balance, setBalance] = useState(100000);
  const [equity, setEquity] = useState(100000);
  const [dailyDD, setDailyDD] = useState(0);
  const [maxDD, setMaxDD] = useState(0);
  const [profitTarget, setProfitTarget] = useState(0);
  const [profitGoal, setProfitGoal] = useState(10);
  const [daysUsed, setDaysUsed] = useState(0);
  const [daysAllowed, setDaysAllowed] = useState(30);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/metrics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          prop_firm: propFirm || null,
          phase,
          phase_status: phaseStatus,
          balance,
          equity,
          daily_drawdown: dailyDD,
          max_drawdown: maxDD,
          profit_target: profitTarget,
          profit_goal: profitGoal,
          days_used: daysUsed,
          days_allowed: daysAllowed,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        onSuccess();
      }
    } catch {
      setError("Network error — metrics not created");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999,
    }}>
      <div style={{
        background: "#08090f", border: "1px solid rgba(79,142,247,0.2)",
        padding: "32px", maxWidth: 500, maxHeight: "90vh", overflowY: "auto",
      }}>
        <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 24, marginBottom: 24, color: "#e8eaf0" }}>
          Create Client Metrics
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>User ID (Required)</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Paste user UUID here"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Prop Firm</label>
            <select value={propFirm} onChange={(e) => setPropFirm(e.target.value)} style={inputStyle}>
              <option value="">Select prop firm</option>
              {PROP_FIRMS.map((firm) => (
                <option key={firm} value={firm}>{firm}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Phase</label>
              <select value={phase} onChange={(e) => setPhase(Number(e.target.value))} style={inputStyle}>
                <option value={1}>Phase 1</option>
                <option value={2}>Phase 2</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={phaseStatus} onChange={(e) => setPhaseStatus(e.target.value)} style={inputStyle}>
                {PHASE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Balance ($)</label>
              <input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Equity ($)</label>
              <input type="number" value={equity} onChange={(e) => setEquity(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Daily DD (%)</label>
              <input type="number" step="0.01" value={dailyDD} onChange={(e) => setDailyDD(Number(e.target.value))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Max DD (%)</label>
              <input type="number" step="0.01" value={maxDD} onChange={(e) => setMaxDD(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Profit Target (%)</label>
              <input type="number" step="0.01" value={profitTarget} onChange={(e) => setProfitTarget(Number(e.target.value))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Profit Goal (%)</label>
              <input type="number" step="0.01" value={profitGoal} onChange={(e) => setProfitGoal(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Days Used</label>
              <input type="number" value={daysUsed} onChange={(e) => setDaysUsed(Number(e.target.value))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Days Allowed</label>
              <input type="number" value={daysAllowed} onChange={(e) => setDaysAllowed(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "8px 12px", borderRadius: 4 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              onClick={handleSubmit}
              disabled={saving || !userId}
              style={{
                flex: 1, background: "#4f8ef7", color: "#020305", border: "none",
                fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700,
                fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                padding: "12px", cursor: saving || !userId ? "not-allowed" : "pointer",
                opacity: saving || !userId ? 0.6 : 1,
              }}
            >
              {saving ? "Creating…" : "Create Metrics"}
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1, background: "transparent", color: "#e8eaf0", border: "1px solid rgba(255,255,255,0.1)",
                fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700,
                fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                padding: "12px", cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
