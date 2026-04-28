"use client";
import { useState } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#020305",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 2,
  padding: "10px 12px",
  color: "#e8eaf0",
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "rgba(210,220,240,0.58)",
  marginBottom: 6,
};

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ padding: "40px 40px 80px", maxWidth: 640 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>
        Help
      </div>
      <h1 style={{
        fontFamily: "var(--font-syne), Syne, sans-serif",
        fontWeight: 800, fontSize: 32, letterSpacing: -1,
        color: "#e8eaf0", margin: "0 0 8px",
      }}>
        Support
      </h1>
      <p style={{ color: "rgba(210,220,240,0.58)", fontSize: 13, marginBottom: 48, lineHeight: 1.6 }}>
        Have a question or issue with your account? Send us a message and we&apos;ll get back to you.
      </p>

      {sent ? (
        <div style={{
          padding: "32px 28px",
          background: "#08090f",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: 4,
        }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>✓</div>
          <div style={{
            fontFamily: "var(--font-syne), Syne, sans-serif",
            fontWeight: 700, fontSize: 16, color: "#22c55e", marginBottom: 8,
          }}>
            Message received
          </div>
          <p style={{ color: "rgba(210,220,240,0.58)", fontSize: 13, margin: 0 }}>
            We&apos;ll review your message and follow up with you shortly.
          </p>
          <button
            onClick={() => { setSent(false); setSubject(""); setMessage(""); }}
            style={{
              marginTop: 24,
              padding: "10px 24px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              color: "rgba(210,220,240,0.88)",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Send Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Subject</label>
            <input
              style={inputStyle}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              required
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={labelStyle}>Message</label>
            <textarea
              style={{ ...inputStyle, minHeight: 160, resize: "vertical", lineHeight: 1.6 }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail…"
              required
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="submit"
              disabled={sending}
              style={{
                padding: "11px 28px",
                background: "#4f8ef7",
                border: "none",
                borderRadius: 2,
                color: "#fff",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "inherit",
                cursor: sending ? "not-allowed" : "pointer",
                opacity: sending ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {sending ? "Sending…" : "Send Message"}
            </button>
            {error && <span style={{ fontSize: 12, color: "#ef4444" }}>{error}</span>}
          </div>

          <style>{`
            form input:focus, form textarea:focus { border-color: rgba(79,142,247,0.5) !important; }
          `}</style>
        </form>
      )}
    </div>
  );
}
