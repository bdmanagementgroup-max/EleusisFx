import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import OverviewStatsPanel from "./OverviewStatsPanel";

export const dynamic = "force-dynamic";

const TILES = [
  { href: "/admin/inbox", label: "Inbox", desc: "Emails received at admin@eleusisfx.uk — reply and mark as read." },
  { href: "/admin/articles", label: "Articles", desc: "Create, edit, and publish articles to the site." },
  { href: "/admin/clients", label: "Clients", desc: "View applications, manage leads, and create client accounts." },
  { href: "/admin/metrics", label: "Evaluation Metrics", desc: "Edit live challenge metrics for each client account." },
  { href: "/admin/resources", label: "Resources", desc: "Add prop firm guides, tools, and PDF downloads." },
  { href: "/admin/past-clients", label: "Past Clients", desc: "View historical client records, challenge results, and contact details." },
  { href: "/admin/tools/email", label: "Email Editor", desc: "Compose and send branded emails to clients, past clients, and custom recipients." },
  { href: "/admin/tools/instagram", label: "Instagram Metrics", desc: "Log and track follower growth, reach, engagement, and post performance." },
  { href: "/admin/tools/chart", label: "Chart Tool", desc: "View live TradingView charts for any forex or crypto pair, take snapshots, and post directly to Instagram and Telegram." },
  { href: "/admin/tools/trading-analysis", label: "Trading Analysis", desc: "AI market scanner — select session, DXY bias, and news level to generate confluence-based signals + Instagram captions." },
];

export default async function AdminOverview() {
  const supabase = await getSupabaseAdminClient();

  const [{ data: metrics }, { data: pastClients }, { count: newApplications }, { count: unreadEmails }] = await Promise.all([
    supabase.from("client_metrics").select("phase_status,profit_target,max_drawdown"),
    supabase.from("past_clients").select("challenge_result,phase_status"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("received_emails").select("id", { count: "exact", head: true }).is("read_at", null),
  ]);

  const active = metrics ?? [];
  const past = pastClients ?? [];

  const activePassed = active.filter((r) => r.phase_status === "passed").length;
  const activeFailed = active.filter((r) => r.phase_status === "failed").length;
  const activeInProgress = active.filter((r) => r.phase_status === "in_progress").length;

  function resolveResult(phase_status: string, challenge_result: string | null) {
    if (phase_status === "passed") return "passed";
    if (phase_status === "failed") return "failed";
    const r = (challenge_result ?? "").toLowerCase().trim();
    if (r.startsWith("pass") || r === "funded" || r === "yes" || r === "p") return "passed";
    if (r.startsWith("fail") || r === "no" || r === "f") return "failed";
    return "unknown";
  }

  const pastPassed = past.filter((p) => resolveResult(p.phase_status ?? "", p.challenge_result) === "passed").length;
  const pastFailed = past.filter((p) => resolveResult(p.phase_status ?? "", p.challenge_result) === "failed").length;

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
        <Link href="/admin/clients" style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
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

      {(unreadEmails ?? 0) > 0 && (
        <Link href="/admin/inbox" style={{ textDecoration: "none", display: "block", marginBottom: 32 }}>
          <div style={{
            fontFamily: "monospace",
            background: "rgba(79,142,247,0.06)",
            border: "1px solid rgba(79,142,247,0.3)",
            borderLeft: "2px solid #4f8ef7",
            padding: "10px 16px",
            display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer",
          }}>
            <span style={{ color: "rgba(79,142,247,0.5)", fontSize: 11, userSelect: "none" }}>$&gt;</span>
            <span style={{ color: "#4f8ef7", fontSize: 11, fontWeight: 700 }}>
              !! {unreadEmails} unread email{(unreadEmails ?? 0) > 1 ? "s" : ""} — admin@eleusisfx.uk
            </span>
            <span style={{ marginLeft: "auto", color: "rgba(79,142,247,0.45)", fontSize: 10 }}>→ /admin/inbox</span>
          </div>
        </Link>
      )}

      {showStats && (
        <OverviewStatsPanel
          totalClients={totalClients}
          active={active.length}
          past={past.length}
          activePassed={activePassed}
          activeFailed={activeFailed}
          activeInProgress={activeInProgress}
          pastPassed={pastPassed}
          pastFailed={pastFailed}
          totalPassed={totalPassed}
          totalFailed={totalFailed}
          totalCompleted={totalCompleted}
          passRate={passRate}
        />
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
