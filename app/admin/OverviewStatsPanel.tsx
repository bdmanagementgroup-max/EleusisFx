"use client";
import { useState } from "react";

interface Props {
  totalClients: number;
  active: number;
  past: number;
  activePassed: number;
  activeFailed: number;
  activeInProgress: number;
  pastPassed: number;
  pastFailed: number;
  totalPassed: number;
  totalFailed: number;
  totalCompleted: number;
  passRate: number | null;
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.05)", padding: "14px 16px" }}>
      <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 1, color: "rgba(210,220,240,0.28)", marginBottom: 6 }}>{`// ${label.toLowerCase()}`}</div>
      <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 20, color: color ?? "#e8eaf0", letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function PassRateArc({ passRate }: { passRate: number | null }) {
  const cx = 200, cy = 200, r = 160;
  const rate = passRate ?? 0;
  const angle = (rate / 100) * Math.PI;
  const x = cx + r * Math.cos(Math.PI - angle);
  const y = cy - r * Math.sin(Math.PI - angle);
  const largeArc = rate > 50 ? 1 : 0;

  const greyPath = `M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`;
  const colourPath = rate === 0
    ? ""
    : rate >= 100
      ? `M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`
      : `M ${cx - r},${cy} A ${r},${r} 0 ${largeArc} 1 ${x},${y}`;

  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.05)", padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.28)", marginBottom: 20 }}>// pass rate</div>
      <svg viewBox="0 0 400 220" style={{ width: "100%", maxWidth: 280 }}>
        <path d={greyPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="24" strokeLinecap="round" />
        {colourPath && (
          <path d={colourPath} fill="none" stroke="#22c55e" strokeWidth="24" strokeLinecap="round" />
        )}
        <text x={cx} y={cy - 8} textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="52" fill={passRate !== null ? "#22c55e" : "rgba(210,220,240,0.3)"}>
          {passRate !== null ? `${passRate}%` : "—"}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontFamily="monospace" fontSize="11" fill="rgba(210,220,240,0.3)" letterSpacing="2">
          PASS RATE
        </text>
      </svg>
    </div>
  );
}

function PassFailDonut({ totalPassed, totalFailed }: { totalPassed: number; totalFailed: number }) {
  const total = totalPassed + totalFailed;
  const cx = 160, cy = 160, r = 110, hole = 68;

  function slicePath(startPct: number, endPct: number, outerR: number, innerR: number) {
    const toRad = (pct: number) => (pct * 2 * Math.PI) - Math.PI / 2;
    const s = toRad(startPct), e = toRad(endPct);
    const large = (endPct - startPct) > 0.5 ? 1 : 0;
    const ox1 = cx + outerR * Math.cos(s), oy1 = cy + outerR * Math.sin(s);
    const ox2 = cx + outerR * Math.cos(e), oy2 = cy + outerR * Math.sin(e);
    const ix1 = cx + innerR * Math.cos(e), iy1 = cy + innerR * Math.sin(e);
    const ix2 = cx + innerR * Math.cos(s), iy2 = cy + innerR * Math.sin(s);
    return `M ${ox1},${oy1} A ${outerR},${outerR} 0 ${large} 1 ${ox2},${oy2} L ${ix1},${iy1} A ${innerR},${innerR} 0 ${large} 0 ${ix2},${iy2} Z`;
  }

  const passedPct = total > 0 ? totalPassed / total : 0;
  const failedPct = total > 0 ? totalFailed / total : 0;

  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.05)", padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.28)", marginBottom: 20 }}>// pass vs fail</div>
      <svg viewBox="0 0 320 320" style={{ width: "100%", maxWidth: 220 }}>
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.04)" />
        ) : (
          <>
            {passedPct > 0 && <path d={slicePath(0, passedPct, r, hole)} fill="#22c55e" opacity="0.85" />}
            {failedPct > 0 && <path d={slicePath(passedPct, 1, r, hole)} fill="#ef4444" opacity="0.85" />}
          </>
        )}
        <text x={cx} y={cy - 6} textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="36" fill="#e8eaf0">
          {total}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontFamily="monospace" fontSize="9" fill="rgba(210,220,240,0.3)" letterSpacing="2">
          COMPLETED
        </text>
      </svg>
      <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#22c55e" }}>PASSED · {totalPassed}</span>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#ef4444" }}>FAILED · {totalFailed}</span>
      </div>
    </div>
  );
}

