"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RunResult = {
  resolvedOutcomes: number;
  dispatched: number;
  succeeded: number;
  failed: number;
};

export default function AgentBiasControls() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [loadingToggle, setLoadingToggle] = useState(true);
  const [savingToggle, setSavingToggle] = useState(false);

  const [confirmingRun, setConfirmingRun] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setEnabled(data.agent_bias_cron_enabled !== false);
      })
      .catch(() => {})
      .finally(() => setLoadingToggle(false));
  }, []);

  async function handleToggle() {
    setSavingToggle(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_bias_cron_enabled: !enabled }),
      });
      if (res.ok) setEnabled(!enabled);
    } finally {
      setSavingToggle(false);
    }
  }

  async function handleRunNow() {
    setConfirmingRun(false);
    setRunning(true);
    setRunResult(null);
    setRunError("");
    try {
      const res = await fetch("/api/admin/agent-bias/run-now", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setRunResult(body);
        router.refresh();
      } else {
        setRunError(body.error ?? `Request failed (${res.status})`);
      }
    } catch {
      setRunError("Network error — the run may still be in progress on the server.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "20px 24px", marginBottom: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={handleToggle}
            disabled={loadingToggle || savingToggle}
            style={{
              width: 52,
              height: 28,
              borderRadius: 14,
              background: enabled ? "#22c55e" : "rgba(255,255,255,0.1)",
              border: "none",
              cursor: loadingToggle || savingToggle ? "not-allowed" : "pointer",
              position: "relative",
              transition: "all 0.2s",
              opacity: loadingToggle || savingToggle ? 0.6 : 1,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#fff",
                position: "absolute",
                top: 2,
                left: enabled ? 26 : 2,
                transition: "left 0.2s",
              }}
            />
          </button>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>
              Nightly cron {loadingToggle ? "" : enabled ? "enabled" : "disabled"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(210,220,240,0.58)" }}>
              Runs at 02:00 UTC when enabled. Turning this off pauses generation without touching the Vercel schedule itself.
            </div>
          </div>
        </div>

        {!confirmingRun && !running && (
          <button
            onClick={() => setConfirmingRun(true)}
            style={{ background: "#4f8ef7", border: "none", color: "#fff", padding: "10px 16px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}
          >
            Fire Agents Now
          </button>
        )}

        {confirmingRun && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
            <span style={{ color: "rgba(210,220,240,0.88)" }}>Runs all 16 instruments now, takes a few minutes. Confirm?</span>
            <button
              onClick={handleRunNow}
              style={{ background: "#ef4444", border: "none", color: "#fff", padding: "8px 14px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmingRun(false)}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#e8eaf0", padding: "8px 14px", borderRadius: 2, cursor: "pointer", fontSize: 12 }}
            >
              Cancel
            </button>
          </div>
        )}

        {running && (
          <div style={{ fontSize: 12, color: "rgba(210,220,240,0.58)" }}>
            Running — this can take a few minutes...
          </div>
        )}
      </div>

      {runResult && (
        <div style={{ fontSize: 12, color: runResult.failed > 0 ? "#ef4444" : "#22c55e", background: runResult.failed > 0 ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)", border: `1px solid ${runResult.failed > 0 ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`, borderRadius: 2, padding: "10px 14px" }}>
          Done — {runResult.succeeded}/{runResult.dispatched} instruments succeeded
          {runResult.failed > 0 && `, ${runResult.failed} failed`}. {runResult.resolvedOutcomes} outcome{runResult.resolvedOutcomes === 1 ? "" : "s"} graded.
        </div>
      )}

      {runError && (
        <div style={{ fontSize: 12, color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 2, padding: "10px 14px" }}>
          {runError}
        </div>
      )}
    </div>
  );
}
