import { getSupabaseAdminClient } from "@/lib/supabase/server";
import MetricsClient from "./MetricsClient";

export const dynamic = "force-dynamic";

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px" }}>
      <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.4)", marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: -1, color: color ?? "#e8eaf0" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "rgba(210,220,240,0.4)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default async function AdminMetricsPage() {
  const supabase = await getSupabaseAdminClient();

  const [{ data: metrics }, usersResult] = await Promise.all([
    supabase.from("client_metrics").select("*").order("updated_at", { ascending: false }),
    supabase.auth.admin.listUsers(),
  ]);

  const users = usersResult.data?.users ?? [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.email]));
  const rows = (metrics ?? []).map((m) => ({ ...m, email: userMap[m.user_id] ?? "—" }));

  // Aggregate stats
  const total = rows.length;
  const inProgress = rows.filter((r) => r.phase_status === "in_progress").length;
  const passed = rows.filter((r) => r.phase_status === "passed").length;
  const failed = rows.filter((r) => r.phase_status === "failed").length;
  const passRate = passed + failed > 0 ? Math.round((passed / (passed + failed)) * 100) : null;
  const avgProfit = total > 0 ? (rows.reduce((s, r) => s + Number(r.profit_target), 0) / total).toFixed(1) : null;
  const avgDD = total > 0 ? (rows.reduce((s, r) => s + Number(r.max_drawdown), 0) / total).toFixed(1) : null;

  return (
    <div style={{ padding: "56px 48px 80px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Admin</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, marginBottom: 40 }}>Client Metrics</h1>

      {/* Summary */}
      {total > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)", marginBottom: 16 }}>
          <StatCard label="Total Clients" value={String(total)} />
          <StatCard label="In Progress" value={String(inProgress)} color="#4f8ef7" />
          <StatCard label="Passed" value={String(passed)} color="#22c55e" />
          <StatCard label="Failed" value={String(failed)} color="#ef4444" />
        </div>
      )}
      {total > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)", marginBottom: 48 }}>
          <StatCard label="Pass Rate" value={passRate !== null ? `${passRate}%` : "—"} sub={passed + failed > 0 ? `${passed} of ${passed + failed} completed` : "No completed challenges"} color="#22c55e" />
          <StatCard label="Avg Profit Target" value={avgProfit !== null ? `${avgProfit}%` : "—"} sub="across all active accounts" />
          <StatCard label="Avg Max Drawdown" value={avgDD !== null ? `${avgDD}%` : "—"} sub="across all active accounts" color={avgDD && Number(avgDD) > 5 ? "#f59e0b" : undefined} />
        </div>
      )}

      <MetricsClient rows={rows} />
    </div>
  );
}
