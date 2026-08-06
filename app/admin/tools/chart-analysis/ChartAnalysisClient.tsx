"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AGENT_BIAS_INSTRUMENTS } from "@/lib/agent-bias/instruments";
import { TIMEFRAME_OPTIONS, type TimeframeValue, type ChartAnalysisRecord, type ChartCaption } from "@/lib/chart-analysis/types";

type ListRecord = Omit<ChartAnalysisRecord, "chart_image"> & { chart_image: null };
type DetailRecord = ChartAnalysisRecord & { chart_image_base64: string | null };

const FOREX = AGENT_BIAS_INSTRUMENTS.filter((i) => i.assetType === "forex");
const CRYPTO = AGENT_BIAS_INSTRUMENTS.filter((i) => i.assetType === "crypto");

const STATUS_COLOR: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#4f8ef7",
  completed: "#22c55e",
  failed: "#ef4444",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function biasColor(bias: string): string {
  if (bias === "bullish") return "#22c55e";
  if (bias === "bearish") return "#ef4444";
  return "#f59e0b";
}

function downloadBlob(data: BlobPart, filename: string, type: string) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function CaptionPanel({ caption }: { caption: ChartCaption }) {
  return (
    <div style={{ fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.8, color: "rgba(210,220,240,0.88)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{
          fontSize: 11, letterSpacing: 1, textTransform: "uppercase", padding: "3px 10px",
          border: `1px solid ${biasColor(caption.overallBias)}55`, color: biasColor(caption.overallBias),
          background: `${biasColor(caption.overallBias)}12`,
        }}>
          {caption.overallBias}
        </span>
        <span style={{ color: "rgba(210,220,240,0.4)", fontSize: 11 }}>confidence: {caption.confidence}%</span>
      </div>

      <div style={{ color: "#4f8ef7", marginBottom: 4 }}>Key Levels</div>
      <div style={{ marginBottom: 12, color: "rgba(210,220,240,0.75)" }}>
        <div>Resistance: {caption.keyLevels?.resistance?.join(", ") || "—"}</div>
        <div>Support: {caption.keyLevels?.support?.join(", ") || "—"}</div>
        {caption.keyLevels?.pivotPoints?.length > 0 && <div>Pivots: {caption.keyLevels.pivotPoints.join(", ")}</div>}
      </div>

      {Object.entries(caption.timeframeAnalysis || {}).map(([tf, a]) => (
        <div key={tf} style={{ marginBottom: 12 }}>
          <div style={{ color: "#c084fc" }}>{tf} — {a.trend} / {a.bias}</div>
          <ul style={{ margin: "4px 0 4px 18px", padding: 0 }}>
            {a.keyObservations?.map((o, i) => <li key={i} style={{ color: "rgba(210,220,240,0.7)" }}>{o}</li>)}
          </ul>
          <div style={{ color: "rgba(210,220,240,0.4)", fontSize: 11 }}>
            EMA: {a.indicatorSignals?.ema} · RSI: {a.indicatorSignals?.rsi} · MACD: {a.indicatorSignals?.macd} · Vol: {a.indicatorSignals?.volume}
          </div>
        </div>
      ))}

      <div style={{ color: "#f59e0b", marginBottom: 4 }}>Trade Levels</div>
      <div style={{ marginBottom: 12, color: "rgba(210,220,240,0.75)" }}>
        Entry: {caption.riskReward?.entry} · SL: <span style={{ color: "#ef4444" }}>{caption.riskReward?.stopLoss}</span> · TP: <span style={{ color: "#22c55e" }}>{caption.riskReward?.takeProfit?.join(", ")}</span> · R:R {caption.riskReward?.ratio}
      </div>

      <div style={{ color: "#4f8ef7", marginBottom: 4 }}>Reasoning</div>
      <div style={{ marginBottom: 12, color: "rgba(210,220,240,0.75)", whiteSpace: "pre-wrap" }}>{caption.reasoning}</div>

      {caption.hashtags?.length > 0 && (
        <div style={{ color: "rgba(79,142,247,0.6)", marginBottom: 12 }}>{caption.hashtags.map((h) => `#${h}`).join(" ")}</div>
      )}

      <div style={{ color: "rgba(210,220,240,0.25)", fontSize: 10.5 }}>{caption.disclaimer}</div>
    </div>
  );
}

