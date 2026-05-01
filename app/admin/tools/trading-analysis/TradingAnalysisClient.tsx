"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Session = "London" | "New York" | "Asian" | "Overlap";
type Focus = "all" | "forex" | "crypto";
type NewsLevel = "none" | "light" | "major";

const SESSION_OPTS: Session[] = ["London", "New York", "Asian", "Overlap"];
const FOCUS_OPTS: { label: string; value: Focus }[] = [
  { label: "All Markets", value: "all" },
  { label: "Forex Only", value: "forex" },
  { label: "Crypto Only", value: "crypto" },
];
const NEWS_OPTS: { label: string; value: NewsLevel; color: string }[] = [
  { label: "No Major News", value: "none", color: "#22c55e" },
  { label: "Light News", value: "light", color: "#f59e0b" },
  { label: "Major News Due", value: "major", color: "#ef4444" },
];

function coloriseLine(line: string): { html: string; color: string } {
  const trimmed = line.trim();

  if (trimmed.startsWith("### ELEUSIS FX") || trimmed.startsWith("### INSTAGRAM")) {
    return { html: line.replace(/\*\*/g, ""), color: "#4f8ef7" };
  }
  if (/BUY\s*SIGNAL/.test(trimmed)) {
    return { html: line.replace(/####\s*/, "").replace(/\*\*/g, ""), color: "#22c55e" };
  }
  if (/SELL\s*SIGNAL/.test(trimmed)) {
    return { html: line.replace(/####\s*/, "").replace(/\*\*/g, ""), color: "#ef4444" };
  }
  if (trimmed.startsWith("#### MACRO OVERVIEW") || trimmed.startsWith("#### PAIRS REVIEWED")) {
    return { html: line.replace(/####\s*/, "").replace(/\*\*/g, ""), color: "#4f8ef7" };
  }
  if (trimmed.startsWith("####")) {
    return { html: line.replace(/####\s*/, "").replace(/\*\*/g, ""), color: "#c084fc" };
  }
  if (trimmed.startsWith("###")) {
    return { html: line.replace(/###\s*/, "").replace(/\*\*/g, ""), color: "#4f8ef7" };
  }
  if (trimmed.startsWith("**Trade levels:**") || trimmed === "**Trade levels:**") {
    return { html: "Trade levels:", color: "#f59e0b" };
  }
  if (/^- (Entry|Stop Loss|TP1|TP2):/.test(trimmed)) {
    const isSL = /^- Stop Loss:/.test(trimmed);
    const isTP = /^- TP[12]:/.test(trimmed);
    const col = isSL ? "#ef4444" : isTP ? "#22c55e" : "rgba(210,220,240,0.88)";
    return { html: line.replace(/\*\*/g, ""), color: col };
  }
  if (trimmed.startsWith("**Risk/Reward:**") || trimmed.startsWith("**Invalidation:**")) {
    return { html: line.replace(/\*\*/g, ""), color: "#f59e0b" };
  }
  if (trimmed.startsWith("🎯") || trimmed.startsWith("🛑") || trimmed.startsWith("💰")) {
    const col = trimmed.startsWith("🛑") ? "#ef4444" : trimmed.startsWith("💰") ? "#22c55e" : "rgba(210,220,240,0.88)";
    return { html: line, color: col };
  }
  if (trimmed.startsWith("⚠️")) {
    return { html: line, color: "rgba(210,220,240,0.4)" };
  }
  if (trimmed.startsWith("#")) {
    return { html: line.replace(/#+\s*/, "").replace(/\*\*/g, ""), color: "rgba(210,220,240,0.4)" };
  }
  if (/^\*\*[A-Z]/.test(trimmed)) {
    return { html: line.replace(/\*\*/g, ""), color: "rgba(210,220,240,0.7)" };
  }
  if (trimmed === "---") {
    return { html: "─────────────────────────────────────", color: "rgba(79,142,247,0.15)" };
  }
  if (trimmed.startsWith("- ") && !trimmed.startsWith("- Entry") && !trimmed.startsWith("- Stop") && !trimmed.startsWith("- TP")) {
    return { html: "  · " + trimmed.slice(2).replace(/\*\*/g, ""), color: "rgba(210,220,240,0.75)" };
  }
  return { html: line.replace(/\*\*/g, ""), color: "rgba(210,220,240,0.88)" };
}

function TerminalOutput({ text, running }: { text: string; running: boolean }) {
  const lines = text.split("\n");
  return (
    <div style={{ fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {lines.map((line, i) => {
        const { html, color } = coloriseLine(line);
        return (
          <div key={i} style={{ color, minHeight: "1.8em" }}>
            {html || " "}
          </div>
        );
      })}
      {running && (
        <span style={{ color: "#4f8ef7", animation: "blink 1s step-end infinite" }}>█</span>
      )}
    </div>
  );
}

export default function TradingAnalysisClient() {
  const [session, setSession] = useState<Session>("London");
  const [focus, setFocus] = useState<Focus>("all");
  const [newsLevel, setNewsLevel] = useState<NewsLevel>("none");

  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [ran, setRan] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const runAnalysis = useCallback(async () => {
    if (running) {
      abortRef.current?.abort();
      return;
    }

    setRunning(true);
    setOutput("");
    setError("");
    setRan(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/admin/trading-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session, focus, newsLevel }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        setError(err.error ?? "Analysis failed");
        setRunning(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("Stream unavailable");
        setRunning(false);
        return;
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message ?? "Unknown error");
      }
    } finally {
      setRunning(false);
    }
  }, [session, focus, newsLevel, running]);

  const commandPreview = `trading-analysis --session "${session.toLowerCase().replace(" ", "-")}" --focus ${focus} --news ${newsLevel}`;

  return (
    <div style={{ padding: "40px 48px 80px", maxWidth: 1100 }}>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .param-btn {
          font-family: monospace;
          font-size: 11px;
          padding: 6px 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: #08090f;
          color: rgba(210,220,240,0.45);
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.5px;
        }
        .param-btn:hover { border-color: rgba(79,142,247,0.4); color: rgba(210,220,240,0.8); }
        .param-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .param-btn.active-blue { border-color: #4f8ef7; color: #4f8ef7; background: rgba(79,142,247,0.08); }
        .param-btn.active-green { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,0.08); }
        .param-btn.active-red { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.08); }
        .param-btn.active-amber { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,0.08); }
      `}</style>

      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Admin / Tools</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, marginBottom: 8 }}>Trading Analysis</h1>
      <p style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(210,220,240,0.4)", marginBottom: 40 }}>
        RSI · EMA 50/200 · MACD · ATR — calculated from Yahoo Finance OHLCV · 12 forex pairs + 4 crypto
      </p>

      {/* Config panel */}
      <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "2px solid #4f8ef7", marginBottom: 2 }}>
        <div style={{
          padding: "10px 16px",
          display: "flex", alignItems: "center", gap: 8,
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          <span style={{ color: "rgba(79,142,247,0.5)", fontSize: 11, userSelect: "none", fontFamily: "monospace" }}>$&gt;</span>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(210,220,240,0.4)" }}>{commandPreview}</span>
          {running && (
            <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 10, color: "#4f8ef7", animation: "pulse-dot 1.2s ease-in-out infinite" }}>
              ● running
            </span>
          )}
        </div>

        <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Session */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5, color: "rgba(210,220,240,0.28)", width: 72, textTransform: "uppercase" }}>// session</span>
            <div style={{ display: "flex", gap: 1 }}>
              {SESSION_OPTS.map((s) => (
                <button key={s} className={`param-btn${session === s ? " active-blue" : ""}`} onClick={() => setSession(s)} disabled={running}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Focus */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5, color: "rgba(210,220,240,0.28)", width: 72, textTransform: "uppercase" }}>// focus</span>
            <div style={{ display: "flex", gap: 1 }}>
              {FOCUS_OPTS.map((f) => (
                <button key={f.value} className={`param-btn${focus === f.value ? " active-blue" : ""}`} onClick={() => setFocus(f.value)} disabled={running}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* News */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5, color: "rgba(210,220,240,0.28)", width: 72, textTransform: "uppercase" }}>// news</span>
            <div style={{ display: "flex", gap: 1 }}>
              {NEWS_OPTS.map((n) => {
                const activeClass = newsLevel === n.value
                  ? n.value === "none" ? " active-green" : n.value === "major" ? " active-red" : " active-amber"
                  : "";
                return (
                  <button key={n.value} className={`param-btn${activeClass}`} onClick={() => setNewsLevel(n.value)} disabled={running}>
                    {n.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Run button */}
      <button
        onClick={runAnalysis}
        style={{
          width: "100%",
          fontFamily: "monospace",
          fontSize: 12,
          letterSpacing: 1.5,
          padding: "14px 24px",
          border: running ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(79,142,247,0.4)",
          borderTop: "none",
          background: running ? "rgba(239,68,68,0.05)" : "rgba(79,142,247,0.06)",
          color: running ? "#ef4444" : "#4f8ef7",
          cursor: "pointer",
          textAlign: "left",
          transition: "all 0.2s",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ opacity: 0.5 }}>$&gt;</span>
        {running ? "■ STOP ANALYSIS" : "▶ RUN ANALYSIS"}
        {running && (
          <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.6, animation: "pulse-dot 1.2s ease-in-out infinite" }}>
            ● fetching OHLCV → calculating RSI / EMA / MACD → claude-opus
          </span>
        )}
      </button>

      {/* Error */}
      {error && (
        <div style={{
          fontFamily: "monospace",
          background: "rgba(239,68,68,0.05)",
          border: "1px solid rgba(239,68,68,0.25)",
          borderLeft: "2px solid #ef4444",
          padding: "10px 16px",
          marginBottom: 16,
          fontSize: 12,
          color: "#ef4444",
        }}>
          <span style={{ opacity: 0.5 }}>$&gt; </span>ERROR: {error}
        </div>
      )}

      {/* Output */}
      {(output || running) && (
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "2px solid rgba(79,142,247,0.3)" }}>
          <div style={{
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: "rgba(79,142,247,0.4)", fontSize: 10, fontFamily: "monospace", userSelect: "none" }}>$&gt;</span>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.3)" }}>
              {session.toLowerCase()} session · {focus === "all" ? "all markets" : focus} · news:{newsLevel}
            </span>
            {!running && output && (
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                style={{
                  marginLeft: "auto", fontFamily: "monospace", fontSize: 10,
                  color: "rgba(210,220,240,0.3)", background: "none",
                  border: "1px solid rgba(255,255,255,0.06)", padding: "3px 8px", cursor: "pointer",
                }}
              >
                copy
              </button>
            )}
          </div>
          <div ref={outputRef} style={{ padding: "20px 24px 24px", maxHeight: 700, overflowY: "auto" }}>
            {output ? (
              <TerminalOutput text={output} running={running} />
            ) : (
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(79,142,247,0.6)" }}>
                <span style={{ animation: "pulse-dot 1.2s ease-in-out infinite", display: "inline-block" }}>●</span>
                {" "}fetching OHLCV from Yahoo Finance · calculating RSI · EMA 50/200 · MACD · ATR...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!ran && !running && (
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.04)", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(210,220,240,0.2)", lineHeight: 2 }}>
            <div>// set session + focus + news, then run</div>
            <div style={{ marginTop: 8, color: "rgba(210,220,240,0.12)" }}>
              RSI(14) · EMA50 · EMA200 · MACD(12,26,9) · ATR(14) — Yahoo Finance OHLCV, calculated server-side<br />
              DXY bias derived automatically · min 3-signal confluence · report + instagram captions
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
