const STATS = [
  { num: "100%", label: "Challenge Pass Rate" },
  { num: "$100K", label: "Funded Account Value" },
  { num: "<30", label: "Days Average to Funded" },
];

export default function StatsRow() {
  return (
    <div
      className="reveal"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        position: "relative",
        zIndex: 1,
      }}
    >
      {STATS.map(({ num, label }, i) => (
        <div key={label} className="stat-cell-item" style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
          <div
            style={{
              fontFamily: "var(--font-syne), Syne, sans-serif",
              fontWeight: 800,
              fontSize: 56,
              lineHeight: 1,
              letterSpacing: -2,
              marginBottom: 12,
              color: "#e8eaf0",
            }}
          >
            {num}
          </div>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)" }}>
            {label}
          </div>
        </div>
      ))}
      <style>{`
        .stat-cell-item {
          padding: 72px 56px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative; overflow: hidden; transition: background 0.3s;
        }
        .stat-cell-item:hover { background: #08090f; }
        .stat-cell-item::before {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 0; height: 1px; background: #4f8ef7; transition: width 0.5s ease;
        }
        .stat-cell-item:hover::before { width: 100%; }
        @media (max-width: 1024px) {
          .stat-cell-item { border-right: none !important; padding: 48px 20px; }
        }
      `}</style>
    </div>
  );
}
