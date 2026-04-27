import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const TILES = [
  { href: "/admin/articles", label: "Articles", desc: "Create, edit, and publish articles to the site." },
  { href: "/admin/clients", label: "Clients", desc: "View applications, manage leads, and create client accounts." },
  { href: "/admin/metrics", label: "Metrics", desc: "Edit live challenge metrics for each client account." },
  { href: "/admin/resources", label: "Resources", desc: "Add prop firm guides, tools, and PDF downloads." },
  { href: "/admin/past-clients", label: "Past Clients", desc: "View historical client records, challenge results, and contact details." },
];

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.05)", padding: "14px 16px" }}>
      <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 1, color: "rgba(210,220,240,0.28)", marginBottom: 6 }}>// {label.toLowerCase()}</div>
      <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 20, color: color ?? "#e8eaf0", letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default async function AdminOverview() {
  const supabase = await getSupabaseAdminClient();

  const [{ data: metrics }, { data: pastClients }, { count: newApplications }] = await Promise.all([
    supabase.from("client_metrics").select("phase_status,profit_target,max_drawdown"),
    supabase.from("past_clients").select("challenge_result,phase_status"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const active = metrics ?? [];
  const past = pastClients ?? [];

  const activePassed = active.filter((r) => r.phase_status === "passed").length;
  const activeFailed = active.filter((r) => r.phase_status === "failed").length;
  const activeInProgress = active.filter((r) => r.phase_status === "in_progress").length;

  const pastPassed = past.filter((p) => {
    const status = p.phase_status ?? "";
    const result = (p.challenge_result ?? "").toLowerCase();
    return status === "passed" || (status === "unknown" && result === "passed");
  }).length;
  const pastFailed = past.filter((p) => {
    const status = p.phase_status ?? "";
    const result = (p.challenge_result ?? "").toLowerCase();
    return status === "failed" || (status === "unknown" && result === "failed");
  }).length;

  const totalPassed = activePassed + pastPassed;
  const totalFailed = activeFailed + pastFailed;
  const totalCompleted = totalPassed + totalFailed;
  const totalClients = active.length + past.length;
  const passRate = totalCompleted > 0 ? Math.round((totalPassed / totalCompleted) * 100) : null;

  const showStats = totalClients > 0;

  return (
    <div style={{ padding: "40px 48px 80px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Admin</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, marginBottom: 24 }}>Overview</h1>

      {(newApplications ?? 0) > 0 && (
        <Link href="/admin/clients" style={{ textDecoration: "none", display: "block", marginBottom: 32 }}>
          <div style={{
            fontFamily: "monospace",
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderLeft: "2px solid #ef4444",
            padding: "10px 16px",
            display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer",
            textShadow: "0 0 12px rgba(239,68,68,0.5)",
          }}>
            <span style={{ color: "rgba(239,68,68,0.5)", fontSize: 11, userSelect: "none" }}>$&gt;</span>
            <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 700 }}>
              !! {newApplications} new application{(newApplications ?? 0) > 1 ? "s" : ""} waiting — status: unreviewed
            </span>
            <span style={{ marginLeft: "auto", color: "rgba(239,68,68,0.45)", fontSize: 10 }}>→ /admin/clients</span>
          </div>
        </Link>
      )}

      {showStats && (
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontFamily: "monospace",
            background: "#08090f",
            border: "1px solid rgba(255,255,255,0.07)",
            borderLeft: "2px solid #4f8ef7",
            padding: "10px 16px",
            marginBottom: 12,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: "rgba(210,220,240,0.3)", fontSize: 11, userSelect: "none" }}>$&gt;</span>
            <span style={{ color: "rgba(210,220,240,0.4)", fontSize: 11 }}>stats --scope all-clients</span>
            <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.2)" }}>{totalClients} records</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)", marginBottom: 1 }}>
            <StatCard label="Total Clients" value={String(totalClients)} sub={`${active.length} active · ${past.length} historical`} />
            <StatCard label="Pass Rate" value={passRate !== null ? `${passRate}%` : "—"} sub={`${totalPassed} of ${totalCompleted} completed`} color="#22c55e" />
            <StatCard label="Total Passed" value={String(totalPassed)} sub={`${activePassed} active · ${pastPassed} historical`} color="#22c55e" />
            <StatCard label="Total Failed" value={String(totalFailed)} sub={`${activeFailed} active · ${pastFailed} historical`} color="#ef4444" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)" }}>
            <StatCard label="Active In Progress" value={String(activeInProgress)} color="#4f8ef7" />
            <StatCard label="Total Active" value={String(active.length)} sub="with dashboard accounts" />
            <StatCard label="Historical" value={String(past.length)} sub="past client records" />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {TILES.map(({ href, label, desc }) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div className="admin-tile">
              <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 12, color: "#e8eaf0" }}>{label}</h2>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(210,220,240,0.88)" }}>{desc}</p>
              <div style={{ marginTop: 24, fontSize: 12, color: "#4f8ef7" }}>Manage →</div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .admin-tile {
          background: #08090f; border: 1px solid rgba(255,255,255,0.06);
          padding: 32px 28px; transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .admin-tile::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #4f8ef7, transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .admin-tile:hover { border-color: rgba(79,142,247,0.3); transform: translateY(-2px); }
        .admin-tile:hover::before { opacity: 1; }
      `}</style>
    </div>
  );
}
