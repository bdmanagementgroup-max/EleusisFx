import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import PastClientDetailClient from "./PastClientDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Past Client — Admin" };

export default async function PastClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseAdminClient();

  const { data: client } = await supabase
    .from("past_clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const phaseColor =
    client.phase_status === "passed" ? "#22c55e" :
    client.phase_status === "failed" ? "#ef4444" :
    client.phase_status === "neutral" ? "rgba(210,220,240,0.45)" :
    client.phase_status === "ready_to_start" ? "#f59e0b" : "#4f8ef7";

  const progressPct = client.profit_goal
    ? (Number(client.profit_target ?? 0) / Number(client.profit_goal)) * 100
    : 0;
  const daysPct = client.days_allowed
    ? ((client.days_used ?? 0) / client.days_allowed) * 100
    : 0;

  return (
    <div style={{ padding: "40px 48px 80px" }}>
      <Link
        href="/admin/metrics"
        style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.4)", textDecoration: "none" }}
      >
        ← Back to Metrics
      </Link>

      <div style={{ marginTop: 20, marginBottom: 8, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7" }}>
        Historical Client
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: -1, color: "#e8eaf0" }}>
          {client.name}
        </h1>
        {client.phase_status && (
          <span style={{
            fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 12px",
            background: `${phaseColor}18`, color: phaseColor,
          }}>
            {client.phase === 0 ? "Neutral" : `Phase ${client.phase ?? 1}`} · {(client.phase_status ?? "unknown").replace("_", " ")}
          </span>
        )}
        {client.prop_firm && (
          <span style={{ fontSize: 11, color: "rgba(210,220,240,0.4)" }}>{client.prop_firm}</span>
        )}
      </div>

      {/* Stat cards */}
      {(client.balance != null || client.equity != null) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)", marginBottom: 16 }}>
          {[
            { label: "Account Balance", value: client.balance != null ? `$${Number(client.balance).toLocaleString()}` : "—" },
            { label: "Current Equity",  value: client.equity  != null ? `$${Number(client.equity).toLocaleString()}`  : "—", color: "#22c55e" },
            { label: "Daily Drawdown",  value: client.daily_drawdown != null ? `${Number(client.daily_drawdown).toFixed(2)}%` : "—", color: Number(client.daily_drawdown) > 4 ? "#ef4444" : undefined },
            { label: "Max Drawdown",    value: client.max_drawdown   != null ? `${Number(client.max_drawdown).toFixed(2)}%`   : "—", color: Number(client.max_drawdown)   > 8 ? "#ef4444" : undefined },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#08090f", padding: "28px 24px" }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.4)", marginBottom: 10 }}>{label}</div>
              <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: -1, color: color ?? "#e8eaf0" }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Progress bars */}
      {(client.profit_goal != null || client.days_allowed != null) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {client.profit_goal != null && (
            <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.4)" }}>Profit Target Progress</div>
                <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "#22c55e" }}>
                  {Number(client.profit_target ?? 0).toFixed(1)}% / {Number(client.profit_goal).toFixed(0)}%
                </div>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(progressPct, 100)}%`, background: "linear-gradient(90deg, #4f8ef7, #22c55e)" }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "rgba(210,220,240,0.4)" }}>
                {(Number(client.profit_goal) - Number(client.profit_target ?? 0)).toFixed(1)}% remaining
              </div>
            </div>
          )}
          {client.days_allowed != null && (
            <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.4)" }}>Days Used</div>
                <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "#e8eaf0" }}>
                  {client.days_used ?? 0} / {client.days_allowed}
                </div>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(daysPct, 100)}%`, background: "#4f8ef7" }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "rgba(210,220,240,0.4)" }}>
                {client.days_allowed - (client.days_used ?? 0)} days remaining
              </div>
            </div>
          )}
        </div>
      )}

      <PastClientDetailClient client={client} />
    </div>
  );
}
