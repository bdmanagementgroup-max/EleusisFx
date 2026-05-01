"use client";

import { useState } from "react";

interface Signal {
  id: string; session_id: string; created_at: string;
  session: string; focus: string; news_level: string;
  pair: string; direction: string;
  entry_price?: string; stop_loss?: string; tp1?: string; tp2?: string; risk_reward?: string;
  // full export fields
  bias?: string; timeframe?: string; confluence?: string;
  setup_detail?: string; invalidation?: string; content?: string;
}

interface SessionGroup {
  session_id: string; created_at: string;
  session: string; focus: string; news_level: string;
  signals: Signal[];
}

function groupBySession(signals: Signal[]): SessionGroup[] {
  const map = new Map<string, SessionGroup>();
  for (const s of signals) {
    if (!map.has(s.session_id)) {
      map.set(s.session_id, { session_id: s.session_id, created_at: s.created_at, session: s.session, focus: s.focus, news_level: s.news_level, signals: [] });
    }
    map.get(s.session_id)!.signals.push(s);
  }
  return Array.from(map.values());
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    + " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function newsColour(n: string) {
  return n === "major" ? "#ef4444" : n === "light" ? "#f59e0b" : "#22c55e";
}

// ─── HTML export generator ────────────────────────────────────────────────────

function generateSignalCard(s: Signal, dateStr: string): string {
  const isBuy = s.direction === "BUY";
  const dirColour = isBuy ? "#22c55e" : "#ef4444";
  const dirBg = isBuy ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)";
  const dirBorder = isBuy ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)";
  const arrow = isBuy ? "↑" : "↓";

  let bullets: string[] = [];
  try { bullets = JSON.parse(s.confluence ?? "[]"); } catch { bullets = []; }

  const levelRow = (label: string, value: string, colour: string) => `
    <div class="level-cell">
      <div class="level-label">${label}</div>
      <div class="level-value" style="color:${colour}">${value || "—"}</div>
    </div>`;

  return `
  <div class="card" id="card-${s.pair.replace("/", "")}">
    <div class="card-header">
      <div class="logo">ELEUSIS<span class="logo-dot">.</span>FX</div>
      <div class="header-meta">
        <div class="meta-date">${dateStr}</div>
        <div class="meta-session">${s.session.toUpperCase()} SESSION</div>
      </div>
    </div>

    <div class="pair-row">
      <div class="pair-name">${s.pair}</div>
      <div class="dir-badge" style="color:${dirColour};background:${dirBg};border-color:${dirBorder}">
        ${s.direction} ${arrow}
      </div>
    </div>

    ${s.timeframe ? `<div class="timeframe">${s.timeframe}</div>` : ""}

    <div class="divider"></div>

    ${bullets.length > 0 ? `
    <div class="section-label">CONFLUENCE</div>
    <div class="bullets">
      ${bullets.slice(0, 3).map(b => `<div class="bullet"><span class="bullet-dot" style="color:${dirColour}">›</span> ${b}</div>`).join("")}
    </div>
    <div class="divider"></div>` : ""}

    <div class="levels-grid">
      ${levelRow("ENTRY", s.entry_price ?? "", "#4f8ef7")}
      ${levelRow("STOP LOSS", s.stop_loss ?? "", "#ef4444")}
      ${levelRow("TP1", s.tp1 ?? "", "#22c55e")}
      ${levelRow("TP2", s.tp2 ?? "", "#22c55e")}
    </div>

    <div class="divider"></div>

    <div class="footer-row">
      <div class="rr-block">
        <span class="rr-label">R:R</span>
        <span class="rr-value">${s.risk_reward ?? "—"}</span>
      </div>
      ${s.invalidation ? `<div class="invalidation"><span class="inv-label">INVALIDATION</span><br/>${s.invalidation}</div>` : ""}
    </div>

    <div class="card-footer">
      <span style="color:rgba(210,220,240,0.3)">⚠ Not financial advice · Trade your own plan.</span>
      <span style="color:rgba(79,142,247,0.5)">#EleusisFx</span>
    </div>
  </div>`;
}

