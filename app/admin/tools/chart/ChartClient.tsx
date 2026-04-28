"use client";

import { useEffect, useRef, useState } from "react";

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

function TradingViewChart({ symbol, interval, height }: { symbol: string; interval: string; height: number }) {
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

  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  const [caption, setCaption] = useState("");

  const [igStatus, setIgStatus] = useState<PostStatus>("idle");
  const [igMsg, setIgMsg] = useState("");
  const [tgStatus, setTgStatus] = useState<PostStatus>("idle");
  const [tgMsg, setTgMsg] = useState("");

  const activeSymbol = customSymbol.trim() ? customSymbol.trim().toUpperCase() : symbol;

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
      setTgMsg(data.messageId ? `Message ID: ${data.messageId}` : "Sent successfully");
    } catch (err: unknown) {
      setTgStatus("error");
      setTgMsg(err instanceof Error ? err.message : "Failed");
    }
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
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

      {/* Controls row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: 24,
          marginBottom: 16,
        }}
      >
        {/* Forex pairs */}
        <div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(210,220,240,0.3)",
              marginBottom: 8,
            }}
          >
            Forex
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {FOREX.map((p) => (
              <button
                key={p.symbol}
                style={chipStyle(symbol === p.symbol && !customSymbol.trim())}
                onClick={() => {
                  setSymbol(p.symbol);
                  setCustomSymbol("");
                  setSnapshotUrl(null);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Crypto pairs */}
        <div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(210,220,240,0.3)",
              marginBottom: 8,
            }}
          >
            Crypto
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {CRYPTO.map((p) => (
              <button
                key={p.symbol}
                style={chipStyle(symbol === p.symbol && !customSymbol.trim())}
                onClick={() => {
                  setSymbol(p.symbol);
                  setCustomSymbol("");
                  setSnapshotUrl(null);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom symbol */}
        <div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(210,220,240,0.3)",
              marginBottom: 8,
            }}
          >
            Custom
          </div>
          <input
            type="text"
            placeholder="e.g. NASDAQ:TSLA"
            value={customSymbol}
            onChange={(e) => {
              setCustomSymbol(e.target.value);
              setSnapshotUrl(null);
            }}
            style={{
              background: "#08090f",
              border: `1px solid ${customSymbol.trim() ? "#4f8ef7" : "rgba(255,255,255,0.08)"}`,
              color: "#e8eaf0",
              padding: "5px 10px",
              fontSize: 11,
              fontFamily: "monospace",
              letterSpacing: 1,
              outline: "none",
              width: 160,
            }}
          />
        </div>

        {/* Intervals */}
        <div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(210,220,240,0.3)",
              marginBottom: 8,
            }}
          >
            Interval
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {INTERVALS.map((iv) => (
              <button
                key={iv.value}
                style={chipStyle(interval === iv.value)}
                onClick={() => {
                  setInterval(iv.value);
                  setSnapshotUrl(null);
                }}
              >
                {iv.label}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(210,220,240,0.3)",
              marginBottom: 8,
            }}
          >
            Height
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {SIZES.map((s) => (
              <button
                key={s.value}
                style={chipStyle(chartHeight === s.value)}
                onClick={() => setChartHeight(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active symbol label */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "rgba(210,220,240,0.3)",
          marginBottom: 12,
          letterSpacing: 1,
        }}
      >
        {`// displaying: ${activeSymbol} · ${interval}`}
      </div>

      {/* Chart */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.06)",
          background: "#08090f",
          marginBottom: 0,
        }}
      >
        <TradingViewChart key={`${activeSymbol}-${interval}`} symbol={activeSymbol} interval={interval} height={chartHeight} />
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
        }}
      >
        {/* Top row: snapshot button + status */}
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
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "rgba(210,220,240,0.4)",
                letterSpacing: 1,
              }}
            >
              Loading chart headlessly — this takes ~10–20s on first run
            </span>
          )}

          {snapshotError && (
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#ef4444",
                letterSpacing: 1,
              }}
            >
              ✕ {snapshotError}
            </span>
          )}
        </div>

        {/* Preview + post controls */}
        {snapshotUrl && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Thumbnail */}
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "rgba(210,220,240,0.3)",
                  marginBottom: 8,
                }}
              >
                Snapshot Preview
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={snapshotUrl}
                alt="Chart snapshot"
                style={{
                  width: 320,
                  height: 180,
                  objectFit: "cover",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "block",
                }}
              />
              <a
                href={snapshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 6,
                  fontFamily: "monospace",
                  fontSize: 9,
                  letterSpacing: 1,
                  color: "rgba(79,142,247,0.7)",
                  textDecoration: "none",
                }}
              >
                Open full size ↗
              </a>
            </div>

            {/* Caption + post buttons */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "rgba(210,220,240,0.3)",
                  marginBottom: 8,
                }}
              >
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

              {/* Post buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                {/* Instagram */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button
                    onClick={postToInstagram}
                    disabled={igStatus === "loading" || igStatus === "success"}
                    style={{
                      background:
                        igStatus === "success"
                          ? "rgba(34,197,94,0.1)"
                          : igStatus === "error"
                          ? "rgba(239,68,68,0.1)"
                          : igStatus === "loading"
                          ? "rgba(79,142,247,0.08)"
                          : "#08090f",
                      color:
                        igStatus === "success"
                          ? "#22c55e"
                          : igStatus === "error"
                          ? "#ef4444"
                          : "rgba(210,220,240,0.88)",
                      border: `1px solid ${statusColor(igStatus)}`,
                      padding: "7px 16px",
                      fontSize: 10,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      fontFamily: "monospace",
                      cursor:
                        igStatus === "loading" || igStatus === "success"
                          ? "not-allowed"
                          : "pointer",
                      transition: "all 0.15s",
                      minWidth: 160,
                    }}
                  >
                    {igStatus === "loading"
                      ? "Posting…"
                      : igStatus === "success"
                      ? "✓ Posted to Instagram"
                      : igStatus === "error"
                      ? "✕ Instagram Failed"
                      : "Post to Instagram"}
                  </button>
                  {igMsg && (
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 9,
                        color:
                          igStatus === "success"
                            ? "rgba(34,197,94,0.6)"
                            : "rgba(239,68,68,0.7)",
                        letterSpacing: 0.5,
                      }}
                    >
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
                      background:
                        tgStatus === "success"
                          ? "rgba(34,197,94,0.1)"
                          : tgStatus === "error"
                          ? "rgba(239,68,68,0.1)"
                          : tgStatus === "loading"
                          ? "rgba(79,142,247,0.08)"
                          : "#08090f",
                      color:
                        tgStatus === "success"
                          ? "#22c55e"
                          : tgStatus === "error"
                          ? "#ef4444"
                          : "rgba(210,220,240,0.88)",
                      border: `1px solid ${statusColor(tgStatus)}`,
                      padding: "7px 16px",
                      fontSize: 10,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      fontFamily: "monospace",
                      cursor:
                        tgStatus === "loading" || tgStatus === "success"
                          ? "not-allowed"
                          : "pointer",
                      transition: "all 0.15s",
                      minWidth: 160,
                    }}
                  >
                    {tgStatus === "loading"
                      ? "Sending…"
                      : tgStatus === "success"
                      ? "✓ Sent to Telegram"
                      : tgStatus === "error"
                      ? "✕ Telegram Failed"
                      : "Post to Telegram"}
                  </button>
                  {tgMsg && (
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 9,
                        color:
                          tgStatus === "success"
                            ? "rgba(34,197,94,0.6)"
                            : "rgba(239,68,68,0.7)",
                        letterSpacing: 0.5,
                      }}
                    >
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