function ClientBreakdownBar({
  activePassed, activeFailed, activeInProgress,
  pastPassed, pastFailed,
}: {
  activePassed: number; activeFailed: number; activeInProgress: number;
  pastPassed: number; pastFailed: number;
}) {
  function Row({ label, segments }: { label: string; segments: { value: number; color: string; key: string }[] }) {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.4)", marginBottom: 6 }}>{label}</div>
        <div style={{ display: "flex", height: 28, borderRadius: 2, overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
          {total === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(210,220,240,0.2)" }}>no data</span>
            </div>
          ) : segments.map((seg) => seg.value > 0 ? (
            <div
              key={seg.key}
              style={{
                flex: seg.value / total,
                background: seg.color,
                opacity: 0.8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {(seg.value / total) > 0.1 && (
                <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, color: "#020305" }}>{seg.value}</span>
              )}
            </div>
          ) : null)}
        </div>
        {total > 0 && (
          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            {segments.map((seg) => seg.value > 0 ? (
              <span key={seg.key} style={{ fontFamily: "monospace", fontSize: 9, color: seg.color, opacity: 0.7 }}>
                {seg.key.toUpperCase()} · {seg.value}
              </span>
            ) : null)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.05)", padding: "28px 24px" }}>
      <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.28)", marginBottom: 24 }}>// client breakdown</div>
      <Row label="Active Clients" segments={[
        { key: "in progress", value: activeInProgress, color: "#4f8ef7" },
        { key: "passed", value: activePassed, color: "#22c55e" },
        { key: "failed", value: activeFailed, color: "#ef4444" },
      ]} />
      <Row label="Historical Records" segments={[
        { key: "passed", value: pastPassed, color: "#22c55e" },
        { key: "failed", value: pastFailed, color: "#ef4444" },
      ]} />
    </div>
  );
}

export default function OverviewStatsPanel(props: Props) {
  const { totalClients, active, past, activePassed, activeFailed, activeInProgress, pastPassed, pastFailed, totalPassed, totalFailed, totalCompleted, passRate } = props;
  const [view, setView] = useState<"stats" | "charts">("stats");

  return (
    <div style={{ marginBottom: 48 }}>
      {/* Terminal prompt header with toggle */}
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
        <span style={{ marginLeft: "auto", display: "flex", gap: 1 }}>
          {(["stats", "charts"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "4px 10px",
                border: "1px solid rgba(79,142,247,0.3)",
                background: view === v ? "#4f8ef7" : "transparent",
                color: view === v ? "#020305" : "rgba(79,142,247,0.7)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {v}
            </button>
          ))}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.2)" }}>{totalClients} records</span>
      </div>

      {view === "stats" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)", marginBottom: 1 }}>
            <StatCard label="Total Clients" value={String(totalClients)} sub={`${active} active · ${past} historical`} />
            <StatCard label="Pass Rate" value={passRate !== null ? `${passRate}%` : "—"} sub={`${totalPassed} of ${totalCompleted} completed`} color="#22c55e" />
            <StatCard label="Total Passed" value={String(totalPassed)} sub={`${activePassed} active · ${pastPassed} historical`} color="#22c55e" />
            <StatCard label="Total Failed" value={String(totalFailed)} sub={`${activeFailed} active · ${pastFailed} historical`} color="#ef4444" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)" }}>
            <StatCard label="Active In Progress" value={String(activeInProgress)} color="#4f8ef7" />
            <StatCard label="Total Active" value={String(active)} sub="with dashboard accounts" />
            <StatCard label="Historical" value={String(past)} sub="past client records" />
          </div>
        </>
      )}

      {view === "charts" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,0.04)" }}>
          <PassRateArc passRate={passRate} />
          <PassFailDonut totalPassed={totalPassed} totalFailed={totalFailed} />
          <ClientBreakdownBar
            activePassed={activePassed}
            activeFailed={activeFailed}
            activeInProgress={activeInProgress}
            pastPassed={pastPassed}
            pastFailed={pastFailed}
          />
        </div>
      )}
    </div>
  );
}
