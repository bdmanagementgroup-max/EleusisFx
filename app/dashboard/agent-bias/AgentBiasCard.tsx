"use client";

import { useState } from "react";

export interface PublishedBiasRow {
  id: string;
  run_date: string;
  display_pair: string;
  rating: string;
  executive_summary: string;
  bull_case: string | null;
  bear_case: string | null;
}

const RATING_COLOR: Record<string, string> = {
  Buy: "#22c55e",
  Overweight: "#22c55e",
  Hold: "rgba(210,220,240,0.58)",
  Underweight: "#ef4444",
  Sell: "#ef4444",
};

export default function AgentBiasCard({ row }: { row: PublishedBiasRow }) {
  const [open, setOpen] = useState(false);
  const color = RATING_COLOR[row.rating] ?? "rgba(210,220,240,0.58)";

  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#e8eaf0" }}>
          {row.display_pair}
        </div>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color, background: `${color}1a`, padding: "5px 10px", borderRadius: 2 }}>
          {row.rating}
        </div>
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(210,220,240,0.88)" }}>{row.executive_summary}</p>

      {(row.bull_case || row.bear_case) && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{ marginTop: 12, background: "transparent", border: "none", color: "#4f8ef7", cursor: "pointer", fontSize: 12, padding: 0 }}
          >
            {open ? "Hide reasoning" : "Why?"}
          </button>
          {open && (
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {row.bull_case && (
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(210,220,240,0.7)" }}>
                  <span style={{ color: "#22c55e", fontWeight: 600 }}>Bull: </span>{row.bull_case}
                </p>
              )}
              {row.bear_case && (
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(210,220,240,0.7)" }}>
                  <span style={{ color: "#ef4444", fontWeight: 600 }}>Bear: </span>{row.bear_case}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
