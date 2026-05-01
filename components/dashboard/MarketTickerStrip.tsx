"use client";

import TradingViewTickerWidget from "@/components/layout/TradingViewTickerWidget";

export default function MarketTickerStrip() {
  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      overflow: "hidden",
      background: "#08090f",
      marginBottom: 40,
      marginLeft: -40,
      marginRight: -40,
    }}>
      <TradingViewTickerWidget />
    </div>
  );
}