function generateHtml(group: SessionGroup, signals: Signal[]): string {
  const dateStr = new Date(group.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const cards = signals.map(s => generateSignalCard(s, dateStr)).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Eleusis FX — ${group.session} Signals — ${dateStr}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0b12;
    font-family: 'Space Mono', monospace;
    padding: 40px 20px;
    color: rgba(210,220,240,0.88);
  }

  .page-note {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: rgba(210,220,240,0.3);
    text-align: center;
    letter-spacing: 1px;
    margin-bottom: 40px;
  }

  .card {
    width: 1080px;
    min-height: 1280px;
    background: #08090f;
    border: 1px solid rgba(255,255,255,0.07);
    padding: 56px 64px;
    margin: 0 auto 60px;
    display: flex;
    flex-direction: column;
    gap: 0;
    page-break-after: always;
    position: relative;
  }

  /* Header */
  .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }
  .logo { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 20px; letter-spacing: 6px; text-transform: uppercase; color: #e8eaf0; }
  .logo-dot { color: #4f8ef7; }
  .header-meta { text-align: right; }
  .meta-date { font-size: 11px; letter-spacing: 1.5px; color: rgba(210,220,240,0.5); margin-bottom: 4px; }
  .meta-session { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(79,142,247,0.6); }

  /* Pair */
  .pair-row { display: flex; align-items: center; gap: 24px; margin-bottom: 12px; }
  .pair-name { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 80px; letter-spacing: -3px; color: #e8eaf0; line-height: 1; }
  .dir-badge { font-family: 'Space Mono', monospace; font-weight: 700; font-size: 15px; letter-spacing: 3px; padding: 10px 22px; border: 1px solid; text-transform: uppercase; align-self: center; }
  .timeframe { font-size: 11px; letter-spacing: 2px; color: rgba(210,220,240,0.35); text-transform: uppercase; margin-bottom: 4px; }

  /* Divider */
  .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 28px 0; }

  /* Confluence */
  .section-label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: rgba(210,220,240,0.3); margin-bottom: 14px; }
  .bullets { display: flex; flex-direction: column; gap: 10px; }
  .bullet { font-size: 13px; line-height: 1.6; color: rgba(210,220,240,0.75); display: flex; gap: 10px; }
  .bullet-dot { font-size: 18px; line-height: 1; flex-shrink: 0; }

  /* Levels */
  .levels-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .level-cell { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); padding: 24px 28px; }
  .level-label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: rgba(210,220,240,0.3); margin-bottom: 10px; }
  .level-value { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px; letter-spacing: -1px; }

  /* Footer row */
  .footer-row { display: flex; align-items: flex-start; gap: 40px; margin-top: auto; }
  .rr-block { display: flex; flex-direction: column; gap: 6px; }
  .rr-label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: rgba(210,220,240,0.3); }
  .rr-value { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 36px; letter-spacing: -1px; color: #f59e0b; }
  .invalidation { font-size: 12px; line-height: 1.6; color: rgba(210,220,240,0.45); flex: 1; }
  .inv-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(210,220,240,0.25); display: block; margin-bottom: 6px; }

  /* Card footer */
  .card-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; font-size: 11px; letter-spacing: 1px; }

  @media print {
    body { padding: 0; background: #08090f; }
    .page-note { display: none; }
    .card { margin: 0; border: none; page-break-after: always; }
  }
</style>
</head>
<body>
<div class="page-note">ELEUSIS FX — ${group.session} SESSION · ${dateStr} · ${signals.length} signal${signals.length === 1 ? "" : "s"} · Screenshot each card individually</div>
${cards}
</body>
</html>`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SnapshotsClient({ initial, dbError }: { initial: Signal[]; dbError?: string }) {
  const groups = groupBySession(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function exportHtml(group: SessionGroup) {
    setExporting(group.session_id);
    try {
      const res = await fetch(`/api/admin/trading-signals?session_id=${group.session_id}`);
      if (!res.ok) return;
      const { signals } = await res.json();
      const html = generateHtml(group, signals);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date(group.created_at).toISOString().slice(0, 10);
      a.href = url; a.download = `eleusis-signals-${dateStr}-${group.session.toLowerCase().replace(" ", "-")}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }

  async function deleteGroup(sessionId: string) {
    if (!confirm("Delete all signals in this session?")) return;
    setDeleting(sessionId);
    await fetch(`/api/admin/trading-signals?session_id=${sessionId}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div style={{ padding: "40px 48px 80px", maxWidth: 1100 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Admin / Tools</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, marginBottom: 8 }}>
        Analysis Snapshots
      </h1>
      <p style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(210,220,240,0.4)", marginBottom: 40 }}>
        {groups.length} session{groups.length !== 1 ? "s" : ""} · {initial.length} signal{initial.length !== 1 ? "s" : ""} saved · export HTML to screenshot as posts
      </p>

      {dbError && (
        <div style={{ fontFamily: "monospace", fontSize: 12, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.25)", borderLeft: "2px solid #ef4444", padding: "10px 16px", marginBottom: 16, color: "#ef4444" }}>
          <span style={{ opacity: 0.5 }}>$&gt; </span>DB ERROR: {dbError}
          {dbError.includes("does not exist") && <span style={{ color: "rgba(239,68,68,0.7)" }}> — run trading-signals-migration.sql in Supabase SQL Editor</span>}
        </div>
      )}

      {groups.length === 0 && !dbError ? (
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.04)", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(210,220,240,0.2)" }}>
            {"// no signals yet — run an analysis and click \"save signals\""}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {groups.map((group) => (
            <div key={group.session_id} style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderLeft: expanded === group.session_id ? "2px solid #4f8ef7" : "2px solid rgba(255,255,255,0.06)" }}>

              {/* Group header */}
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  onClick={() => setExpanded(expanded === group.session_id ? null : group.session_id)}
                  style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(79,142,247,0.5)", cursor: "pointer", userSelect: "none" }}
                >
                  {expanded === group.session_id ? "▾" : "▸"}
                </span>
                <span
                  onClick={() => setExpanded(expanded === group.session_id ? null : group.session_id)}
                  style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(210,220,240,0.7)", flex: 1, cursor: "pointer" }}
                >
                  {formatDate(group.created_at)}
                </span>
                <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 1, color: "#4f8ef7", textTransform: "uppercase" }}>{group.session}</span>
                <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.4)" }}>{group.signals.length} signal{group.signals.length !== 1 ? "s" : ""}</span>
                <span style={{ fontFamily: "monospace", fontSize: 10, color: newsColour(group.news_level), textTransform: "uppercase" }}>{group.news_level === "none" ? "no news" : group.news_level}</span>
                <button
                  onClick={() => exportHtml(group)}
                  disabled={exporting === group.session_id}
                  style={{ fontFamily: "monospace", fontSize: 10, cursor: "pointer", color: "#4f8ef7", background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.3)", padding: "3px 10px" }}
                >
                  {exporting === group.session_id ? "generating..." : "export html"}
                </button>
                <button
                  onClick={() => deleteGroup(group.session_id)}
                  disabled={deleting === group.session_id}
                  style={{ fontFamily: "monospace", fontSize: 10, cursor: "pointer", color: "rgba(239,68,68,0.4)", background: "none", border: "1px solid rgba(239,68,68,0.15)", padding: "2px 8px" }}
                >
                  {deleting === group.session_id ? "..." : "delete"}
                </button>
              </div>

              {/* Expanded signal rows */}
              {expanded === group.session_id && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  {group.signals.map((s, i) => (
                    <div key={s.id} style={{ padding: "10px 36px", display: "flex", alignItems: "center", gap: 20, borderBottom: i < group.signals.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: s.direction === "BUY" ? "#22c55e" : "#ef4444", width: 36 }}>{s.direction}</span>
                      <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#e8eaf0", width: 72 }}>{s.pair}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#4f8ef7" }}>Entry: {s.entry_price ?? "—"}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#ef4444" }}>SL: {s.stop_loss ?? "—"}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#22c55e" }}>TP1: {s.tp1 ?? "—"}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#22c55e" }}>TP2: {s.tp2 ?? "—"}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#f59e0b", marginLeft: "auto" }}>R:R {s.risk_reward ?? "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
