"use client";

import TradingViewTickerWidget from "./TradingViewTickerWidget";

export default function PublicMarketTicker() {
  return (
    <div
      style={{
        position: "fixed",
        top: 72,
        left: 0,
        right: 0,
        zIndex: 498,
        height: 46,
        overflow: "hidden",
        background: "#08090f",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <TradingViewTickerWidget />
    </div>
  );
}
