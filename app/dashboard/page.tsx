import MarketTickerStrip from "@/components/dashboard/MarketTickerStrip";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: metrics }, { data: history }] = await Promise.all([
    supabase
      .from("client_metrics")
      .select("*")
      .eq("user_id", user?.id)
      .single(),
    supabase
      .from("equity_history")
      .select("recorded_at, equity")
      .eq("user_id", user?.id)
      .order("recorded_at", { ascending: true })
      .limit(30),
  ]);

  if (!metrics) {
    return <EmptyState />;
  }

  const m = metrics;
  const progressPct = (m.profit_target / m.profit_goal) * 100;
  const daysPct = (m.days_used / m.days_allowed) * 100;

  const equityData: { day: string; equity: number }[] = (history ?? []).map((r, i) => ({
    day: `Day ${i + 1}`,
    equity: Number(r.equity),
  }));

  return (
    <div style={{ padding: "40px 40px 80px" }}>
      <MarketTickerStrip />

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Client Dashboard</div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1 }}>
          Challenge Overview
        </h1>
      </div>

      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(79,142,247,0.07)", border: "1px solid rgba(79,142,247,0.2)", padding: "10px 20px", marginBottom: 32 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f8ef7", display: "inline-block" }} />
        <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#7eb3ff" }}>
          Phase {m.phase} — {m.phase_status === "in_progress" ? "In Progress" : m.phase_status === "passed" ? "Passed" : "Failed"}
          {m.prop_firm ? ` · ${m.prop_firm}` : ""}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 32 }}>
        {[
          { label: "Account Balance", value: `$${Number(m.balance).toLocaleString()}` },
          { label: "Current Equity",  value: `$${Number(m.equity).toLocaleString()}`, green: true },
          { label: "Daily Drawdown",  value: `${Number(m.daily_drawdown).toFixed(2)}%`, warn: Number(m.daily_drawdown) > 4 },
          { label: "Max Drawdown",    value: `${Number(m.max_drawdown).toFixed(2)}%`,  warn: Number(m.max_drawdown) > 8 },
        ].map(({ label, value, green, warn }) => (
          <div key={label} style={{ background: "#08090f", padding: "32px 28px" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", marginBottom: 12 }}>{label}</div>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: -1, color: warn ? "#ef4444" : green ? "#22c55e" : "#e8eaf0" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "32px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)" }}>Profit Target Progress</div>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#22c55e" }}>{Number(m.profit_target).toFixed(1)}% / {Number(m.profit_goal).toFixed(0)}%</div>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(progressPct, 100)}%`, background: "linear-gradient(90deg, #4f8ef7, #22c55e)", transition: "width 0.5s ease" }} />
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "rgba(232,234,240,0.38)" }}>{(Number(m.profit_goal) - Number(m.profit_target)).toFixed(1)}% remaining to target</div>
        </div>

        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "32px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)" }}>Days Used</div>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#e8eaf0" }}>{m.days_used} / {m.days_allowed}</div>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(daysPct, 100)}%`, background: "#4f8ef7", transition: "width 0.5s ease" }} />
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "rgba(232,234,240,0.38)" }}>{m.days_allowed - m.days_used} days remaining</div>
        </div>
      </div>

      {equityData.length > 1 && <EquityChart data={equityData} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: "40px 40px 80px" }}>
      <MarketTickerStrip />
      <div style={{ marginTop: 80, maxWidth: 480 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 16 }}>Client Dashboard</div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: -1, marginBottom: 20 }}>
          No evaluation data yet
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(232,234,240,0.38)" }}>
          Your challenge metrics will appear here once your evaluation has been set up. Contact Eleusis FX at{" "}
          <a href="mailto:eleusiscapital@protonmail.com" style={{ color: "#4f8ef7", textDecoration: "none" }}>eleusiscapital@protonmail.com</a>
          {" "}if you believe this is an error.
        </p>
      </div>
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