function DetailModal({ id, onClose, onDeleted }: { id: string; onClose: () => void; onDeleted: (id: string) => void }) {
  const [record, setRecord] = useState<DetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/chart-analysis/${id}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) { setRecord(data); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message ?? "failed to load"); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id]);

  const imageUrl = record?.chart_image_base64 ? `data:image/png;base64,${record.chart_image_base64}` : null;

  const handleDelete = useCallback(async () => {
    if (!confirm("Delete this chart analysis? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/chart-analysis/${id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted(id);
        onClose();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "delete failed");
        setDeleting(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "delete failed");
      setDeleting(false);
    }
  }, [id, onClose, onDeleted]);

  const handleDownloadPng = useCallback(() => {
    if (!record?.chart_image_base64) return;
    const bytes = base64ToUint8Array(record.chart_image_base64);
    downloadBlob(bytes.buffer as ArrayBuffer, `${record.display_pair.replace("/", "")}-${record.id.slice(0, 8)}.png`, "image/png");
  }, [record]);

  const handleDownloadJson = useCallback(() => {
    if (!record) return;
    downloadBlob(JSON.stringify(record.caption_json, null, 2), `${record.display_pair.replace("/", "")}-${record.id.slice(0, 8)}.json`, "application/json");
  }, [record]);

  const handleCopyCaption = useCallback(() => {
    if (!record) return;
    navigator.clipboard.writeText(JSON.stringify(record.caption_json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [record]);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(2,3,5,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.08)", borderLeft: "2px solid #4f8ef7", maxWidth: 1000, width: "100%", maxHeight: "88vh", overflowY: "auto" }}
      >
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "monospace", fontSize: 13, color: "#4f8ef7" }}>{record?.display_pair ?? "Loading..."}</span>
          {record && (
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.35)" }}>
              {record.timeframes.join(" · ")} · {timeAgo(record.created_at)}
            </span>
          )}
          <button
            onClick={onClose}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(210,220,240,0.4)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {loading && <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(79,142,247,0.6)" }}>loading...</div>}
          {error && <div style={{ fontFamily: "monospace", fontSize: 12, color: "#ef4444" }}>error: {error}</div>}

          {record && !loading && (
            <>
              {imageUrl ? (
                <img src={imageUrl} alt={`${record.display_pair} chart`} style={{ width: "100%", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20 }} />
              ) : (
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(210,220,240,0.3)", padding: 20, textAlign: "center", border: "1px dashed rgba(255,255,255,0.08)", marginBottom: 20 }}>
                  no image {record.status === "failed" ? `— job failed: ${record.metadata?.error ?? "unknown error"}` : `(status: ${record.status})`}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                <button onClick={handleDownloadPng} disabled={!record.chart_image_base64} style={btnStyle("#4f8ef7")}>↓ download PNG</button>
                <button onClick={handleDownloadJson} style={btnStyle("#4f8ef7")}>↓ download caption JSON</button>
                <button onClick={handleCopyCaption} style={btnStyle(copied ? "#22c55e" : "rgba(210,220,240,0.4)")}>{copied ? "✓ copied" : "copy caption"}</button>
                <button onClick={handleDelete} disabled={deleting} style={{ ...btnStyle("#ef4444"), marginLeft: "auto" }}>
                  {deleting ? "deleting..." : "delete"}
                </button>
              </div>

              {record.caption_json?.overallBias ? (
                <CaptionPanel caption={record.caption_json} />
              ) : (
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(210,220,240,0.3)" }}>no caption available</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function btnStyle(color: string): React.CSSProperties {
  return {
    fontFamily: "monospace", fontSize: 11, letterSpacing: 0.5,
    padding: "7px 14px", border: `1px solid ${color}55`, background: `${color}12`,
    color, cursor: "pointer",
  };
}

export default function ChartAnalysisClient() {
  const [instrument, setInstrument] = useState(FOREX[0]?.yahoo ?? "");
  const [timeframes, setTimeframes] = useState<TimeframeValue[]>(["1D"]);
  const [submitting, setSubmitting] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<ListRecord | DetailRecord | null>(null);
  const [error, setError] = useState("");

  const [gallery, setGallery] = useState<ListRecord[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadGallery = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chart-analysis?limit=24");
      if (res.ok) {
        const data = await res.json();
        setGallery(data.analyses ?? []);
      }
    } catch {
      // silent — gallery is best-effort
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const toggleTimeframe = useCallback((tf: TimeframeValue) => {
    setTimeframes((prev) => {
      if (prev.includes(tf)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter((t) => t !== tf);
      }
      return [...prev, tf];
    });
  }, []);

  const pollJob = useCallback((jobId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/chart-analysis/${jobId}`);
        if (!res.ok) return;
        const data: DetailRecord = await res.json();
        setActiveJob(data);
        if (data.status === "completed" || data.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setSubmitting(false);
          loadGallery();
        }
      } catch {
        // keep polling — transient network error
      }
    }, 3000);
  }, [loadGallery]);

  const generate = useCallback(async () => {
    setSubmitting(true);
    setError("");
    setActiveJob(null);
    try {
      const res = await fetch("/api/admin/chart-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instrument, timeframes }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to start analysis");
        setSubmitting(false);
        return;
      }
      const body = await res.json();
      setActiveJobId(body.jobId);
      pollJob(body.jobId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setSubmitting(false);
    }
  }, [instrument, timeframes, pollJob]);

  const selectedInstrument = AGENT_BIAS_INSTRUMENTS.find((i) => i.yahoo === instrument);
  const commandPreview = `chart-analysis --instrument "${selectedInstrument?.display ?? instrument}" --timeframes ${timeframes.join(",")}`;

  return (
    <div style={{ padding: "40px 48px 80px", maxWidth: 1200 }}>
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
        .chart-select {
          font-family: monospace; font-size: 12px; padding: 8px 12px;
          background: #08090f; color: rgba(210,220,240,0.85);
          border: 1px solid rgba(255,255,255,0.1); min-width: 220px;
        }
        .gallery-card { transition: border-color 0.15s, transform 0.15s; cursor: pointer; }
        .gallery-card:hover { border-color: rgba(79,142,247,0.4) !important; transform: translateY(-2px); }
      `}</style>

      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Admin / Tools</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, marginBottom: 8 }}>Chart Analysis</h1>
      <p style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(210,220,240,0.4)", marginBottom: 40 }}>
        TradingView automation · EMA 20/50/200 · RSI · MACD · Volume — LLM vision analysis via OpenRouter, one instrument at a time
      </p>

      {/* Config panel */}
      <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "2px solid #4f8ef7", marginBottom: 2 }}>
        <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <span style={{ color: "rgba(79,142,247,0.5)", fontSize: 11, userSelect: "none", fontFamily: "monospace" }}>$&gt;</span>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(210,220,240,0.4)" }}>{commandPreview}</span>
          {submitting && (
            <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 10, color: "#4f8ef7", animation: "pulse-dot 1.2s ease-in-out infinite" }}>
              ● running
            </span>
          )}
        </div>

        <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Instrument */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5, color: "rgba(210,220,240,0.28)", width: 90, textTransform: "uppercase" }}>{"// instrument"}</span>
            <select className="chart-select" value={instrument} onChange={(e) => setInstrument(e.target.value)} disabled={submitting}>
              <optgroup label="Forex">
                {FOREX.map((i) => <option key={i.yahoo} value={i.yahoo}>{i.display}</option>)}
              </optgroup>
              <optgroup label="Crypto">
                {CRYPTO.map((i) => <option key={i.yahoo} value={i.yahoo}>{i.display}</option>)}
              </optgroup>
            </select>
          </div>

          {/* Timeframes */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5, color: "rgba(210,220,240,0.28)", width: 90, textTransform: "uppercase" }}>{"// timeframes"}</span>
            <div style={{ display: "flex", gap: 1 }}>
              {TIMEFRAME_OPTIONS.map((tf) => (
                <button
                  key={tf.value}
                  className={`param-btn${timeframes.includes(tf.value) ? " active-blue" : ""}`}
                  onClick={() => toggleTimeframe(tf.value)}
                  disabled={submitting}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Run button */}
      <button
        onClick={generate}
        disabled={submitting || !instrument}
        style={{
          width: "100%", fontFamily: "monospace", fontSize: 12, letterSpacing: 1.5,
          padding: "14px 24px",
          border: submitting ? "1px solid rgba(79,142,247,0.3)" : "1px solid rgba(79,142,247,0.4)",
          borderTop: "none",
          background: submitting ? "rgba(79,142,247,0.03)" : "rgba(79,142,247,0.06)",
          color: submitting ? "rgba(79,142,247,0.6)" : "#4f8ef7",
          cursor: submitting ? "not-allowed" : "pointer",
          textAlign: "left",
          transition: "all 0.2s",
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 24,
        }}
      >
        <span style={{ opacity: 0.5 }}>$&gt;</span>
        {submitting ? "● GENERATING ANALYSIS..." : "▶ GENERATE ANALYSIS"}
        {submitting && (
          <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.6 }}>
            {activeJob?.status === "processing" ? "navigating TradingView → applying indicators → capturing → analyzing" : "queued..."}
          </span>
        )}
      </button>

      {error && (
        <div style={{
          fontFamily: "monospace", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.25)",
          borderLeft: "2px solid #ef4444", padding: "10px 16px", marginBottom: 24, fontSize: 12, color: "#ef4444",
        }}>
          <span style={{ opacity: 0.5 }}>$&gt; </span>ERROR: {error}
        </div>
      )}

      {/* Active job result */}
      {activeJobId && activeJob && (
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `2px solid ${STATUS_COLOR[activeJob.status]}55`, marginBottom: 40 }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: STATUS_COLOR[activeJob.status], fontSize: 10, fontFamily: "monospace" }}>● {activeJob.status}</span>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.3)" }}>{activeJob.display_pair}</span>
            {activeJob.status === "completed" && (
              <button onClick={() => setSelectedId(activeJob.id)} style={{ ...btnStyle("#4f8ef7"), marginLeft: "auto" }}>
                view full result →
              </button>
            )}
          </div>
          <div style={{ padding: "20px 24px" }}>
            {activeJob.status === "failed" && (
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "#ef4444" }}>
                Job failed: {activeJob.metadata?.error ?? "unknown error"}
              </div>
            )}
            {(activeJob.status === "pending" || activeJob.status === "processing") && (
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "#4f8ef7" }}>
                <span style={{ animation: "pulse-dot 1.2s ease-in-out infinite", display: "inline-block" }}>●</span>{" "}
                running Playwright automation against TradingView, applying indicators, and analyzing with LLM vision...
              </div>
            )}
            {activeJob.status === "completed" && "caption_json" in activeJob && activeJob.caption_json?.overallBias && (
              <CaptionPanel caption={activeJob.caption_json} />
            )}
          </div>
        </div>
      )}

      {/* Gallery */}
      <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(210,220,240,0.3)", marginBottom: 12 }}>
        Recent Analyses
      </div>
      {galleryLoading ? (
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(210,220,240,0.3)" }}>loading...</div>
      ) : gallery.length === 0 ? (
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.04)", padding: "32px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(210,220,240,0.2)" }}>
            {"// no analyses yet — generate your first one above"}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {gallery.map((rec) => (
            <div
              key={rec.id}
              className="gallery-card"
              onClick={() => setSelectedId(rec.id)}
              style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.07)", padding: "14px 16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLOR[rec.status], display: "inline-block" }} />
                <span style={{ fontFamily: "monospace", fontSize: 13, color: "rgba(210,220,240,0.9)" }}>{rec.display_pair}</span>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.35)", marginBottom: 4 }}>
                {rec.timeframes.join(" · ")}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.25)" }}>
                {rec.status} · {timeAgo(rec.created_at)}
              </div>
              {rec.status === "completed" && rec.caption_json?.overallBias && (
                <div style={{
                  marginTop: 8, display: "inline-block", fontSize: 10, fontFamily: "monospace",
                  padding: "2px 8px", border: `1px solid ${biasColor(rec.caption_json.overallBias)}44`,
                  color: biasColor(rec.caption_json.overallBias), background: `${biasColor(rec.caption_json.overallBias)}0d`,
                }}>
                  {rec.caption_json.overallBias}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <DetailModal
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onDeleted={(id) => setGallery((prev) => prev.filter((r) => r.id !== id))}
        />
      )}
    </div>
  );
}
