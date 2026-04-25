import MarketTickerStrip from "@/components/dashboard/MarketTickerStrip";

const DEMO_METRICS = {
  phase: 1,
  phaseStatus: "in_progress",
  balance: 100000,
  equity: 102340,
  dailyDrawdown: 1.2,
  maxDrawdown: 2.4,
  profitTarget: 4.8,
  profitGoal: 10,
  daysUsed: 12,
  daysAllowed: 30,
};

const DEMO_EQUITY = [
  { day: "Day 1", equity: 100000 },
  { day: "Day 3", equity: 100480 },
  { day: "Day 5", equity: 100120 },
  { day: "Day 7", equity: 101200 },
  { day: "Day 9", equity: 101800 },
  { day: "Day 11", equity: 101600 },
  { day: "Day 12", equity: 102340 },
];

export default function DashboardPage() {
  const m = DEMO_METRICS;
  const progressPct = (m.profitTarget / m.profitGoal) * 100;
  const daysPct = (m.daysUsed / m.daysAllowed) * 100;

  return (
    <div style={{ padding: "40px 40px 80px" }}>
      <MarketTickerStrip />

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Client Dashboard</div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1 }}>
          Challenge Overview
        </h1>
      </div>

      {/* Phase badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(79,142,247,0.07)", border: "1px solid rgba(79,142,247,0.2)", padding: "10px 20px", marginBottom: 32 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f8ef7", animation: "blink 1.5s infinite", display: "inline-block" }} />
        <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#7eb3ff" }}>
          Phase {m.phase} — In Progress
        </span>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 32 }}>
        {[
          { label: "Account Balance", value: `$${m.balance.toLocaleString()}` },
          { label: "Current Equity", value: `$${m.equity.toLocaleString()}`, green: true },
          { label: "Daily Drawdown", value: `${m.dailyDrawdown}%`, warn: m.dailyDrawdown > 4 },
          { label: "Max Drawdown", value: `${m.maxDrawdown}%`, warn: m.maxDrawdown > 8 },
        ].map(({ label, value, green, warn }) => (
          <div key={label} style={{ background: "#08090f", padding: "32px 28px" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", marginBottom: 12 }}>{label}</div>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: -1, color: warn ? "#ef4444" : green ? "#22c55e" : "#e8eaf0" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
        {/* Profit Target Progress */}
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "32px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)" }}>Profit Target Progress</div>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#22c55e" }}>{m.profitTarget}% / {m.profitGoal}%</div>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, #4f8ef7, #22c55e)", transition: "width 0.5s ease" }} />
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "rgba(232,234,240,0.38)" }}>{(m.profitGoal - m.profitTarget).toFixed(1)}% remaining to target</div>
        </div>

        {/* Days Progress */}
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "32px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)" }}>Days Used</div>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#e8eaf0" }}>{m.daysUsed} / {m.daysAllowed}</div>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${daysPct}%`, background: "#4f8ef7", transition: "width 0.5s ease" }} />
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "rgba(232,234,240,0.38)" }}>{m.daysAllowed - m.daysUsed} days remaining</div>
        </div>
      </div>

      {/* Equity Chart */}
      <EquityChart data={DEMO_EQUITY} />
    </div>
  );
}

function EquityChart({ data }: { data: { day: string; equity: number }[] }) {
  const min = Math.min(...data.map((d) => d.equity)) - 500;
  const max = Math.max(...data.map((d) => d.equity)) + 500;
  const range = max - min;
  const w = 800, h = 200;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d.equity - min) / range) * h;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(" L ")}`;
  const areaD = `M 0,${h} L ${pts.join(" L ")} L ${w},${h} Z`;

  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "32px 28px" }}>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", marginBottom: 24 }}>Equity Curve</div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
        <defs>
          <linearGradient id="eq-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f8ef7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#eq-grad)" />
        <path d={pathD} fill="none" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => {
          const [x, y] = pts[i].split(",").map(Number);
          return <circle key={i} cx={x} cy={y} r="4" fill="#4f8ef7" />;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        {data.map((d) => (
          <span key={d.day} style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: "rgba(232,234,240,0.18)" }}>{d.day}</span>
        ))}
      </div>
    </div>
  );
}
