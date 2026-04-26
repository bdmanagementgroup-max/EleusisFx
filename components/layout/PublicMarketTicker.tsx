"use client";

import useSWR from "swr";

interface CryptoPrice { id: string; symbol: string; usd: number; usd_24h_change: number; }
interface ForexPrice { symbol: string; price: string; change?: number; }

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PublicMarketTicker() {
  const { data: cryptoData } = useSWR<{ prices: CryptoPrice[] }>("/api/market/crypto", fetcher, { refreshInterval: 60000 });
  const { data: forexData } = useSWR<{ rates: ForexPrice[] }>("/api/market/forex", fetcher, { refreshInterval: 60000 });

  const items = [
    ...(forexData?.rates ?? []).map((r) => ({
      symbol: r.symbol,
      price: parseFloat(r.price || "0").toFixed(4),
      change: r.change,
    })),
    ...(cryptoData?.prices ?? []).map((p) => ({
      symbol: p.symbol,
      price: `$${p.usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
      change: p.usd_24h_change,
    })),
  ];

  if (items.length === 0) return <div style={{ height: 38 }} />;

  const doubled = [...items, ...items];

  return (
    <div
      style={{
        position: "fixed",
        top: 72,
        left: 0,
        right: 0,
        zIndex: 498,
        height: 38,
        overflow: "hidden",
        background: "#08090f",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", width: "max-content", animation: "scroll 50s linear infinite" }}>
        {doubled.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 28px", whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,234,240,0.5)" }}>
              {item.symbol}
            </span>
            <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontSize: 11, fontWeight: 600, color: "#e8eaf0" }}>
              {item.price}
            </span>
            {item.change !== undefined && (
              <span style={{ fontSize: 10, fontWeight: 600, color: item.change >= 0 ? "#22c55e" : "#ef4444" }}>
                {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
              </span>
            )}
            <span style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(79,142,247,0.5)", display: "inline-block", flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
