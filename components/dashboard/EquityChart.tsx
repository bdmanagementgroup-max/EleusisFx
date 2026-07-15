"use client";

import { useRef, useState } from "react";

type Point = { day: string; equity: number };

const W = 800;
const H = 260;
const M = { top: 20, right: 20, bottom: 32, left: 62 };
const plotW = W - M.left - M.right;
const plotH = H - M.top - M.bottom;

function fmtUsd(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

export default function EquityChart({ data }: { data: Point[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const equities = data.map((d) => d.equity);
  const dataMin = Math.min(...equities);
  const dataMax = Math.max(...equities);
  // pad the domain so the line never sits on the top/bottom edge
  const pad = Math.max((dataMax - dataMin) * 0.12, 300);
  const min = dataMin - pad;
  const max = dataMax + pad;
  const range = max - min || 1;

  const x = (i: number) => M.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (v: number) => M.top + (1 - (v - min) / range) * plotH;

  const pts = data.map((d, i) => [x(i), y(d.equity)] as const);
  const pathD = `M ${pts.map(([px, py]) => `${px},${py}`).join(" L ")}`;
  const areaD = `M ${pts[0][0]},${M.top + plotH} L ${pts.map(([px, py]) => `${px},${py}`).join(" L ")} L ${pts[pts.length - 1][0]},${M.top + plotH} Z`;

  // 4 recessive gridlines with $ labels
  const ticks = Array.from({ length: 4 }, (_, i) => min + (range * i) / 3);

  // thin the x labels to ~6 max so they never collide
  const step = Math.max(1, Math.ceil(data.length / 6));
  const lastIdx = data.length - 1;

  const last = pts[lastIdx];
  const isUp = data[lastIdx].equity >= data[0].equity;

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const vbX = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((vbX - M.left) / plotW) * (data.length - 1));
    setHover(Math.max(0, Math.min(lastIdx, i)));
  }

  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)" }}>Equity Curve</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: -0.5, color: "#e8eaf0" }}>
            {fmtUsd(data[lastIdx].equity)}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: isUp ? "#22c55e" : "#ef4444" }}>
            {isUp ? "▲" : "▼"} {fmtUsd(Math.abs(data[lastIdx].equity - data[0].equity))}
          </span>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", touchAction: "none", cursor: "crosshair" }}
        onPointerMove={handleMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Equity curve from ${fmtUsd(data[0].equity)} to ${fmtUsd(data[lastIdx].equity)} over ${data.length} days`}
      >
        <defs>
          <linearGradient id="eq-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f8ef7" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* gridlines + y labels (recessive) */}
        {ticks.map((t, i) => {
          const gy = y(t);
          return (
            <g key={i}>
              <line x1={M.left} y1={gy} x2={W - M.right} y2={gy} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
              <text x={M.left - 10} y={gy + 3} textAnchor="end" fontSize={10} fill="rgba(210,220,240,0.4)" fontFamily="var(--font-epilogue), Epilogue, sans-serif">
                {fmtUsd(t)}
              </text>
            </g>
          );
        })}

        {/* x labels (thinned) */}
        {data.map((d, i) => {
          if (i % step !== 0 && i !== lastIdx) return null;
          return (
            <text key={i} x={x(i)} y={H - 10} textAnchor={i === lastIdx ? "end" : i === 0 ? "start" : "middle"} fontSize={9} fill="rgba(210,220,240,0.4)" letterSpacing={0.5}>
              {d.day}
            </text>
          );
        })}

        <path d={areaD} fill="url(#eq-grad)" />
        <path d={pathD} fill="none" stroke="#4f8ef7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* emphasise the current (last) point */}
        <circle cx={last[0]} cy={last[1]} r={5} fill="#4f8ef7" stroke="#08090f" strokeWidth={2} />

        {/* hover crosshair + tooltip */}
        {hover !== null && (() => {
          const [cx, cy] = pts[hover];
          const flip = cx > W - 150;
          const tx = flip ? cx - 128 : cx + 12;
          const ty = Math.max(M.top, Math.min(cy - 24, M.top + plotH - 48));
          return (
            <g pointerEvents="none">
              <line x1={cx} y1={M.top} x2={cx} y2={M.top + plotH} stroke="rgba(79,142,247,0.4)" strokeWidth={1} strokeDasharray="3 3" />
              <circle cx={cx} cy={cy} r={5} fill="#7eb3ff" stroke="#08090f" strokeWidth={2} />
              <rect x={tx} y={ty} width={116} height={46} rx={2} fill="#020305" stroke="rgba(79,142,247,0.3)" strokeWidth={1} />
              <text x={tx + 12} y={ty + 19} fontSize={9} letterSpacing={1} fill="rgba(210,220,240,0.55)">
                {data[hover].day.toUpperCase()}
              </text>
              <text x={tx + 12} y={ty + 36} fontSize={14} fontWeight={700} fill="#e8eaf0" fontFamily="var(--font-syne), Syne, sans-serif">
                {fmtUsd(data[hover].equity)}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
