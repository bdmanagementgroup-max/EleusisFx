const FEATURES = [
  "Full Phase 1 & Phase 2 trading",
  "$100,000 funded account on pass",
  "Strict compliance — zero violations",
  "UK-based, verified traders",
  "Direct communication throughout",
  "FTMO, True Forex Funds & more",
];

export default function PricingSection() {
  return (
    <section
      className="reveal"
      id="pricing"
      style={{
        padding: "140px 56px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 100,
        alignItems: "start",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Text */}
      <div>
        <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
          Pricing
        </div>
        <h2
          style={{
            fontFamily: "var(--font-syne), Syne, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(28px, 5vw, 60px)",
            lineHeight: 1,
            letterSpacing: -1.5,
            marginBottom: 80,
            maxWidth: 560,
          }}
        >
          One Investment.<br />One Funded Account.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.9, color: "rgba(232,234,240,0.38)", marginBottom: 24 }}>
          No hidden fees, no monthly retainers, no complications. You pay once, we pass your challenge, you receive your $100,000 funded trading account.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.9, color: "rgba(232,234,240,0.38)", marginBottom: 24 }}>
          We limit spots each month to ensure every client receives our full attention and every challenge is passed.
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(79,142,247,0.07)",
            border: "1px solid rgba(79,142,247,0.2)",
            padding: "14px 20px",
            marginBottom: 40,
            marginTop: 16,
          }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <span style={{ fontSize: 12, letterSpacing: 1, color: "#7eb3ff" }}>Limited spots available this month</span>
        </div>

        <br />
        <a href="#apply" className="btn-primary-pricing"><span>Reserve Your Spot</span></a>
      </div>

      {/* Card */}
      <div
        style={{
          background: "#08090f",
          border: "1px solid rgba(255,255,255,0.12)",
          padding: "56px 52px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7 40%, transparent)" }} />
        <div style={{ position: "absolute", bottom: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 32, display: "flex", alignItems: "center", gap: 10 }}>
          <span>●</span> Complete Challenge Package
        </div>

        <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 80, letterSpacing: -3, lineHeight: 1, marginBottom: 6 }}>
          <span style={{ fontSize: 32, verticalAlign: "top", paddingTop: 14, marginRight: 2, fontWeight: 600 }}>£</span>1,150
        </div>
        <p style={{ fontSize: 13, color: "rgba(232,234,240,0.38)", marginBottom: 44, lineHeight: 1.6 }}>
          Full prop firm evaluation service — you receive a $100,000 funded account on completion.
        </p>

        <ul style={{ listStyle: "none", marginBottom: 44 }}>
          {FEATURES.map((f) => (
            <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 14, fontSize: 14, color: "rgba(232,234,240,0.38)", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", lineHeight: 1.5 }}>
              <span style={{ width: 18, height: 18, border: "1px solid rgba(79,142,247,0.4)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, fontSize: 10, color: "#4f8ef7" }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        <a href="#apply" className="btn-primary-pricing" style={{ display: "block", textAlign: "center" as const }}><span>Apply for a Spot →</span></a>
      </div>

      <style>{`
        .btn-primary-pricing {
          font-family: var(--font-syne), Syne, sans-serif;
          font-size: 12px; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase;
          color: #020305; background: #e8eaf0;
          padding: 16px 36px; text-decoration: none;
          transition: all 0.25s; display: inline-block;
          position: relative; overflow: hidden;
        }
        .btn-primary-pricing::after {
          content: ''; position: absolute; inset: 0;
          background: #4f8ef7; transform: translateX(-101%);
          transition: transform 0.3s ease;
        }
        .btn-primary-pricing:hover::after { transform: translateX(0); }
        .btn-primary-pricing span { position: relative; z-index: 1; color: #020305; }
        .btn-primary-pricing:hover span { color: #e8eaf0; }
        @media (max-width: 1024px) {
          section#pricing { grid-template-columns: 1fr !important; padding: 80px 20px !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}
