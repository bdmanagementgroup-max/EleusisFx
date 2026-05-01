"use client";

import TradingViewTickerWidget from "@/components/layout/TradingViewTickerWidget";

export default function AdminMarketTicker() {
  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 30,
      height: 46,
      overflow: "hidden",
      background: "#08090f",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      flexShrink: 0,
    }}>
      <TradingViewTickerWidget />
    </div>
  );
}
