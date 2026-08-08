"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type AutoscaleInfo,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";

export interface OhlcvPayload {
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

export interface SetupPayload {
  trend: "up" | "down" | "sideways";
  keyLevels: { support: number[]; resistance: number[] };
  trendline: { x1: number; y1: number; x2: number; y2: number } | null;
  fibRetracement: { level: number; price: number }[] | null;
  longShortBox: {
    direction: "long" | "short";
    entry: number;
    stopLoss: number;
    takeProfit: number;
    ratio: number;
  } | null;
}

const BULLISH = "#4f8ef7";
const BEARISH = "#e8ecf5";
const BACKGROUND = "#08090f";
const FIB_COLOR = "rgba(192,132,252,0.45)";
const LEVEL_COLOR = "rgba(210,220,240,0.35)";
const STOP_COLOR = "rgba(239,68,68,0.7)";

// lightweight-charts requires unique ascending UTCTimestamp values; the bar
// index doubles as a synthetic day offset since real dates aren't needed —
// only left-to-right ordering matters for a static screenshot.
function indexToTime(index: number): UTCTimestamp {
  return (index * 86400) as UTCTimestamp;
}

export default function ChartPreviewWidgetPA({
  ohlcv,
  setup,
}: {
  ohlcv: OhlcvPayload;
  setup: SetupPayload;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: { background: { color: BACKGROUND }, textColor: "rgba(210,220,240,0.7)" },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      timeScale: { borderColor: "rgba(255,255,255,0.08)", visible: false },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
    });
    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: BULLISH,
      downColor: BEARISH,
      borderUpColor: BULLISH,
      borderDownColor: BEARISH,
      wickUpColor: BULLISH,
      wickDownColor: BEARISH,
    });
    candleSeries.setData(
      ohlcv.close.map((c, i) => ({
        time: indexToTime(i),
        open: ohlcv.open[i],
        high: ohlcv.high[i],
        low: ohlcv.low[i],
        close: c,
      }))
    );

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    volumeSeries.setData(
      ohlcv.volume.map((v, i) => ({
        time: indexToTime(i),
        value: v,
        color: ohlcv.close[i] >= ohlcv.open[i] ? `${BULLISH}88` : `${BEARISH}88`,
      }))
    );

    if (setup.trendline) {
      const trendColor = setup.trend === "up" ? BULLISH : BEARISH;
      const lineSeries = chart.addLineSeries({ color: trendColor, lineWidth: 2 });
      lineSeries.setData([
        { time: indexToTime(setup.trendline.x1), value: setup.trendline.y1 },
        { time: indexToTime(setup.trendline.x2), value: setup.trendline.y2 },
      ]);
    }

    if (setup.fibRetracement) {
      for (const fib of setup.fibRetracement) {
        candleSeries.createPriceLine({
          price: fib.price,
          color: FIB_COLOR,
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: `fib ${fib.level}`,
        });
      }
    }

    for (const price of [...setup.keyLevels.support, ...setup.keyLevels.resistance]) {
      candleSeries.createPriceLine({
        price,
        color: LEVEL_COLOR,
        lineWidth: 1,
        lineStyle: 3,
        axisLabelVisible: true,
        title: "level",
      });
    }

    if (setup.longShortBox) {
      const dirColor = setup.longShortBox.direction === "long" ? BULLISH : BEARISH;
      candleSeries.createPriceLine({
        price: setup.longShortBox.entry,
        color: dirColor,
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: "entry",
      });
      candleSeries.createPriceLine({
        price: setup.longShortBox.stopLoss,
        color: STOP_COLOR,
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "stop",
      });
      candleSeries.createPriceLine({
        price: setup.longShortBox.takeProfit,
        color: dirColor,
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "target",
      });
    }

    const overlayPrices = [
      ...setup.keyLevels.support,
      ...setup.keyLevels.resistance,
      ...(setup.fibRetracement?.map((f) => f.price) ?? []),
      ...(setup.longShortBox
        ? [setup.longShortBox.entry, setup.longShortBox.stopLoss, setup.longShortBox.takeProfit]
        : []),
    ];

    if (overlayPrices.length > 0) {
      candleSeries.applyOptions({
        autoscaleInfoProvider: (original: () => AutoscaleInfo | null) => {
          const res = original();
          if (!res?.priceRange) return res;
          return {
            ...res,
            priceRange: {
              minValue: Math.min(res.priceRange.minValue, ...overlayPrices),
              maxValue: Math.max(res.priceRange.maxValue, ...overlayPrices),
            },
          };
        },
      });
    }

    chart.timeScale().fitContent();
    containerRef.current.setAttribute("data-chart-ready", "true");

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [ohlcv, setup]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: BACKGROUND }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
