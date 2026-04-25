"use client";

import { useState } from "react";

export default function ApplyForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", propFirm: "", notes: "" });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#020305",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#e8eaf0",
    fontFamily: "var(--font-epilogue), Epilogue, sans-serif",
    fontSize: 14,
    fontWeight: 300,
    padding: "14px 18px",
    outline: "none",
    transition: "border-color 0.2s",
    borderRadius: 0,
    appearance: "none" as const,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => {});
  };

  return (
    <section
      id="apply"
      style={{
        padding: "160px 56px",
        position: "relative",
        zIndex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 100,
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,142,247,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Left */}
      <div className="reveal">
        <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
          Apply
        </div>
        <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 60px)", lineHeight: 1, letterSpacing: -1.5, marginBottom: 24 }}>
          Let&apos;s Get You Funded.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.9, color: "rgba(232,234,240,0.38)", marginBottom: 40 }}>
          Spots are limited each month. Complete the form and we&apos;ll be in touch within 24 hours to confirm availability and next steps.
        </p>

        {[
          { icon: "📸", title: "@eleusisfx", sub: "Instagram DMs welcome" },
          { icon: "💬", title: "WhatsApp", sub: "Message us directly for fast response" },
        ].map(({ icon, title, sub }) => (
          <div key={title} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
            <div>
              <strong style={{ display: "block", color: "#e8eaf0", fontSize: 14, fontWeight: 400, marginBottom: 2 }}>{title}</strong>
              <span style={{ fontSize: 13, color: "rgba(232,234,240,0.38)" }}>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div
        className="reveal"
        style={{
          background: "#08090f",
          border: "1px solid rgba(255,255,255,0.12)",
          padding: "52px 48px",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7 40%, transparent)" }} />

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {[{ name: "firstName", label: "First Name", placeholder: "John" }, { name: "lastName", label: "Last Name", placeholder: "Smith" }].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", marginBottom: 10 }}>{label}</label>
                  <input type="text" placeholder={placeholder} required value={(form as any)[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} style={inputStyle} />
                </div>
              ))}
            </div>

            {[
              { name: "email", label: "Email Address", type: "email", placeholder: "john@email.com" },
              { name: "phone", label: "WhatsApp / Phone", type: "tel", placeholder: "+44 7700 000000" },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", marginBottom: 10 }}>{label}</label>
                <input type={type} placeholder={placeholder} required={type === "email"} value={(form as any)[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} style={inputStyle} />
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", marginBottom: 10 }}>Prop Firm</label>
              <select required value={form.propFirm} onChange={(e) => setForm({ ...form, propFirm: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="" disabled>Select your firm</option>
                {["FTMO", "True Forex Funds", "My Forex Funds", "Other"].map((f) => (<option key={f}>{f}</option>))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", marginBottom: 10 }}>Additional Info (Optional)</label>
              <textarea rows={3} placeholder="Anything else we should know..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, resize: "none" }} />
            </div>

            <button type="submit" className="form-submit-btn"><span>Submit Application →</span></button>
            <p style={{ fontSize: 11, color: "rgba(232,234,240,0.18)", lineHeight: 1.7, marginTop: 16, textAlign: "center" }}>
              We review all applications within 24 hours. Submitting does not guarantee a spot.
            </p>
          </form>
        ) : (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>✓</div>
            <p style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 600, fontSize: 17, color: "#7eb3ff", marginBottom: 8 }}>Application Received</p>
            <p style={{ fontSize: 14, color: "rgba(232,234,240,0.38)", lineHeight: 1.7 }}>We&apos;ll be in touch within 24 hours.</p>
          </div>
        )}
      </div>

      <style>{`
        .form-submit-btn {
          width: 100%; background: #e8eaf0; color: #020305;
          font-family: var(--font-syne), Syne, sans-serif;
          font-weight: 700; font-size: 12px; letter-spacing: 3px;
          text-transform: uppercase; padding: 18px;
          border: none; cursor: pointer; margin-top: 8px;
          transition: all 0.25s; position: relative; overflow: hidden;
          border-radius: 0;
        }
        .form-submit-btn::after {
          content: ''; position: absolute; inset: 0;
          background: #4f8ef7; transform: translateX(-101%);
          transition: transform 0.3s ease;
        }
        .form-submit-btn:hover::after { transform: translateX(0); }
        .form-submit-btn span { position: relative; z-index: 1; color: #020305; }
        .form-submit-btn:hover span { color: #e8eaf0; }
        @media (max-width: 1024px) {
          section#apply { grid-template-columns: 1fr !important; padding: 80px 20px !important; gap: 48px !important; }
          div[style*="gridTemplateColumns: '1fr 1fr'"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
