"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Is this against FTMO's terms of service?",
    a: "We advise all clients to review their chosen prop firm's terms independently. We provide a professional trading service. All clients are responsible for understanding the terms of their accounts.",
  },
  {
    q: "Which prop firms do you work with?",
    a: "We primarily work with FTMO and comparable firms including True Forex Funds. Reach out with your specific firm and we'll confirm whether we can accommodate it.",
  },
  {
    q: "How long does the process take?",
    a: "Most challenges are completed in under 30 days. FTMO allows up to 60 days — we work efficiently to get you funded as quickly as possible while maintaining full compliance.",
  },
  {
    q: "When and how do I pay?",
    a: "Payment is confirmed before we begin trading. Full payment details and methods are shared after your application is reviewed and approved.",
  },
  {
    q: "What happens once I'm funded?",
    a: "Once the evaluation is passed, the funded account is entirely yours. You trade it yourself and receive 100% of payouts from the prop firm under their standard payout terms.",
  },
  {
    q: "How do I get started?",
    a: "Fill out the application form below or DM us on Instagram @eleusisfx. We respond to all genuine enquiries within 24 hours and confirm availability shortly after.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      className="reveal"
      id="faq"
      style={{
        padding: "140px 56px",
        background: "#08090f",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
        FAQ
      </div>
      <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 60px)", lineHeight: 1, letterSpacing: -1.5, marginBottom: 0 }}>
        Common Questions
      </h2>

      <div style={{ marginTop: 80, maxWidth: 900 }}>
        {FAQS.map(({ q, a }, i) => (
          <div
            key={i}
            className="faq-item"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <button
              type="button"
              className="faq-trigger"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`faq-answer-${i}`}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 24,
                padding: "32px 0",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                color: "inherit",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-syne), Syne, sans-serif",
                  fontWeight: 600,
                  fontSize: 17,
                  letterSpacing: -0.3,
                  color: open === i ? "#7eb3ff" : "#e8eaf0",
                  transition: "color 0.2s",
                }}
              >
                {q}
              </span>
              <span
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 28,
                  border: open === i ? "1px solid #4f8ef7" : "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 14,
                  color: open === i ? "#020305" : "rgba(210,220,240,0.88)",
                  background: open === i ? "#4f8ef7" : "transparent",
                  transform: open === i ? "rotate(45deg)" : "none",
                  transition: "all 0.2s",
                }}
              >
                +
              </span>
            </button>
            <div
              id={`faq-answer-${i}`}
              role="region"
              style={{
                fontSize: 14,
                lineHeight: 1.85,
                color: "rgba(210,220,240,0.88)",
                maxHeight: open === i ? 240 : 0,
                overflow: "hidden",
                transition: "max-height 0.4s ease, padding 0.3s",
                paddingBottom: open === i ? 32 : 0,
              }}
            >
              {a}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .faq-trigger:hover { box-shadow: none !important; }
        .faq-trigger:hover span:first-child { color: #7eb3ff; }
        @media (max-width: 1024px) {
          section#faq { padding: 80px 20px !important; }
        }
      `}</style>
    </section>
  );
}
