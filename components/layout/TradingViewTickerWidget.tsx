"use client";

import { useEffect, useRef } from "react";

const SYMBOLS = [
  { proName: "FOREXCOM:EURUSD", title: "EUR/USD" },
  { proName: "FOREXCOM:GBPUSD", title: "GBP/USD" },
  { proName: "FOREXCOM:USDJPY", title: "USD/JPY" },
  { proName: "FOREXCOM:AUDUSD", title: "AUD/USD" },
  { proName: "FOREXCOM:GBPJPY", title: "GBP/JPY" },
  { proName: "BITSTAMP:BTCUSD", title: "BTC/USD" },
  { proName: "BITSTAMP:ETHUSD", title: "ETH/USD" },
  { proName: "COINBASE:XRPUSD", title: "XRP/USD" },
  { proName: "COINBASE:SOLUSD", title: "SOL/USD" },
];

interface Props {
  style?: React.CSSProperties;
}

export default function TradingViewTickerWidget({ style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    container.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    container.appendChild(widget);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: SYMBOLS,
      showSymbolLogo: false,
      isTransparent: false,
      displayMode: "compact",
      colorTheme: "dark",
      locale: "en",
    });
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ width: "100%", ...style }}
    />
  );
}
