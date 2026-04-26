export default function Hero() {
  return (
    <section className="hero-section" style={{ position: "relative", zIndex: 1, overflow: "hidden" }}>
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 65%)",
          top: -200,
          left: -200,
          pointerEvents: "none",
          animation: "glowPulse 8s ease-in-out infinite",
        }}
      />

      {/* Left */}
      <div className="hero-left" style={{ position: "relative" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontSize: 10,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#4f8ef7",
            border: "1px solid rgba(79,142,247,0.3)",
            padding: "8px 16px",
            marginBottom: 48,
            opacity: 0,
            animation: "fadeIn 0.6s 0.3s forwards",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#4f8ef7",
              animation: "blink 1.5s infinite",
              display: "inline-block",
            }}
          />
          Prop Firm Specialists — UK Based
        </div>

        <h1
          style={{
            fontFamily: "var(--font-syne), Syne, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(36px, 8vw, 92px)",
            lineHeight: 0.95,
            letterSpacing: -2,
            marginBottom: 36,
            opacity: 0,
            animation: "fadeIn 0.8s 0.5s forwards",
          }}
        >
          We Pass
          <br />
          <span
            style={{
              display: "block",
              color: "transparent",
              WebkitTextStroke: "1px rgba(232,234,240,0.3)",
            }}
          >
            Your FTMO
          </span>
          <span
            style={{
              display: "block",
              background: "linear-gradient(135deg, #4f8ef7 0%, #7eb3ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Challenge.
          </span>
        </h1>

        <p
          style={{
            fontSize: "clamp(14px, 2vw, 16px)",
            lineHeight: 1.8,
            color: "rgba(210,220,240,0.88)",
            maxWidth: 480,
            marginBottom: 52,
            opacity: 0,
            animation: "fadeIn 0.8s 0.7s forwards",
          }}
        >
          Skip the failed attempts. Our expert traders handle your entire prop firm evaluation — you receive a funded $100,000 account. Proven. Professional. Guaranteed.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            opacity: 0,
            animation: "fadeIn 0.8s 0.9s forwards",
            flexWrap: "wrap",
          }}
        >
          <a href="#apply" className="btn-primary-hero">
            <span>Get Funded Now</span>
          </a>
          <a href="#process" className="btn-ghost-hero">
            See how it works
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* Right — Specialist Card */}
      <div
        className="hero-right"
        style={{
          opacity: 0,
          animation: "fadeIn 1s 1s forwards",
          position: "relative",
        }}
      >
        <div
          style={{
            background: "#08090f",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "40px 36px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7, transparent)" }} />

          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 28, display: "flex", alignItems: "center", gap: 10 }}>
            Prop Specialists
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)", display: "block" }} />
          </div>

          <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, marginBottom: 6, letterSpacing: -1 }}>
            UK Based.<br />Expert Traders.
          </div>
          <div style={{ fontSize: 11, color: "rgba(210,220,240,0.88)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 32 }}>
            Prop Firm Evaluation Specialists
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 24 }} />

          {[
            { label: "Specialisation", value: "FTMO & TFF" },
            { label: "Pass Rate", value: "100%", green: true },
            { label: "Drawdown Violations", value: "None", green: true },
            { label: "Avg. Duration", value: "< 30 Days" },
            { label: "Base", value: "United Kingdom" },
          ].map(({ label, value, green }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "rgba(210,220,240,0.88)" }}>{label}</span>
              <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontSize: 13, fontWeight: 600, color: green ? "#22c55e" : "#e8eaf0" }}>{value}</span>
            </div>
          ))}

          <div
            style={{
              marginTop: 28,
              background: "rgba(79,142,247,0.08)",
              border: "1px solid rgba(79,142,247,0.2)",
              color: "#7eb3ff",
              fontSize: 11,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f8ef7", animation: "blink 1.5s infinite", display: "inline-block" }} />
            Currently Accepting Clients
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 60px;
          align-items: center;
          padding: 120px 56px 80px;
        }
        .btn-primary-hero {
          font-family: var(--font-syne), Syne, sans-serif;
          font-size: 12px; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase;
          color: #020305; background: #e8eaf0;
          padding: 16px 36px; text-decoration: none;
          transition: all 0.25s; display: inline-block;
          position: relative; overflow: hidden;
        }
        .btn-primary-hero::after {
          content: ''; position: absolute; inset: 0;
          background: #4f8ef7; transform: translateX(-101%);
          transition: transform 0.3s ease;
        }
        .btn-primary-hero:hover::after { transform: translateX(0); }
        .btn-primary-hero span { position: relative; z-index: 1; color: #020305; }
        .btn-primary-hero:hover span { color: #e8eaf0; }
        .btn-ghost-hero {
          font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;
          color: rgba(210,220,240,0.88); text-decoration: none;
          display: flex; align-items: center; gap: 8px; transition: color 0.2s;
        }
        .btn-ghost-hero:hover { color: #e8eaf0; }
        .btn-ghost-hero svg { transition: transform 0.2s; }
        .btn-ghost-hero:hover svg { transform: translateX(4px); }

        @media (max-width: 1024px) {
          .hero-section {
            grid-template-columns: 1fr !important;
            padding: 100px 24px 60px !important;
            min-height: auto !important;
            gap: 48px !important;
          }
          .hero-right { display: none; }
        }
      `}</style>
    </section>
  );
}
