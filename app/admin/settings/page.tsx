"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [coachEnabled, setCoachEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      setCoachEnabled(data.ai_coach_enabled === true || data.ai_coach_enabled === "true");
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCoach = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai_coach_enabled: !coachEnabled }),
      });

      if (response.ok) {
        setCoachEnabled(!coachEnabled);
        setMessage(`AI Coach ${!coachEnabled ? "enabled" : "disabled"}`);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "40px 40px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Settings</div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1 }}>
          Feature Flags
        </h1>
      </div>

      {loading ? (
        <div style={{ color: "rgba(210,220,240,0.88)" }}>Loading settings...</div>
      ) : (
        <>
          <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "24px", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e8eaf0", marginBottom: 8 }}>AI Coach</div>
                <div style={{ fontSize: 12, color: "rgba(210,220,240,0.58)" }}>Enable the streaming AI Coach feature for all clients on the dashboard.</div>
              </div>
              <button
                onClick={handleToggleCoach}
                disabled={saving}
                style={{
                  width: 60,
                  height: 32,
                  borderRadius: 16,
                  background: coachEnabled ? "#22c55e" : "rgba(255,255,255,0.1)",
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  position: "relative",
                  transition: "all 0.2s",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#fff",
                    position: "absolute",
                    top: 2,
                    left: coachEnabled ? 30 : 2,
                    transition: "left 0.2s",
                  }}
                />
              </button>
            </div>
          </div>

          {message && (
            <div style={{
              background: coachEnabled ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${coachEnabled ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              padding: "12px 16px",
              borderRadius: 4,
              color: coachEnabled ? "#22c55e" : "#ef4444",
              fontSize: 12,
            }}>
              {message}
            </div>
          )}
        </>
      )}
    </div>
  );
}
