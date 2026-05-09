"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Review {
  id: string;
  created_at: string;
  content: string;
  signals_reviewed: number;
  won: number;
  lost: number;
  pending: number;
  skipped: number;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    + " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function coloriseLine(line: string): { html: string; color: string } {
  const t = line.trim();

  if (t.startsWith("### ELEUSIS FX")) return { html: t.replace(/###\s*/, "").replace(/\*\*/g, ""), color: "#4f8ef7" };
  if (/WON — TP2/.test(t) || /won_tp2/.test(t))  return { html: t.replace(/####\s*/, "").replace(/\*\*/g, ""), color: "#22c55e" };
  if (/WON — TP1/.test(t) || /won_tp1/.test(t))  return { html: t.replace(/####\s*/, "").replace(/\*\*/g, ""), color: "#4ade80" };
  if (/LOST/.test(t) && t.startsWith("####"))      return { html: t.replace(/####\s*/, "").replace(/\*\*/g, ""), color: "#ef4444" };
  if (/PENDING/.test(t) && t.startsWith("####"))   return { html: t.replace(/####\s*/, "").replace(/\*\*/g, ""), color: "#f59e0b" };
  if (/SKIPPED/.test(t) && t.startsWith("####"))   return { html: t.replace(/####\s*/, "").replace(/\*\*/g, ""), color: "rgba(210,220,240,0.35)" };
  if (t.startsWith("####"))   return { html: t.replace(/####\s*/, "").replace(/\*\*/g, ""), color: "#c084fc" };
  if (t.startsWith("###"))    return { html: t.replace(/###\s*/, "").replace(/\*\*/g, ""), color: "#4f8ef7" };
  if (t.startsWith("**Review Date:**") || t.startsWith("**Signals")) {
    return { html: t.replace(/\*\*/g, ""), color: "rgba(210,220,240,0.6)" };
  }
  if (t.startsWith("|")) return { html: t, color: "rgba(210,220,240,0.55)" };
  if (t === "---") return { html: "─────────────────────────────────────", color: "rgba(79,142,247,0.15)" };
  if (t.startsWith("- ")) return { html: "  · " + t.slice(2).replace(/\*\*/g, ""), color: "rgba(210,220,240,0.7)" };
  if (/^\*\*[A-Z]/.test(t)) return { html: t.replace(/\*\*/g, ""), color: "rgba(210,220,240,0.65)" };
  return { html: t.replace(/\*\*/g, ""), color: "rgba(210,220,240,0.85)" };
}

function TerminalOutput({ text, running }: { text: string; running: boolean }) {
  return (
    <div style={{ fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {text.split("\n").map((line, i) => {
        const { html, color } = coloriseLine(line);
        return (
          <div key={i} style={{ color, minHeight: "1.8em" }}>{html || " "}</div>
        );
      })}
      {running && <span style={{ color: "#4f8ef7", animation: "blink 1s step-end infinite" }}>█</span>}
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span style={{
      fontFamily: "monospace", fontSize: 11,
      color, background: `${color}18`,
      border: `1px solid ${color}40`,
      padding: "2px 10px",
    }}>
      {label}: {value}
    </span>
  );
}

export default function TradeReviewClient({ initial, dbError }: { initial: Review[]; dbError?: string }) {
  const [reviews, setReviews] = useState<Review[]>(initial);
  const [selected, setSelected] = useState<Review | null>(initial[0] ?? null);
  const [running, setRunning] = useState(false);
  const [streamOutput, setStreamOutput] = useState("");
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [streamOutput]);

  const runReview = useCallback(async () => {
    if (running) { abortRef.current?.abort(); return; }

    setRunning(true);
    setStreamOutput("");
    setError("");
    setSelected(null);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/admin/trade-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        setError(err.error ?? "Review failed");
        setRunning(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setError("Stream unavailable"); setRunning(false); return; }

      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamOutput(prev => prev + chunk);
      }

      // Fetch updated reviews list after save
      const updated = await fetch("/api/admin/trade-review").then(r => r.json()).catch(() => null);
      if (updated?.reviews?.length) {
        setReviews(updated.reviews);
        setSelected(updated.reviews[0]);
        setStreamOutput("");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError((err as Error).message ?? "Unknown error");
    } finally {
      setRunning(false);
    }
  }, [running]);

  const displayContent = streamOutput || (selected?.content ?? "");
  const displayReview = streamOutput ? null : selected;

  return (
    <div style={{ padding: "40px 48px 80px", maxWidth: 1100 }}>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      {/* Header */}
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Admin / Tools</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, margin: 0 }}>Trade Review</h1>
          <p style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(210,220,240,0.4)", marginTop: 6, marginBottom: 0 }}>
            Evaluates saved signals against Yahoo Finance price data · auto-resolves outcomes · Claude-narrated report
          </p>
        </div>
        <button
          onClick={runReview}
          style={{
            fontFamily: "monospace", fontSize: 12, letterSpacing: 1.5,
            padding: "10px 24px",
            border: running ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(79,142,247,0.4)",
            background: running ? "rgba(239,68,68,0.05)" : "rgba(79,142,247,0.06)",
            color: running ? "#ef4444" : "#4f8ef7",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          }}
        >
          {running ? "■ STOP" : "▶ RUN REVIEW"}
          {running && (
            <span style={{ fontSize: 10, opacity: 0.6, animation: "pulse-dot 1.2s ease-in-out infinite" }}>
              ● fetching prices → evaluating → claude-opus
            </span>
          )}
        </button>
      </div>

      {/* DB error */}
      {dbError && (
        <div style={{ fontFamily: "monospace", fontSize: 12, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.25)", borderLeft: "2px solid #ef4444", padding: "10px 16px", marginBottom: 16, color: "#ef4444" }}>
          <span style={{ opacity: 0.5 }}>$&gt; </span>DB ERROR: {dbError}
          {dbError.includes("does not exist") && (
            <span style={{ color: "rgba(239,68,68,0.7)" }}> — run trade-reviews-migration.sql in Supabase SQL Editor</span>
          )}
        </div>
      )}

      {/* Run error */}
      {error && (
        <div style={{ fontFamily: "monospace", fontSize: 12, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.25)", borderLeft: "2px solid #ef4444", padding: "10px 16px", marginBottom: 16, color: "#ef4444" }}>
          <span style={{ opacity: 0.5 }}>$&gt; </span>ERROR: {error}
        </div>
      )}

      {/* Stats row for selected review */}
      {displayReview && (
        <div style={{ display: "flex", gap: 6, marginBottom: 16, marginTop: 24, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.3)", letterSpacing: 1, marginRight: 6 }}>
            {formatDate(displayReview.created_at)}
          </span>
          <StatBadge label="Reviewed" value={displayReview.signals_reviewed} color="#4f8ef7" />
          <StatBadge label="Won"      value={displayReview.won}              color="#22c55e" />
          <StatBadge label="Lost"     value={displayReview.lost}             color="#ef4444" />
          <StatBadge label="Pending"  value={displayReview.pending}          color="#f59e0b" />
          {displayReview.skipped > 0 && (
            <StatBadge label="Skipped" value={displayReview.skipped} color="rgba(210,220,240,0.35)" />
          )}
          {displayReview.won + displayReview.lost > 0 && (
            <span style={{
              fontFamily: "monospace", fontSize: 11, marginLeft: 8,
              color: (() => {
                const wr = displayReview.won / (displayReview.won + displayReview.lost);
                return wr >= 0.6 ? "#22c55e" : wr >= 0.4 ? "#f59e0b" : "#ef4444";
              })(),
            }}>
              {Math.round(displayReview.won / (displayReview.won + displayReview.lost) * 100)}% WR
            </span>
          )}
        </div>
      )}

      {/* Output panel */}
      {(displayContent || running) && (
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "2px solid rgba(79,142,247,0.3)", marginBottom: 24 }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "rgba(79,142,247,0.4)", fontSize: 10, fontFamily: "monospace" }}>$&gt;</span>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.3)" }}>
              {running ? "generating review..." : `trade review · ${displayReview ? formatDate(displayReview.created_at) : "current"}`}
            </span>
            {!running && displayContent && (
              <button
                onClick={() => navigator.clipboard.writeText(displayContent)}
                style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.3)", background: "none", border: "1px solid rgba(255,255,255,0.06)", padding: "3px 8px", cursor: "pointer" }}
              >
                copy
              </button>
            )}
          </div>
          <div ref={outputRef} style={{ padding: "20px 24px 24px", maxHeight: 700, overflowY: "auto" }}>
            {displayContent
              ? <TerminalOutput text={displayContent} running={running} />
              : <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(79,142,247,0.6)" }}>
                  <span style={{ animation: "pulse-dot 1.2s ease-in-out infinite", display: "inline-block" }}>●</span>
                  {" "}fetching price data · evaluating outcomes · streaming report...
                </div>
            }
          </div>
        </div>
      )}

      {/* Empty state */}
      {!displayContent && !running && reviews.length === 0 && !dbError && (
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.04)", padding: "40px 24px", textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(210,220,240,0.2)", lineHeight: 2 }}>
            <div>{"// no reviews yet — click RUN REVIEW to evaluate saved signals"}</div>
            <div style={{ color: "rgba(210,220,240,0.12)", marginTop: 8 }}>
              Requires signals saved from the Trading Analysis page · fetches Yahoo Finance price data server-side
            </div>
          </div>
        </div>
      )}

      {/* Review history list */}
      {reviews.length > 0 && (
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.25)", marginBottom: 8 }}>
            Review History
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {reviews.map((r) => {
              const isActive = selected?.id === r.id && !streamOutput;
              const wr = r.won + r.lost > 0 ? Math.round(r.won / (r.won + r.lost) * 100) : null;
              return (
                <div
                  key={r.id}
                  onClick={() => { setSelected(r); setStreamOutput(""); setError(""); }}
                  style={{
                    padding: "10px 16px",
                    background: "#08090f",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderLeft: isActive ? "2px solid #4f8ef7" : "2px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    transition: "border-color 0.15s",
                  }}
                >
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: isActive ? "rgba(79,142,247,0.6)" : "rgba(210,220,240,0.3)", userSelect: "none" }}>
                    {isActive ? "▾" : "▸"}
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: isActive ? "rgba(210,220,240,0.85)" : "rgba(210,220,240,0.55)", flex: 1 }}>
                    {formatDate(r.created_at)}
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.35)" }}>
                    {r.signals_reviewed} signals
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#22c55e" }}>W:{r.won}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#ef4444" }}>L:{r.lost}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#f59e0b" }}>P:{r.pending}</span>
                  {wr !== null && (
                    <span style={{
                      fontFamily: "monospace", fontSize: 10,
                      color: wr >= 60 ? "#22c55e" : wr >= 40 ? "#f59e0b" : "#ef4444",
                      background: wr >= 60 ? "rgba(34,197,94,0.08)" : wr >= 40 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
                      border: `1px solid ${wr >= 60 ? "rgba(34,197,94,0.2)" : wr >= 40 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`,
                      padding: "2px 8px",
                    }}>
                      {wr}% WR
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
