"use client";

import { useState } from "react";

export default function LeadMagnet() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "free_guide" }),
    }).catch(() => {});
  };

  return (
    <section
      className="reveal"
      id="free-guide"
      style={{
        padding: "140px 56px",
        position: "relative",
        zIndex: 1,
        background: "#08090f",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 800,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,142,247,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>
        <div
          style={{
            fontFamily: "var(--font-syne), Syne, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(52px, 10vw, 96px)",
            lineHeight: 1,
            letterSpacing: -3,
            color: "transparent",
            WebkitTextStroke: "1.5px #e74c3c",
            textShadow: "0 0 40px rgba(231,76,60,0.35)",
            marginBottom: 16,
          }}
        >
          67%
        </div>

        <h2
          style={{
            fontFamily: "var(--font-syne), Syne, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(22px, 4vw, 38px)",
            lineHeight: 1.15,
            letterSpacing: -1,
            color: "#e8eaf0",
            marginBottom: 20,
          }}
        >
          of traders fail their first{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #4f8ef7 0%, #7eb3ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            prop firm evaluation.
          </span>
        </h2>

        <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(232,234,240,0.38)", marginBottom: 48, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
          Here are the 5 mistakes that kill accounts — and exactly how to fix them. Free breakdown, straight to your inbox.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 48, flexWrap: "wrap" }}>
          {["The 3-Trade Rule", "The Drawdown Buffer System", "The Recovery Protocol"].map((b) => (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, letterSpacing: "0.5px", color: "rgba(232,234,240,0.38)" }}>
              <span style={{ width: 18, height: 18, border: "1px solid rgba(79,142,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#4f8ef7", flexShrink: 0 }}>✓</span>
              {b}
            </div>
          ))}
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", maxWidth: 520, margin: "0 auto 16px" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                style={{
                  flex: 1,
                  background: "#020305",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRight: "none",
                  color: "#e8eaf0",
                  fontFamily: "var(--font-epilogue), Epilogue, sans-serif",
                  fontSize: 14,
                  fontWeight: 300,
                  padding: "16px 20px",
                  outline: "none",
                  borderRadius: 0,
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#4f8ef7",
                  color: "#020305",
                  fontFamily: "var(--font-syne), Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  padding: "16px 28px",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  borderRadius: 0,
                }}
              >
                Get Free Guide →
              </button>
            </div>
          </form>
        ) : (
          <div
            style={{
              background: "rgba(79,142,247,0.06)",
              border: "1px solid rgba(79,142,247,0.2)",
              padding: "20px 28px",
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            <p style={{ fontSize: 14, color: "#7eb3ff", letterSpacing: "0.5px", margin: 0 }}>
              ✓ &nbsp;Check your inbox — your free guide is on its way.
            </p>
          </div>
        )}

        <p style={{ fontSize: 11, color: "rgba(232,234,240,0.18)", letterSpacing: "0.5px", marginTop: 12 }}>
          No spam. One email. Unsubscribe anytime.
        </p>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          section#free-guide { padding: 80px 20px !important; }
        }
      `}</style>
    </section>
  );
}
