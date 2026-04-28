"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const FOREX = [
  { label: "EUR/USD", symbol: "FX:EURUSD" },
  { label: "GBP/USD", symbol: "FX:GBPUSD" },
  { label: "USD/JPY", symbol: "FX:USDJPY" },
  { label: "AUD/USD", symbol: "FX:AUDUSD" },
  { label: "GBP/JPY", symbol: "FX:GBPJPY" },
  { label: "USD/CAD", symbol: "FX:USDCAD" },
];

const CRYPTO = [
  { label: "BTC/USDT", symbol: "BINANCE:BTCUSDT" },
  { label: "ETH/USDT", symbol: "BINANCE:ETHUSDT" },
  { label: "SOL/USDT", symbol: "BINANCE:SOLUSDT" },
  { label: "XRP/USDT", symbol: "BINANCE:XRPUSDT" },
];

const INTERVALS = [
  { label: "1m", value: "1" },
  { label: "5m", value: "5" },
  { label: "15m", value: "15" },
  { label: "1H", value: "60" },
  { label: "4H", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
];

const SIZES = [
  { label: "S", value: 400 },
  { label: "M", value: 600 },
  { label: "L", value: 800 },
  { label: "XL", value: 1000 },
  { label: "XXL", value: 1200 },
];

function TradingViewChart({
  symbol,
  interval,
  height,
}: {
  symbol: string;
  interval: string;
  height: number | string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });
    containerRef.current.appendChild(script);
  }, [symbol, interval]);

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      style={{ width: "100%", height }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

type PostStatus = "idle" | "loading" | "success" | "error";

export default function ChartClient() {
  const [symbol, setSymbol] = useState("FX:EURUSD");
  const [interval, setInterval] = useState("D");
  const [customSymbol, setCustomSymbol] = useState("");
  const [chartHeight, setChartHeight] = useState(800);
  const [fullscreen, setFullscreen] = useState(false);

  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  const [caption, setCaption] = useState("");
  const [igStatus, setIgStatus] = useState<PostStatus>("idle");
  const [igMsg, setIgMsg] = useState("");
  const [tgStatus, setTgStatus] = useState<PostStatus>("idle");
  const [tgMsg, setTgMsg] = useState("");

  const activeSymbol = customSymbol.trim()
    ? customSymbol.trim().toUpperCase()
    : symbol;

  // ESC exits fullscreen
  const exitFullscreen = useCallback(() => setFullscreen(false), []);
  useEffect(() => {
    if (!fullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitFullscreen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreen, exitFullscreen]);

  const takeSnapshot = async () => {
    setSnapshotLoading(true);
    setSnapshotError(null);
    setSnapshotUrl(null);
    setIgStatus("idle");
    setTgStatus("idle");
    setIgMsg("");
    setTgMsg("");
    try {
      const res = await fetch("/api/admin/chart-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: activeSymbol, interval }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Screenshot failed");
      setSnapshotUrl(data.url);
    } catch (err: unknown) {
      setSnapshotError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSnapshotLoading(false);
    }
  };

  const postToInstagram = async () => {
    if (!snapshotUrl) return;
    setIgStatus("loading");
    setIgMsg("");
    try {
      const res = await fetch("/api/admin/post-instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: snapshotUrl, caption }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Post failed");
      setIgStatus("success");
      setIgMsg(data.postId ? `Post ID: ${data.postId}` : "Posted successfully");
    } catch (err: unknown) {
      setIgStatus("error");
      setIgMsg(err instanceof Error ? err.message : "Failed");
    }
  };

  const postToTelegram = async () => {
    if (!snapshotUrl) return;
    setTgStatus("loading");
    setTgMsg("");
    try {
      const res = await fetch("/api/admin/post-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: snapshotUrl, caption }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Post failed");
      setTgStatus("success");
      setTgMsg(
        data.messageId ? `Message ID: ${data.messageId}` : "Sent successfully"
      );
    } catch (err: unknown) {
      setTgStatus("error");
      setTgMsg(err instanceof Error ? err.message : "Failed");
    }
  };

  const chip = (active: boolean): React.CSSProperties => ({
    padding: "5px 12px",
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "monospace",
    background: active ? "#4f8ef7" : "#08090f",
    color: active ? "#fff" : "rgba(210,220,240,0.7)",
    border: `1px solid ${active ? "#4f8ef7" : "rgba(255,255,255,0.08)"}`,
    cursor: "pointer",
    transition: "all 0.15s",
  });

  const statusColor = (s: PostStatus) =>
    s === "success" ? "#22c55e" : s === "error" ? "#ef4444" : "#4f8ef7";

  // Shared controls used in both normal and fullscreen views
  const Controls = ({ compact = false }: { compact?: boolean }) => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        gap: compact ? 16 : 24,
      }}
    >
      {/* Forex */}
      <div>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.3)", marginBottom: compact ? 4 : 8 }}>Forex</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {FOREX.map((p) => (
            <button
              key={p.symbol}
              style={chip(symbol === p.symbol && !customSymbol.trim())}
              onClick={() => { setSymbol(p.symbol); setCustomSymbol(""); setSnapshotUrl(null); }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Crypto */}
      <div>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.3)", marginBottom: compact ? 4 : 8 }}>Crypto</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {CRYPTO.map((p) => (
            <button
              key={p.symbol}
              style={chip(symbol === p.symbol && !customSymbol.trim())}
              onClick={() => { setSymbol(p.symbol); setCustomSymbol(""); setSnapshotUrl(null); }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom */}
      <div>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.3)", marginBottom: compact ? 4 : 8 }}>Custom</div>
        <input
          type="text"
          placeholder="e.g. NASDAQ:TSLA"
          value={customSymbol}
          onChange={(e) => { setCustomSymbol(e.target.value); setSnapshotUrl(null); }}
          style={{
            background: "#08090f",
            border: `1px solid ${customSymbol.trim() ? "#4f8ef7" : "rgba(255,255,255,0.08)"}`,
            color: "#e8eaf0", padding: "5px 10px", fontSize: 11,
            fontFamily: "monospace", letterSpacing: 1, outline: "none", width: 150,
          }}
        />
      </div>

      {/* Interval */}
      <div>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.3)", marginBottom: compact ? 4 : 8 }}>Interval</div>
        <div style={{ display: "flex", gap: 4 }}>
          {INTERVALS.map((iv) => (
            <button
              key={iv.value}
              style={chip(interval === iv.value)}
              onClick={() => { setInterval(iv.value); setSnapshotUrl(null); }}
            >
              {iv.label}
            </button>
          ))}
        </div>
      </div>

      {/* Height (normal view only) */}
      {!compact && (
        <div>
          <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.3)", marginBottom: 8 }}>Height</div>
          <div style={{ display: "flex", gap: 4 }}>
            {SIZES.map((s) => (
              <button
                key={s.value}
                style={chip(chartHeight === s.value)}
                onClick={() => setChartHeight(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── FULLSCREEN MODE ──────────────────────────────────────────────────────
  if (fullscreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "#020305",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Fullscreen top bar */}
        <div
          style={{
            flexShrink: 0,
            background: "#08090f",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "12px 20px",
            display: "flex",
            alignItems: "flex-end",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <Controls compact />

          {/* Symbol label */}
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "rgba(210,220,240,0.25)",
              letterSpacing: 1,
              alignSelf: "center",
            }}
          >
            {activeSymbol} · {interval}
          </span>

          {/* Snapshot + Exit */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={takeSnapshot}
              disabled={snapshotLoading}
              style={{
                background: snapshotLoading ? "rgba(79,142,247,0.1)" : "rgba(79,142,247,0.15)",
                color: "#4f8ef7",
                border: "1px solid rgba(79,142,247,0.4)",
                padding: "6px 14px",
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "monospace",
                cursor: snapshotLoading ? "not-allowed" : "pointer",
              }}
            >
              {snapshotLoading ? "Capturing…" : "Snapshot"}
            </button>
            <button
              onClick={exitFullscreen}
              title="Exit fullscreen (Esc)"
              style={{
                background: "rgba(239,68,68,0.08)",
                color: "rgba(239,68,68,0.7)",
                border: "1px solid rgba(239,68,68,0.2)",
                padding: "6px 14px",
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "monospace",
                cursor: "pointer",
              }}
            >
              ✕ Exit
            </button>
          </div>
        </div>

        {/* Chart fills remaining space */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <TradingViewChart
            key={`${activeSymbol}-${interval}-fs`}
            symbol={activeSymbol}
            interval={interval}
            height="100%"
          />
        </div>

        {/* Fullscreen snapshot result bar */}
        {(snapshotUrl || snapshotError) && (
          <div
            style={{
              flexShrink: 0,
              background: "#08090f",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {snapshotError && (
              <span style={{ fontFamily: "monospace", fontSize: 10, color: "#ef4444" }}>
                ✕ {snapshotError}
              </span>
            )}
            {snapshotUrl && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={snapshotUrl}
                  alt="Snapshot"
                  style={{ height: 48, border: "1px solid rgba(255,255,255,0.1)", display: "block" }}
                />
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Caption…"
                  rows={1}
                  style={{
                    flex: 1, minWidth: 200,
                    background: "#020305", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#e8eaf0", padding: "6px 10px", fontSize: 11,
                    fontFamily: "monospace", resize: "none", outline: "none",
                  }}
                />
                <button
                  onClick={postToInstagram}
                  disabled={igStatus === "loading" || igStatus === "success"}
                  style={{
                    background: igStatus === "success" ? "rgba(34,197,94,0.1)" : igStatus === "error" ? "rgba(239,68,68,0.1)" : "#08090f",
                    color: igStatus === "success" ? "#22c55e" : igStatus === "error" ? "#ef4444" : "rgba(210,220,240,0.88)",
                    border: `1px solid ${statusColor(igStatus)}`,
                    padding: "6px 14px", fontSize: 9, letterSpacing: 1.5,
                    textTransform: "uppercase", fontFamily: "monospace", cursor: "pointer",
                  }}
                >
                  {igStatus === "success" ? "✓ Instagram" : igStatus === "error" ? "✕ Instagram" : "Instagram"}
                </button>
                <button
                  onClick={postToTelegram}
                  disabled={tgStatus === "loading" || tgStatus === "success"}
                  style={{
                    background: tgStatus === "success" ? "rgba(34,197,94,0.1)" : tgStatus === "error" ? "rgba(239,68,68,0.1)" : "#08090f",
                    color: tgStatus === "success" ? "#22c55e" : tgStatus === "error" ? "#ef4444" : "rgba(210,220,240,0.88)",
                    border: `1px solid ${statusColor(tgStatus)}`,
                    padding: "6px 14px", fontSize: 9, letterSpacing: 1.5,
                    textTransform: "uppercase", fontFamily: "monospace", cursor: "pointer",
                  }}
                >
                  {tgStatus === "success" ? "✓ Telegram" : tgStatus === "error" ? "✕ Telegram" : "Telegram"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── NORMAL MODE ──────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "40px 48px 80px" }}>
      {/* Header */}
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>
        Tools
      </div>
      <h1
        style={{
          fontFamily: "var(--font-syne), Syne, sans-serif",
          fontWeight: 800,
          fontSize: 36,
          letterSpacing: -1.5,
          marginBottom: 32,
        }}
      >
        Chart Tool
      </h1>

      {/* Controls */}
      <div style={{ marginBottom: 16 }}>
        <Controls />
      </div>

      {/* Chart label + fullscreen button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          // bleed into page right padding so this row matches chart width
          marginRight: -48,
        }}
      >
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.3)", letterSpacing: 1 }}>
          {`// displaying: ${activeSymbol} · ${interval}`}
        </div>
        <button
          onClick={() => setFullscreen(true)}
          title="Fullscreen (Esc to exit)"
          style={{
            background: "rgba(79,142,247,0.08)",
            color: "rgba(79,142,247,0.7)",
            border: "1px solid rgba(79,142,247,0.2)",
            padding: "4px 12px",
            fontSize: 9,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontFamily: "monospace",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          ⛶ Fullscreen
        </button>
      </div>

      {/* Chart — bleeds into right page padding for more width */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.06)",
          background: "#08090f",
          marginRight: -48,
        }}
      >
        <TradingViewChart
          key={`${activeSymbol}-${interval}`}
          symbol={activeSymbol}
          interval={interval}
          height={chartHeight}
        />
      </div>

      {/* Snapshot + publish bar */}
      <div
        style={{
          background: "#08090f",
          border: "1px solid rgba(255,255,255,0.06)",
          borderTop: "none",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginRight: -48,
        }}
      >
        {/* Snapshot button row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <button
            onClick={takeSnapshot}
            disabled={snapshotLoading}
            style={{
              background: snapshotLoading ? "rgba(79,142,247,0.15)" : "#4f8ef7",
              color: snapshotLoading ? "#4f8ef7" : "#fff",
              border: "1px solid #4f8ef7",
              padding: "8px 20px",
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "monospace",
              cursor: snapshotLoading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {snapshotLoading ? "Taking Snapshot…" : "Take Snapshot"}
          </button>

          {snapshotLoading && (
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(210,220,240,0.4)", letterSpacing: 1 }}>
              Loading chart headlessly — this takes ~10–20s on first run
            </span>
          )}
          {snapshotError && (
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "#ef4444", letterSpacing: 1 }}>
              ✕ {snapshotError}
            </span>
          )}
        </div>

        {/* Preview + post controls */}
        {snapshotUrl && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Thumbnail */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.3)", marginBottom: 8 }}>
                Snapshot Preview
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={snapshotUrl}
                alt="Chart snapshot"
                style={{ width: 320, height: 180, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)", display: "block" }}
              />
              <a
                href={snapshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-block", marginTop: 6, fontFamily: "monospace", fontSize: 9, letterSpacing: 1, color: "rgba(79,142,247,0.7)", textDecoration: "none" }}
              >
                Open full size ↗
              </a>
            </div>

            {/* Caption + post buttons */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.3)", marginBottom: 8 }}>
                Caption (optional)
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={`${activeSymbol} — ${interval} chart\n\n#forex #trading #eleusis`}
                rows={4}
                style={{
                  width: "100%",
                  background: "#020305",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e8eaf0",
                  padding: "10px 12px",
                  fontSize: 11,
                  fontFamily: "monospace",
                  letterSpacing: 0.5,
                  lineHeight: 1.7,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                {/* Instagram */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button
                    onClick={postToInstagram}
                    disabled={igStatus === "loading" || igStatus === "success"}
                    style={{
                      background: igStatus === "success" ? "rgba(34,197,94,0.1)" : igStatus === "error" ? "rgba(239,68,68,0.1)" : igStatus === "loading" ? "rgba(79,142,247,0.08)" : "#08090f",
                      color: igStatus === "success" ? "#22c55e" : igStatus === "error" ? "#ef4444" : "rgba(210,220,240,0.88)",
                      border: `1px solid ${statusColor(igStatus)}`,
                      padding: "7px 16px", fontSize: 10, letterSpacing: 1.5,
                      textTransform: "uppercase", fontFamily: "monospace",
                      cursor: igStatus === "loading" || igStatus === "success" ? "not-allowed" : "pointer",
                      transition: "all 0.15s", minWidth: 160,
                    }}
                  >
                    {igStatus === "loading" ? "Posting…" : igStatus === "success" ? "✓ Posted to Instagram" : igStatus === "error" ? "✕ Instagram Failed" : "Post to Instagram"}
                  </button>
                  {igMsg && (
                    <span style={{ fontFamily: "monospace", fontSize: 9, color: igStatus === "success" ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.7)", letterSpacing: 0.5 }}>
                      {igMsg}
                    </span>
                  )}
                </div>

                {/* Telegram */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button
                    onClick={postToTelegram}
                    disabled={tgStatus === "loading" || tgStatus === "success"}
                    style={{
                      background: tgStatus === "success" ? "rgba(34,197,94,0.1)" : tgStatus === "error" ? "rgba(239,68,68,0.1)" : tgStatus === "loading" ? "rgba(79,142,247,0.08)" : "#08090f",
                      color: tgStatus === "success" ? "#22c55e" : tgStatus === "error" ? "#ef4444" : "rgba(210,220,240,0.88)",
                      border: `1px solid ${statusColor(tgStatus)}`,
                      padding: "7px 16px", fontSize: 10, letterSpacing: 1.5,
                      textTransform: "uppercase", fontFamily: "monospace",
                      cursor: tgStatus === "loading" || tgStatus === "success" ? "not-allowed" : "pointer",
                      transition: "all 0.15s", minWidth: 160,
                    }}
                  >
                    {tgStatus === "loading" ? "Sending…" : tgStatus === "success" ? "✓ Sent to Telegram" : tgStatus === "error" ? "✕ Telegram Failed" : "Post to Telegram"}
                  </button>
                  {tgMsg && (
                    <span style={{ fontFamily: "monospace", fontSize: 9, color: tgStatus === "success" ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.7)", letterSpacing: 0.5 }}>
                      {tgMsg}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
