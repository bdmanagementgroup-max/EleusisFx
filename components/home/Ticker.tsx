const ITEMS = [
  "FTMO Certified", "$100-$400K Accounts", "92% Pass Rate",
  "UK Based Traders", "True Forex Funds", "Zero Drawdown Violations", "Verified Results",
];

export default function Ticker() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "16px 0",
        overflow: "hidden",
        background: "#08090f",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: "scroll 28s linear infinite",
        }}
      >
        {doubled.map((text, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 32, padding: "0 40px", whiteSpace: "nowrap" }}>
            <span
              style={{
                fontFamily: "var(--font-syne), Syne, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "rgba(210,220,240,0.88)",
              }}
            >
              {text}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#4f8ef7", flexShrink: 0, display: "inline-block" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
