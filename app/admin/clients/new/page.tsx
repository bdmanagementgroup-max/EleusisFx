"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PHASE_STATUSES = ["in_progress", "passed", "failed"];

export default function NewClientPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    prop_firm: "",
    phase: "1",
    phase_status: "in_progress",
    balance: "100000",
    profit_goal: "10",
    days_allowed: "30",
  });

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch("/api/admin/create-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        prop_firm: form.prop_firm,
        phase: Number(form.phase),
        phase_status: form.phase_status,
        balance: Number(form.balance),
        profit_goal: Number(form.profit_goal),
        days_allowed: Number(form.days_allowed),
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (data.error) {
      setError(data.error);
    } else {
      setCreatedUserId(data.id);
      // Auto-create metrics entry
      await createMetrics(data.id);
    }
  }

  async function createMetrics(userId: string) {
    try {
      await fetch("/api/admin/metrics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          prop_firm: form.prop_firm || null,
          phase: Number(form.phase),
          phase_status: form.phase_status,
          balance: Number(form.balance),
          equity: Number(form.balance),
          daily_drawdown: 0,
          max_drawdown: 0,
          profit_target: 0,
          profit_goal: Number(form.profit_goal),
          days_used: 0,
          days_allowed: Number(form.days_allowed),
        }),
      });
    } catch {
      // Metrics creation failed but client was created, so don't show error
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "#08090f", border: "1px solid rgba(255,255,255,0.1)",
    color: "#e8eaf0", fontSize: 14, padding: "12px 14px",
    outline: "none", fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
    color: "rgba(232,234,240,0.3)", display: "block", marginBottom: 8,
  };

  // Success screen after client creation
  if (createdUserId) {
    return (
      <div style={{ padding: "56px 48px 80px", maxWidth: 640 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#22c55e", marginBottom: 8 }}>✓ Success</div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, marginBottom: 48 }}>Client Created</h1>

        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", padding: "24px", marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(34,197,94,0.8)", marginBottom: 8 }}>User ID</div>
          <div style={{
            fontFamily: "monospace", fontSize: 13, color: "#e8eaf0", marginBottom: 12,
            background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: 4, wordBreak: "break-all",
          }}>
            {createdUserId}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(createdUserId)}
            style={{
              background: "transparent", border: "1px solid rgba(34,197,94,0.3)",
              color: "#22c55e", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
              padding: "6px 12px", cursor: "pointer",
            }}
          >
            Copy
          </button>
        </div>

        <div style={{ fontSize: 13, color: "rgba(210,220,240,0.88)", marginBottom: 32, lineHeight: 1.6 }}>
          <p style={{ marginBottom: 12 }}>✓ Client account created and initialized with default metrics</p>
          <p>You can now navigate to the metrics dashboard to view or edit this client's details.</p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/admin/metrics" style={{ flex: 1, textDecoration: "none" }}>
            <button style={{
              width: "100%",
              background: "#4f8ef7", color: "#020305", border: "none",
              fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700,
              fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              padding: "14px", cursor: "pointer",
            }}>
              View in Metrics
            </button>
          </Link>
          <button
            onClick={() => {
              setCreatedUserId(null);
              setForm({ email: "", password: "", prop_firm: "", phase: "1", phase_status: "in_progress", balance: "100000", profit_goal: "10", days_allowed: "30" });
            }}
            style={{
              flex: 1,
              background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(210,220,240,0.6)", fontFamily: "inherit",
              fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              padding: "14px", cursor: "pointer",
            }}
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "56px 48px 80px", maxWidth: 640 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Admin → Clients</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, marginBottom: 48 }}>New Client</h1>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" required value={form.email} onChange={field("email")} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Temporary Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={field("password")} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Prop Firm</label>
          <input type="text" value={form.prop_firm} onChange={field("prop_firm")} placeholder="e.g. FTMO" style={inputStyle} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label style={labelStyle}>Phase</label>
            <select value={form.phase} onChange={field("phase")} style={{ ...inputStyle }}>
              <option value="1">Phase 1</option>
              <option value="2">Phase 2</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Phase Status</label>
            <select value={form.phase_status} onChange={field("phase_status")} style={{ ...inputStyle }}>
              {PHASE_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <div>
            <label style={labelStyle}>Account Balance ($)</label>
            <input type="number" required value={form.balance} onChange={field("balance")} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Profit Goal (%)</label>
            <input type="number" required value={form.profit_goal} onChange={field("profit_goal")} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Days Allowed</label>
            <input type="number" required value={form.days_allowed} onChange={field("days_allowed")} style={inputStyle} />
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", padding: "12px 16px", fontSize: 13, color: "#ef4444" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: "#4f8ef7", color: "#020305", border: "none",
              fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700,
              fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              padding: "14px 32px", cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Creating…" : "Create Client"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(210,220,240,0.6)", fontFamily: "inherit",
              fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              padding: "14px 24px", cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
