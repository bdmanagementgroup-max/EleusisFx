const STEPS = [
  {
    num: "01   Apply",
    title: "You Submit Your Enquiry",
    desc: "Fill out our short application form. We review your situation, confirm a spot is available, and get everything set up. Fast, simple, no fluff.",
  },
  {
    num: "02   Trade",
    title: "Our Traders Take Over",
    desc: "Our experienced team executes your challenge with surgical precision — hitting profit targets while respecting every rule FTMO or your chosen firm requires.",
  },
  {
    num: "03   Funded",
    title: "Your Account is Live",
    desc: "Challenge passed. $100,000 funded account is yours. You're now a verified funded trader — receiving real payouts from your chosen prop firm.",
  },
];

export default function ProcessSteps() {
  return (
    <section
      className="reveal"
      id="process"
      style={{ padding: "140px 56px", position: "relative", zIndex: 1 }}
    >
      <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
        The Process
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
        Three Steps to a Funded Account
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {STEPS.map(({ num, title, desc }, i) => (
          <div key={num} className="step-item" style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: 3, color: "#4f8ef7", marginBottom: 36, display: "flex", alignItems: "center", gap: 10 }}>
              {num}
              <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)", display: "block" }} />
            </div>
            <h3 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 18, letterSpacing: -0.5 }}>{title}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.85, color: "rgba(210,220,240,0.88)" }}>{desc}</p>
          </div>
        ))}
      </div>

      <style>{`
        .step-item {
          padding: 52px 44px; position: relative; transition: background 0.3s;
        }
        .step-item:hover { background: #08090f; }
        @media (max-width: 1024px) {
          section#process { padding: 80px 20px !important; }
          .step-item { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 36px 20px; }
          .step-item:last-child { border-bottom: none; }
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
