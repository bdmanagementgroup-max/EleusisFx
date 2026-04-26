"use client";

import useSWR from "swr";

interface CryptoPrice { id: string; symbol: string; usd: number; usd_24h_change: number; }
interface ForexPrice { symbol: string; price: string; change?: number; }

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MarketsPage() {
  const { data: cryptoData, isLoading: cLoading } = useSWR<{ prices: CryptoPrice[] }>("/api/market/crypto", fetcher, { refreshInterval: 60000 });
  const { data: forexData, isLoading: fLoading } = useSWR<{ rates: ForexPrice[] }>("/api/market/forex", fetcher, { refreshInterval: 60000 });

  const tableRow = (symbol: string, price: string, change?: number) => (
    <div key={symbol} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
      <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "#e8eaf0" }}>{symbol}</span>
      <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 600, fontSize: 14, color: "#e8eaf0" }}>{price}</span>
      {change !== undefined ? (
        <span style={{ fontSize: 12, fontWeight: 600, color: change >= 0 ? "#22c55e" : "#ef4444" }}>
          {change >= 0 ? "+" : ""}{change.toFixed(2)}%
        </span>
      ) : <span />}
    </div>
  );

  return (
    <div style={{ padding: "40px 40px 80px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Live Data</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1, marginBottom: 8 }}>Market Prices</h1>
      <p style={{ fontSize: 13, color: "rgba(210,220,240,0.88)", marginBottom: 48 }}>Refreshes every 60 seconds.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Crypto */}
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f8ef7", display: "inline-block", animation: "blink 1.5s infinite" }} />
            <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#7eb3ff" }}>Cryptocurrency</span>
          </div>
          <div style={{ padding: "0 0 8px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Asset", "Price (USD)", "24h Change"].map((h) => (
                <span key={h} style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)" }}>{h}</span>
              ))}
            </div>
            {cLoading ? (
              <div style={{ padding: "32px 24px", color: "rgba(210,220,240,0.88)", fontSize: 13 }}>Loading…</div>
            ) : (
              (cryptoData?.prices ?? []).map((p) =>
                tableRow(p.symbol, `$${p.usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, p.usd_24h_change)
              )
            )}
          </div>
        </div>

        {/* Forex */}
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "blink 1.5s infinite" }} />
            <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#22c55e" }}>Forex Pairs</span>
          </div>
          <div style={{ padding: "0 0 8px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Pair", "Rate", ""].map((h) => (
                <span key={h} style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)" }}>{h}</span>
              ))}
            </div>
            {fLoading ? (
              <div style={{ padding: "32px 24px", color: "rgba(210,220,240,0.88)", fontSize: 13 }}>Loading…</div>
            ) : (
              (forexData?.rates ?? []).map((r) =>
                tableRow(r.symbol, parseFloat(r.price || "0").toFixed(4), r.change)
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
