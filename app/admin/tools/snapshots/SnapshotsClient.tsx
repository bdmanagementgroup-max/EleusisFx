"use client";

import { useState } from "react";

interface Signal {
  id: string; session_id: string; created_at: string;
  session: string; focus: string; news_level: string;
  pair: string; direction: string;
  entry_price?: string; stop_loss?: string; tp1?: string; tp2?: string; risk_reward?: string;
  bias?: string; timeframe?: string; confluence?: string;
  setup_detail?: string; invalidation?: string; content?: string;
  outcome?: string; outcome_pnl?: number | null; card_url?: string | null;
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

// ─── R-multiple helpers ─────────────────────────────────────────────────────

function firstNum(s?: string | null): number | null {
  if (!s) return null;
  const m = s.replace(/,/g, "").match(/-?\d+\.?\d*/);
  return m ? parseFloat(m[0]) : null;
}

// Default R for a manually-won trade: reward-to-TP1 over risk, from prices;
// falls back to the stated R:R (e.g. "3:1" → 3), else 2.
function defaultWonR(s: Signal): number {
  const entry = firstNum(s.entry_price);
  const sl = firstNum(s.stop_loss);
  const tp1 = firstNum(s.tp1);
  if (entry !== null && sl !== null && tp1 !== null) {
    const risk = Math.abs(entry - sl);
    if (risk > 0) return Math.round((Math.abs(tp1 - entry) / risk) * 100) / 100;
  }
  const rr = firstNum(s.risk_reward);
  if (rr !== null && rr > 0) return rr;
  return 2;
}

interface Agg {
  decided: number; wins: number; losses: number; winRate: number | null;
  rTrades: number; totalR: number; expectancy: number | null;
  avgWinR: number | null; avgLossR: number | null; profitFactor: number | null;
}

function computeAgg(
  signals: Signal[],
  outcomes: Record<string, string>,
  pnls: Record<string, number | null>,
): Agg {
  let wins = 0, losses = 0;
  const rVals: number[] = [];
  for (const s of signals) {
    const o = outcomes[s.id] ?? "pending";
    if (o === "won") wins++;
    else if (o === "lost") losses++;
    if ((o === "won" || o === "lost")) {
      const r = pnls[s.id];
      if (typeof r === "number") rVals.push(r);
    }
  }
  const decided = wins + losses;
  const winsR = rVals.filter(r => r > 0);
  const lossesR = rVals.filter(r => r < 0);
  const grossWin = winsR.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(lossesR.reduce((a, b) => a + b, 0));
  const totalR = rVals.reduce((a, b) => a + b, 0);
  return {
    decided, wins, losses,
    winRate: decided > 0 ? Math.round((wins / decided) * 100) : null,
    rTrades: rVals.length,
    totalR: Math.round(totalR * 100) / 100,
    expectancy: rVals.length > 0 ? Math.round((totalR / rVals.length) * 100) / 100 : null,
    avgWinR: winsR.length > 0 ? Math.round((grossWin / winsR.length) * 100) / 100 : null,
    avgLossR: lossesR.length > 0 ? Math.round((grossLoss / lossesR.length) * 100) / 100 : null,
    profitFactor: grossLoss > 0 ? Math.round((grossWin / grossLoss) * 100) / 100 : (grossWin > 0 ? null : null),
  };
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
  const [outcomes, setOutcomes] = useState<Record<string, string>>(
    Object.fromEntries(initial.map((s) => [s.id, s.outcome ?? "pending"]))
  );
  const [pnls, setPnls] = useState<Record<string, number | null>>(
    Object.fromEntries(initial.map((s) => [s.id, s.outcome_pnl ?? null]))
  );
  const [savingOutcome, setSavingOutcome] = useState<string | null>(null);
  const [cardUrls, setCardUrls] = useState<Record<string, string>>(
    Object.fromEntries(initial.filter((s) => s.card_url).map((s) => [s.id, s.card_url as string]))
  );
  const [cardBusy, setCardBusy] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  const agg = computeAgg(initial, outcomes, pnls);

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

  async function saveOutcome(id: string, outcome: string) {
    setSavingOutcome(id);
    // Seed a sensible default R when moving to a decided state; keep an
    // already-logged R if one exists so re-selecting doesn't clobber it.
    const sig = initial.find((s) => s.id === id);
    let pnl: number | null = pnls[id] ?? null;
    if (outcome === "lost") pnl = pnl ?? -1;
    else if (outcome === "won") pnl = pnl ?? (sig ? defaultWonR(sig) : null);
    else pnl = null; // pending / invalidated
    setOutcomes((prev) => ({ ...prev, [id]: outcome }));
    setPnls((prev) => ({ ...prev, [id]: pnl }));
    await fetch("/api/admin/trading-signals-outcome", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, outcome, outcome_pnl: pnl }),
    });
    setSavingOutcome(null);
  }

  async function savePnl(id: string, raw: string) {
    const val = raw.trim() === "" ? null : parseFloat(raw);
    const pnl = val !== null && !isNaN(val) ? Math.round(val * 100) / 100 : null;
    setPnls((prev) => ({ ...prev, [id]: pnl }));
    await fetch("/api/admin/trading-signals-outcome", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, outcome: outcomes[id] ?? "pending", outcome_pnl: pnl }),
    });
  }

  async function generateCard(id: string) {
    setCardBusy(id);
    setCardError(null);
    try {
      const res = await fetch("/api/signal-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: id }),
      });
      const body = await res.json();
      if (!res.ok) { setCardError(body.error ?? "card failed"); return; }
      setCardUrls((prev) => ({ ...prev, [id]: body.url }));
    } catch {
      setCardError("card request failed");
    } finally {
      setCardBusy(null);
    }
  }

  return (
    <div style={{ padding: "40px 48px 80px", maxWidth: 1100 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Admin / Tools</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, marginBottom: 8 }}>
        Analysis Snapshots
      </h1>
      <p style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(210,220,240,0.4)", marginBottom: 24 }}>
        {groups.length} session{groups.length !== 1 ? "s" : ""} · {initial.length} signal{initial.length !== 1 ? "s" : ""} saved · generate IG cards per signal
      </p>

      {/* Aggregate performance panel */}
      {agg.decided > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginBottom: 40, background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: 2 }}>
          {(() => {
            const tile = (label: string, value: string, colour: string, sub?: string) => (
              <div style={{ flex: "1 1 140px", padding: "16px 18px", background: "rgba(255,255,255,0.015)" }}>
                <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.35)", marginBottom: 8 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: -1, color: colour }}>{value}</div>
                {sub && <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(210,220,240,0.3)", marginTop: 4 }}>{sub}</div>}
              </div>
            );
            const wrColour = agg.winRate === null ? "rgba(210,220,240,0.5)" : agg.winRate >= 60 ? "#22c55e" : agg.winRate >= 40 ? "#f59e0b" : "#ef4444";
            const expColour = agg.expectancy === null ? "rgba(210,220,240,0.5)" : agg.expectancy > 0 ? "#22c55e" : "#ef4444";
            const pfColour = agg.profitFactor === null ? "rgba(210,220,240,0.5)" : agg.profitFactor >= 1 ? "#22c55e" : "#ef4444";
            const totColour = agg.totalR > 0 ? "#22c55e" : agg.totalR < 0 ? "#ef4444" : "rgba(210,220,240,0.5)";
            return (
              <>
                {tile("Win Rate", agg.winRate !== null ? `${agg.winRate}%` : "—", wrColour, `${agg.wins}W / ${agg.losses}L`)}
                {tile("Expectancy", agg.expectancy !== null ? `${agg.expectancy > 0 ? "+" : ""}${agg.expectancy}R` : "—", expColour, "per trade")}
                {tile("Profit Factor", agg.profitFactor !== null ? `${agg.profitFactor}` : "—", pfColour, "gross win / loss")}
                {tile("Total R", `${agg.totalR > 0 ? "+" : ""}${agg.totalR}R`, totColour, `${agg.rTrades} logged`)}
                {tile("Avg Win", agg.avgWinR !== null ? `+${agg.avgWinR}R` : "—", "#22c55e")}
                {tile("Avg Loss", agg.avgLossR !== null ? `−${agg.avgLossR}R` : "—", "#ef4444")}
              </>
            );
          })()}
        </div>
      )}
      {agg.decided > 0 && agg.rTrades < agg.decided && (
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.3)", marginTop: -28, marginBottom: 32 }}>
          {"// "}{agg.decided - agg.rTrades} decided trade{agg.decided - agg.rTrades !== 1 ? "s" : ""} missing an R value — run a trade review or set R manually to include in expectancy
        </div>
      )}
      {cardError && (
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#ef4444", marginBottom: 16 }}>card error: {cardError}</div>
      )}

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
                {(() => {
                  const decided = group.signals.filter(s => outcomes[s.id] === "won" || outcomes[s.id] === "lost");
                  const wins = group.signals.filter(s => outcomes[s.id] === "won").length;
                  const winRate = decided.length > 0 ? Math.round((wins / decided.length) * 100) : null;
                  return winRate !== null ? (
                    <span style={{
                      fontFamily: "monospace", fontSize: 10,
                      color: winRate >= 60 ? "#22c55e" : winRate >= 40 ? "#f59e0b" : "#ef4444",
                      background: winRate >= 60 ? "rgba(34,197,94,0.08)" : winRate >= 40 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
                      border: `1px solid ${winRate >= 60 ? "rgba(34,197,94,0.2)" : winRate >= 40 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`,
                      padding: "2px 8px",
                    }}>
                      {winRate}% WR
                    </span>
                  ) : (
                    <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.2)" }}>—% WR</span>
                  );
                })()}
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
                      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "#f59e0b" }}>R:R {s.risk_reward ?? "—"}</span>
                        <select
                          value={outcomes[s.id] ?? "pending"}
                          disabled={savingOutcome === s.id}
                          onChange={(e) => saveOutcome(s.id, e.target.value)}
                          style={{
                            appearance: "none",
                            background: (() => {
                              const o = outcomes[s.id] ?? "pending";
                              return o === "won" ? "rgba(34,197,94,0.08)" : o === "lost" ? "rgba(239,68,68,0.08)" : o === "invalidated" ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.03)";
                            })(),
                            border: `1px solid ${(() => {
                              const o = outcomes[s.id] ?? "pending";
                              return o === "won" ? "rgba(34,197,94,0.3)" : o === "lost" ? "rgba(239,68,68,0.3)" : o === "invalidated" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)";
                            })()}`,
                            color: (() => {
                              const o = outcomes[s.id] ?? "pending";
                              return o === "won" ? "#22c55e" : o === "lost" ? "#ef4444" : o === "invalidated" ? "#f59e0b" : "rgba(210,220,240,0.4)";
                            })(),
                            fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
                            padding: "3px 10px", fontFamily: "monospace",
                            cursor: savingOutcome === s.id ? "not-allowed" : "pointer",
                            opacity: savingOutcome === s.id ? 0.5 : 1,
                            outline: "none",
                          }}
                        >
                          <option value="pending" style={{ background: "#08090f" }}>Pending</option>
                          <option value="won" style={{ background: "#08090f" }}>Won</option>
                          <option value="lost" style={{ background: "#08090f" }}>Lost</option>
                          <option value="invalidated" style={{ background: "#08090f" }}>Invalidated</option>
                        </select>

                        {(outcomes[s.id] === "won" || outcomes[s.id] === "lost") && (
                          <input
                            type="number"
                            step="0.1"
                            value={pnls[s.id] ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              const n = v === "" ? null : parseFloat(v);
                              setPnls((prev) => ({ ...prev, [s.id]: n !== null && isNaN(n) ? (prev[s.id] ?? null) : n }));
                            }}
                            onBlur={(e) => savePnl(s.id, e.target.value)}
                            title="Result in R (risk multiples). Win = +R, full stop = −1."
                            style={{
                              width: 56, fontFamily: "monospace", fontSize: 10,
                              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                              color: (pnls[s.id] ?? 0) >= 0 ? "#22c55e" : "#ef4444",
                              padding: "3px 6px", outline: "none",
                            }}
                            placeholder="R"
                          />
                        )}

                        <button
                          onClick={() => generateCard(s.id)}
                          disabled={cardBusy === s.id}
                          title="Generate 1080×1080 Instagram card"
                          style={{ fontFamily: "monospace", fontSize: 10, cursor: cardBusy === s.id ? "wait" : "pointer", color: "#4f8ef7", background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.3)", padding: "3px 9px" }}
                        >
                          {cardBusy === s.id ? "rendering..." : "◨ card"}
                        </button>
                        {cardUrls[s.id] && (
                          <a href={cardUrls[s.id]} target="_blank" rel="noopener noreferrer" title="Open full card">
                            <img
                              src={cardUrls[s.id]}
                              alt={`${s.pair} card`}
                              style={{ width: 30, height: 30, objectFit: "cover", border: "1px solid rgba(79,142,247,0.3)", display: "block" }}
                            />
                          </a>
                        )}
                      </div>
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
