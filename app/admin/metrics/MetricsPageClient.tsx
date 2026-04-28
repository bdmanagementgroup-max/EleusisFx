"use client";

import { useState } from "react";
import MetricsClient from "./MetricsClient";
import Link from "next/link";

type ActiveRow = {
  user_id: string;
  email: string;
  prop_firm: string | null;
  phase: number;
  phase_status: string;
  balance: number;
  equity: number;
  daily_drawdown: number;
  max_drawdown: number;
  profit_target: number;
  profit_goal: number;
  days_used: number;
  days_allowed: number;
  updated_at: string | null;
};

type PastRow = {
  id: string;
  name: string;
  challenge_result: string | null;
  phase_status: string | null;
  account_size_usd: number | null;
  profit_target: number | null;
  max_drawdown: number | null;
  prop_firm: string | null;
};

type Year = "all" | "2025" | "2026";

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.05)", padding: "14px 16px" }}>
      <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 1, color: "rgba(210,220,240,0.28)", marginBottom: 6 }}>// {label.toLowerCase()}</div>
      <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 20, color: color ?? "#e8eaf0", letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function statusLabel(p: PastRow) {
  if (p.phase_status && p.phase_status !== "unknown") return p.phase_status;
  const r = (p.challenge_result ?? "").toLowerCase().trim();
  if (!r) return "unknown";
  if (r.startsWith("pass") || r === "funded" || r === "yes" || r === "p") return "passed";
  if (r.startsWith("fail") || r === "no" || r === "f") return "failed";
  return r;
}

export default function MetricsPageClient({ activeRows, pastRows }: { activeRows: ActiveRow[]; pastRows: PastRow[] }) {
  const [year, setYear] = useState<Year>("all");

  const showActive = year === "all" || year === "2026";
  const showPast   = year === "all" || year === "2025";

  // Aggregate stats for current filter
  const activePassed   = showActive ? activeRows.filter(r => r.phase_status === "passed").length   : 0;
  const activeFailed   = showActive ? activeRows.filter(r => r.phase_status === "failed").length   : 0;
  const activeProgress = showActive ? activeRows.filter(r => r.phase_status === "in_progress").length : 0;

  const pastPassed = showPast ? pastRows.filter(p => statusLabel(p) === "passed").length : 0;
  const pastFailed = showPast ? pastRows.filter(p => statusLabel(p) === "failed").length : 0;

  const totalPassed    = activePassed + pastPassed;
  const totalFailed    = activeFailed + pastFailed;
  const totalCompleted = totalPassed + totalFailed;
  const totalClients   = (showActive ? activeRows.length : 0) + (showPast ? pastRows.length : 0);
  const passRate       = totalCompleted > 0 ? Math.round((totalPassed / totalCompleted) * 100) : null;

  const TABS: { value: Year; label: string }[] = [
    { value: "all",  label: "all" },
    { value: "2026", label: "2026" },
    { value: "2025", label: "2025" },
  ];

  return (
    <>
      {/* Terminal-style year selector */}
      <div style={{
        fontFamily: "monospace",
        background: "#08090f",
        border: "1px solid rgba(255,255,255,0.07)",
        borderLeft: "2px solid #4f8ef7",
        padding: "10px 16px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 0,
      }}>
        <span style={{ color: "rgba(210,220,240,0.3)", fontSize: 11, marginRight: 10, userSelect: "none" }}>$&gt;</span>
        <span style={{ color: "rgba(210,220,240,0.4)", fontSize: 11, marginRight: 16 }}>view --year</span>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setYear(tab.value)}
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "2px 10px",
              color: year === tab.value ? "#4f8ef7" : "rgba(210,220,240,0.35)",
              borderBottom: year === tab.value ? "1px solid #4f8ef7" : "1px solid transparent",
              transition: "all 0.12s",
              marginRight: 2,
            }}
          >
            {year === tab.value ? `[${tab.label}]` : tab.label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.2)" }}>
          {totalClients} record{totalClients !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Stats */}
      {totalClients > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)", marginBottom: 1 }}>
            <StatCard label="Total Clients" value={String(totalClients)} />
            <StatCard label="Pass Rate" value={passRate !== null ? `${passRate}%` : "—"} sub={`${totalPassed} of ${totalCompleted} completed`} color="#22c55e" />
            <StatCard label="Passed" value={String(totalPassed)} color="#22c55e" />
            <StatCard label="Failed" value={String(totalFailed)} color="#ef4444" />
          </div>
          {showActive && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)" }}>
              <StatCard label="In Progress" value={String(activeProgress)} color="#4f8ef7" />
              <StatCard label="Active Accounts" value={String(activeRows.length)} />
              <StatCard label="Historical Records" value={String(showPast ? pastRows.length : 0)} />
            </div>
          )}
        </div>
      )}

      {/* Active clients (2026) */}
      {showActive && (
        <div style={{ marginBottom: showPast ? 56 : 0 }}>
          {year === "all" && (
            <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "rgba(210,220,240,0.4)", marginBottom: 16 }}>
              2026 — Current Clients
            </div>
          )}
          <MetricsClient rows={activeRows} />
        </div>
      )}

      {/* Historical clients (2025) */}
      {showPast && pastRows.length > 0 && (
        <div>
          {year === "all" && (
            <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "rgba(210,220,240,0.4)", marginBottom: 16 }}>
              2025 — Historical Clients
            </div>
          )}
          <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
            {pastRows.map((p) => {
              const status = statusLabel(p);
              const isPass = status === "passed";
              const isFail = status === "failed";
              return (
                <div key={p.id} style={{
                  display: "grid", gridTemplateColumns: "1fr auto auto auto auto",
                  padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                  alignItems: "center", gap: 16,
                }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 600, fontSize: 13, color: "#e8eaf0" }}>{p.name}</div>
                    {p.prop_firm && <div style={{ fontSize: 11, color: "rgba(210,220,240,0.4)" }}>{p.prop_firm}</div>}
                  </div>
                  {p.account_size_usd != null && (
                    <span style={{ fontSize: 11, color: "#4f8ef7" }}>${(p.account_size_usd / 1000).toFixed(0)}K</span>
                  )}
                  {p.profit_target != null && (
                    <span style={{ fontSize: 11, color: "rgba(210,220,240,0.5)" }}>{Number(p.profit_target).toFixed(1)}% profit</span>
                  )}
                  {p.max_drawdown != null && (
                    <span style={{ fontSize: 11, color: "rgba(210,220,240,0.5)" }}>{Number(p.max_drawdown).toFixed(1)}% DD</span>
                  )}
                  <span style={{
                    fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", padding: "3px 10px",
                    background: isPass ? "rgba(34,197,94,0.08)" : isFail ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
                    color: isPass ? "#22c55e" : isFail ? "#ef4444" : "rgba(210,220,240,0.3)",
                  }}>
                    {status.replace("_", " ")}
                  </span>
                  <Link href="/admin/past-clients" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f8ef7", textDecoration: "none", border: "1px solid rgba(79,142,247,0.2)", padding: "4px 10px", whiteSpace: "nowrap" }}>
                    Edit →
                  </Link>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "rgba(232,234,240,0.2)" }}>
            {pastPassed} passed · {pastFailed} failed · {pastRows.length - pastPassed - pastFailed} unknown
          </div>
        </div>
      )}

      {showPast && pastRows.length === 0 && (
        <div style={{ fontSize: 13, color: "rgba(210,220,240,0.4)", padding: "32px 0" }}>No historical client records found.</div>
      )}
    </>
  );
}
