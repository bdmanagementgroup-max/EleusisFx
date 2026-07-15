import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import ClientDetailClient from "./ClientDetailClient";
import EquityChart from "@/components/dashboard/EquityChart";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await getSupabaseAdminClient();

  const [{ data: m }, { data: historyData }, userResult] = await Promise.all([
    supabase.from("client_metrics").select("*").eq("user_id", userId).single(),
    supabase.from("equity_history").select("recorded_at, equity").eq("user_id", userId).order("recorded_at", { ascending: true }).limit(30),
    supabase.auth.admin.getUserById(userId),
  ]);

  if (!m) notFound();

  const email = userResult.data?.user?.email ?? "—";
  const progressPct = (Number(m.profit_target) / Number(m.profit_goal)) * 100;
  const daysPct = (m.days_used / m.days_allowed) * 100;

  const equityData = (historyData ?? []).map((r, i) => ({
    day: `Day ${i + 1}`,
    equity: Number(r.equity),
  }));

  const phaseColor = m.phase_status === "passed" ? "#22c55e" : m.phase_status === "failed" ? "#ef4444" : m.phase_status === "ready_to_start" ? "#f59e0b" : "#4f8ef7";

  return (
    <div style={{ padding: "40px 48px 80px" }}>
      {/* Back + header */}
      <Link href="/admin/metrics" style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.4)", textDecoration: "none" }}>
        ← Back to Metrics
      </Link>

      <div style={{ marginTop: 20, marginBottom: 8, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7" }}>Client</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: -1 }}>{email}</h1>
        <span style={{
          fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 12px",
          background: `${phaseColor}18`, color: phaseColor,
        }}>
          {m.phase === 0 ? "Neutral" : `Phase ${m.phase}`} · {m.phase_status.replace("_", " ")}
        </span>
        {m.prop_firm && (
          <span style={{ fontSize: 11, color: "rgba(210,220,240,0.4)" }}>{m.prop_firm}</span>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)", marginBottom: 16 }}>
        {[
          { label: "Account Balance", value: `$${Number(m.balance).toLocaleString()}` },
          { label: "Current Equity",  value: `$${Number(m.equity).toLocaleString()}`, color: "#22c55e" },
          { label: "Daily Drawdown",  value: `${Number(m.daily_drawdown).toFixed(2)}%`, color: Number(m.daily_drawdown) > 4 ? "#ef4444" : undefined },
          { label: "Max Drawdown",    value: `${Number(m.max_drawdown).toFixed(2)}%`,  color: Number(m.max_drawdown) > 8 ? "#ef4444" : undefined },
        ].map(({ label, value, color }) => (
          <div key={label} className="adm-stat" style={{ background: "#08090f", padding: "28px 24px", transition: "background 0.2s" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.4)", marginBottom: 10 }}>{label}</div>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: -1, color: color ?? "#e8eaf0" }}>{value}</div>
          </div>
        ))}
      </div>
      <style>{`.adm-stat:hover { background: #0b0d16 !important; }`}</style>

      {/* Progress bars */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "24px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.4)" }}>Profit Target Progress</div>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "#22c55e" }}>{Number(m.profit_target).toFixed(1)}% / {Number(m.profit_goal).toFixed(0)}%</div>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(progressPct, 100)}%`, background: "linear-gradient(90deg, #4f8ef7, #22c55e)" }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "rgba(210,220,240,0.4)" }}>{(Number(m.profit_goal) - Number(m.profit_target)).toFixed(1)}% remaining</div>
        </div>

        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "24px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.4)" }}>Days Used</div>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "#e8eaf0" }}>{m.days_used} / {m.days_allowed}</div>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(daysPct, 100)}%`, background: "#4f8ef7" }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "rgba(210,220,240,0.4)" }}>{m.days_allowed - m.days_used} days remaining</div>
        </div>
      </div>

      {/* Equity chart */}
      {equityData.length > 1 && (
        <div style={{ marginBottom: 24 }}>
          <EquityChart data={equityData} />
        </div>
      )}

      {/* Client component: add equity entry + edit metrics */}
      <ClientDetailClient userId={userId} metrics={m} equityCount={equityData.length} />
    </div>
  );
}
