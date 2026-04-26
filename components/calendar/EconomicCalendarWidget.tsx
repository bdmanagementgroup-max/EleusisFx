"use client";

import { useEffect, useRef } from "react";

export default function EconomicCalendarWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      isTransparent: false,
      width: "100%",
      height: 750,
      locale: "en",
      importanceFilter: "1",
      currencyFilter: "USD,EUR,GBP,JPY,AUD,CAD,CHF,NZD",
    });
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef} style={{ width: "100%", height: 750 }}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}
