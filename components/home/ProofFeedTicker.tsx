"use client";

export default function ProofFeedTicker({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "18px 0",
        overflow: "hidden",
        background: "#020305",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: "scroll 60s linear infinite",
        }}
      >
        {doubled.map((label, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, padding: "0 40px", whiteSpace: "nowrap" }}>
            <span style={{ color: "#22c55e", fontSize: 13, flexShrink: 0 }}>✓</span>
            <span
              style={{
                fontFamily: "var(--font-syne), Syne, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: "rgba(210,220,240,0.88)",
              }}
            >
              {label}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(34,197,94,0.5)", flexShrink: 0, display: "inline-block" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
