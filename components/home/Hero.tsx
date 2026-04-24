export default function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 420px",
        gap: 0,
        alignItems: "center",
        padding: "100px 56px 60px",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
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
      <div style={{ position: "relative" }}>
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
            fontSize: "clamp(40px, 10vw, 92px)",
            lineHeight: 0.95,
            letterSpacing: -2,
            marginBottom: 36,
            opacity: 0,
            animation: "fadeIn 0.8s 0.5s forwards",
            wordBreak: "break-word",
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
            fontSize: 16,
            lineHeight: 1.8,
            color: "rgba(232,234,240,0.38)",
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

      {/* Right — Card */}
      <div
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
            padding: 40,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top border gradient */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background: "linear-gradient(90deg, transparent, #4f8ef7, transparent)",
            }}
          />

          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", marginBottom: 32, display: "flex", alignItems: "center", gap: 10 }}>
            Latest Pass
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)", display: "block" }} />
          </div>

          <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 64, lineHeight: 1, marginBottom: 6 }}>$100,000</div>
          <div style={{ fontSize: 12, color: "rgba(232,234,240,0.38)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 36 }}>Funded Account — FTMO</div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 28 }} />

          {[
            { label: "Phase 1", value: "✓ Passed", green: true },
            { label: "Phase 2", value: "✓ Passed", green: true },
            { label: "Drawdown Violations", value: "None", green: true },
            { label: "Duration", value: "24 Days" },
            { label: "Investment", value: "£1,150" },
          ].map(({ label, value, green }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "rgba(232,234,240,0.38)" }}>{label}</span>
              <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontSize: 13, fontWeight: 600, color: green ? "#22c55e" : "#e8eaf0" }}>{value}</span>
            </div>
          ))}

          <div
            style={{
              marginTop: 32,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              color: "#22c55e",
              fontSize: 11,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            Account Active &amp; Funded
          </div>
        </div>
      </div>

      <style>{`
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
          color: rgba(232,234,240,0.38); text-decoration: none;
          display: flex; align-items: center; gap: 8px; transition: color 0.2s;
        }
        .btn-ghost-hero:hover { color: #e8eaf0; }
        .btn-ghost-hero svg { transition: transform 0.2s; }
        .btn-ghost-hero:hover svg { transform: translateX(4px); }
        @media (max-width: 1024px) {
          section:first-of-type {
            grid-template-columns: 1fr !important;
            padding: 90px 20px 60px !important;
          }
        }
      `}</style>
    </section>
  );
}
