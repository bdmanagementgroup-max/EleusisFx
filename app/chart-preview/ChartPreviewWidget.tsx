"use client";

import { useEffect, useRef } from "react";

export interface StudyConfig {
  id: string;
  inputs?: Record<string, number | string>;
}

export default function ChartPreviewWidget({
  symbol,
  interval,
  studies,
}: {
  symbol: string;
  interval: string;
  studies?: StudyConfig[];
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
      save_image: false,
      allow_symbol_change: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
      // Must be a uniform array of {id, inputs} objects — mixing in bare ID
      // strings for studies without inputs breaks TradingView's widget parser
      // (it throws "e.indexOf is not a function" and silently drops the study).
      ...(studies && studies.length > 0
        ? { studies: studies.map((s) => ({ id: s.id, inputs: s.inputs ?? {} })) }
        : {}),
    });
    containerRef.current.appendChild(script);
  }, [symbol, interval, studies]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#161a25",
        overflow: "hidden",
      }}
    >
      <div
        className="tradingview-widget-container"
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    </div>
  );
}
