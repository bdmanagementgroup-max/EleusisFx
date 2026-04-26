const PROOFS = [
  { amount: "$100K", firm: "FTMO", detail: "Phase 1 & 2 completed. No drawdown violations. Client onboarded to funded account within 28 days of initial payment." },
  { amount: "$100K", firm: "True Forex Funds", detail: "Clean pass with zero rule breaches. Client received their first payout within the opening cycle of trading." },
  { amount: "$100K", firm: "FTMO", detail: "Client had previously failed 3 times independently. Passed first attempt with Eleusis FX. Now fully funded and trading." },
];

export default function ProofSection() {
  return (
    <section
      className="reveal"
      id="results"
      style={{
        padding: "140px 56px",
        background: "#08090f",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -300,
          right: -300,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,142,247,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
        Verified Results
      </div>
      <h2
        style={{
          fontFamily: "var(--font-syne), Syne, sans-serif",
          fontWeight: 800,
          fontSize: "clamp(28px, 5vw, 60px)",
          lineHeight: 1,
          letterSpacing: -1.5,
          marginBottom: 0,
          maxWidth: 560,
        }}
      >
        Real Passes.<br />Real Accounts.
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginTop: 80,
        }}
      >
        {PROOFS.map(({ amount, firm, detail }, i) => (
          <div key={i} className="proof-card-item">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#22c55e", marginBottom: 28 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              Challenge Passed
            </div>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 48, letterSpacing: -2, lineHeight: 1, marginBottom: 6 }}>{amount}</div>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.58)", marginBottom: 28 }}>{firm}</div>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(210,220,240,0.88)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24 }}>{detail}</div>
          </div>
        ))}
      </div>

      <style>{`
        .proof-card-item {
          background: #020305; border: 1px solid rgba(255,255,255,0.06);
          padding: 36px 32px; transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .proof-card-item::after {
          content: ''; position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          background: linear-gradient(135deg, rgba(79,142,247,0.03) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.3s;
        }
        .proof-card-item:hover { border-color: rgba(79,142,247,0.3); transform: translateY(-4px); }
        .proof-card-item:hover::after { opacity: 1; }
        @media (max-width: 1024px) {
          section#results { padding: 80px 20px !important; }
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
