"use client";

import useSWR from "swr";

interface CryptoPrice { id: string; symbol: string; usd: number; usd_24h_change: number; }
interface ForexPrice { symbol: string; price: string; change?: number; }

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MarketTickerStrip() {
  const { data: cryptoData } = useSWR<{ prices: CryptoPrice[] }>("/api/market/crypto", fetcher, { refreshInterval: 60000 });
  const { data: forexData } = useSWR<{ rates: ForexPrice[] }>("/api/market/forex", fetcher, { refreshInterval: 60000 });

  const items = [
    ...(cryptoData?.prices ?? []).map((p) => ({
      symbol: p.symbol,
      price: `$${p.usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
      change: p.usd_24h_change,
    })),
    ...(forexData?.rates ?? []).map((r) => ({
      symbol: r.symbol,
      price: parseFloat(r.price).toFixed(4),
      change: r.change,
    })),
  ];

  const doubled = [...items, ...items];

  if (items.length === 0) return null;

  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "12px 0",
        overflow: "hidden",
        background: "#08090f",
        marginBottom: 40,
        marginLeft: -40,
        marginRight: -40,
      }}
    >
      <div style={{ display: "flex", width: "max-content", animation: "scroll 40s linear infinite" }}>
        {doubled.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "0 32px", whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#e8eaf0" }}>
              {item.symbol}
            </span>
            <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontSize: 12, fontWeight: 600, color: "#e8eaf0" }}>
              {item.price}
            </span>
            {item.change !== undefined && (
              <span style={{ fontSize: 10, fontWeight: 600, color: item.change >= 0 ? "#22c55e" : "#ef4444" }}>
                {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
              </span>
            )}
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#4f8ef7", display: "inline-block", flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
