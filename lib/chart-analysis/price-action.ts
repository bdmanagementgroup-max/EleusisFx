/**
 * Price-Action Analysis
 * Computes swing structure, key levels, a trendline, a Fibonacci
 * retracement, a long/short entry-stop-target setup, and relative volume
 * from OHLCV data — pure functions, no network or browser dependency.
 */

import { calcATR } from '@/lib/trading/indicators';
import type { PriceActionOHLCV } from './market-data';

export interface PriceActionSetup {
  trend: 'up' | 'down' | 'sideways';
  swingHighs: { index: number; price: number }[];
  swingLows: { index: number; price: number }[];
  keyLevels: { support: number[]; resistance: number[] };
  trendline: { x1: number; y1: number; x2: number; y2: number } | null;
  fibRetracement: { level: number; price: number }[] | null;
  longShortBox: {
    direction: 'long' | 'short';
    entry: number;
    stopLoss: number;
    takeProfit: number;
    ratio: number;
  } | null;
  relativeVolume: { index: number; ratio: number }[];
}

const FRACTAL_WINDOW = 2; // bars on each side that must be lower/higher
const SWING_CLUSTER_TOLERANCE = 0.001; // 0.1% price proximity to merge swings into one level
const TREND_LOOKBACK = 50;
const TREND_SLOPE_THRESHOLD = 0.0005; // normalized slope per bar (fraction of price)
const MIN_RR_RATIO = 2;
const STOP_ATR_BUFFER = 0.25;
const RELATIVE_VOLUME_WINDOW = 20;
const MAX_RISK_ATR_MULTIPLE = 2; // caps how far the invalidation stop (and thus the 3x fallback target) can sit from entry, keeping the box chart-legible

// Collapses runs of consecutive swings that share the same price (a flat
// top/bottom plateau) into a single swing at the last index of the run —
// otherwise every bar along a plateau is reported as its own swing point.
function dedupePlateaus(
  swings: { index: number; price: number }[]
): { index: number; price: number }[] {
  const result: { index: number; price: number }[] = [];
  for (const s of swings) {
    const last = result[result.length - 1];
    if (last && last.price === s.price) {
      result[result.length - 1] = s;
    } else {
      result.push(s);
    }
  }
  return result;
}

function findSwingHighs(high: number[]): { index: number; price: number }[] {
  const swings: { index: number; price: number }[] = [];
  for (let i = FRACTAL_WINDOW; i < high.length - FRACTAL_WINDOW; i++) {
    const window = high.slice(i - FRACTAL_WINDOW, i + FRACTAL_WINDOW + 1);
    if (high[i] === Math.max(...window)) {
      swings.push({ index: i, price: high[i] });
    }
  }
  return dedupePlateaus(swings);
}

function findSwingLows(low: number[]): { index: number; price: number }[] {
  const swings: { index: number; price: number }[] = [];
  for (let i = FRACTAL_WINDOW; i < low.length - FRACTAL_WINDOW; i++) {
    const window = low.slice(i - FRACTAL_WINDOW, i + FRACTAL_WINDOW + 1);
    if (low[i] === Math.min(...window)) {
      swings.push({ index: i, price: low[i] });
    }
  }
  return dedupePlateaus(swings);
}

function linearRegressionSlope(values: number[]): number {
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

function computeTrend(close: number[]): 'up' | 'down' | 'sideways' {
  const lookback = close.slice(-TREND_LOOKBACK);
  const slope = linearRegressionSlope(lookback);
  const avgPrice = lookback.reduce((a, b) => a + b, 0) / lookback.length;
  const normalizedSlope = slope / avgPrice;
  if (normalizedSlope > TREND_SLOPE_THRESHOLD) return 'up';
  if (normalizedSlope < -TREND_SLOPE_THRESHOLD) return 'down';
  return 'sideways';
}

function clusterLevels(
  swings: { index: number; price: number }[],
  tolerance: number
): { price: number; count: number; lastIndex: number }[] {
  const sorted = [...swings].sort((a, b) => a.price - b.price);
  const clusters: { prices: number[]; indices: number[] }[] = [];

  for (const s of sorted) {
    const last = clusters[clusters.length - 1];
    const originPrice = last?.prices[0];
    if (last && originPrice !== undefined && Math.abs(s.price - originPrice) / s.price <= tolerance) {
      last.prices.push(s.price);
      last.indices.push(s.index);
    } else {
      clusters.push({ prices: [s.price], indices: [s.index] });
    }
  }

  return clusters.map((c) => ({
    price: c.prices.reduce((a, b) => a + b, 0) / c.prices.length,
    count: c.prices.length,
    lastIndex: Math.max(...c.indices),
  }));
}

// Picks a sensible decimal precision from price magnitude — 5dp for
// sub-$10 instruments (forex majors), down to 2dp for large-magnitude
// ones (BTC, JPY crosses) — so labels/rounding stay consistent with how
// each instrument class is normally quoted, without hardcoding per-symbol
// rules.
export function derivePricePrecision(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return 5;
  const magnitude = Math.floor(Math.log10(price));
  return Math.max(2, Math.min(5, 5 - magnitude));
}

function computeKeyLevels(
  swingHighs: { index: number; price: number }[],
  swingLows: { index: number; price: number }[],
  currentPrice: number
): { support: number[]; resistance: number[] } {
  // Cluster averaging produces raw floats (e.g. 1.3325071930885315) that
  // would otherwise leak straight into the stored caption JSON and any
  // social post copied from it.
  const precision = derivePricePrecision(currentPrice);
  const round = (price: number) => Number(price.toFixed(precision));

  const resistance = clusterLevels(swingHighs, SWING_CLUSTER_TOLERANCE)
    .filter((c) => c.price > currentPrice)
    .sort((a, b) => b.count - a.count || b.lastIndex - a.lastIndex)
    .slice(0, 3)
    .map((c) => c.price)
    .sort((a, b) => a - b)
    .map(round);

  const support = clusterLevels(swingLows, SWING_CLUSTER_TOLERANCE)
    .filter((c) => c.price < currentPrice)
    .sort((a, b) => b.count - a.count || b.lastIndex - a.lastIndex)
    .slice(0, 3)
    .map((c) => c.price)
    .sort((a, b) => b - a)
    .map(round);

  return { support, resistance };
}

function computeTrendline(
  trend: 'up' | 'down' | 'sideways',
  swingHighs: { index: number; price: number }[],
  swingLows: { index: number; price: number }[]
): PriceActionSetup['trendline'] {
  if (trend === 'sideways') return null;
  const points = trend === 'up' ? swingLows : swingHighs;
  if (points.length < 2) return null;
  const sorted = [...points].sort((a, b) => a.index - b.index);
  const [p1, p2] = sorted.slice(-2);
  if (p1.index === p2.index) return null;
  if (trend === 'up' && p2.price <= p1.price) return null;
  if (trend === 'down' && p2.price >= p1.price) return null;
  return { x1: p1.index, y1: p1.price, x2: p2.index, y2: p2.price };
}

function computeFibRetracement(
  swingHighs: { index: number; price: number }[],
  swingLows: { index: number; price: number }[]
): PriceActionSetup['fibRetracement'] {
  let best: { range: number; high: number; low: number; highFirst: boolean } | null = null;

  for (const h of swingHighs) {
    for (const l of swingLows) {
      const range = Math.abs(h.price - l.price);
      if (!best || range > best.range) {
        best = { range, high: h.price, low: l.price, highFirst: h.index < l.index };
      }
    }
  }

  if (!best || best.range === 0) return null;

  const levels = [0, 23.6, 38.2, 50, 61.8, 78.6, 100];
  return levels.map((level) => ({
    level,
    price: best!.highFirst
      ? best!.low + (best!.range * level) / 100
      : best!.high - (best!.range * level) / 100,
  }));
}

function computeRelativeVolume(volume: number[]): { index: number; ratio: number }[] {
  // Some sources (Yahoo, for forex) report zero volume on every bar. Reporting
  // a 1.00x "normal" reading for that is a fabricated statistic — return
  // nothing so callers can say "no volume data" instead.
  if (volume.every((v) => v === 0)) return [];

  const result: { index: number; ratio: number }[] = [];
  for (let i = RELATIVE_VOLUME_WINDOW; i < volume.length; i++) {
    const avg =
      volume.slice(i - RELATIVE_VOLUME_WINDOW, i).reduce((a, b) => a + b, 0) / RELATIVE_VOLUME_WINDOW;
    result.push({ index: i, ratio: avg === 0 ? 1 : volume[i] / avg });
  }
  return result;
}

function computeLongShortBox(
  trend: 'up' | 'down' | 'sideways',
  close: number[],
  high: number[],
  low: number[],
  swingHighs: { index: number; price: number }[],
  swingLows: { index: number; price: number }[],
  keyLevels: { support: number[]; resistance: number[] }
): PriceActionSetup['longShortBox'] {
  if (trend === 'sideways') return null;

  const entry = close[close.length - 1];
  const atr = calcATR(high, low, close, 14);
  if (!Number.isFinite(atr) || atr <= 0) return null;
  const buffer = atr * STOP_ATR_BUFFER;
  const maxRisk = atr * MAX_RISK_ATR_MULTIPLE;

  if (trend === 'up') {
    const invalidation = [...swingLows]
      .filter((s) => s.price < entry)
      .sort((a, b) => b.index - a.index)[0];
    if (!invalidation) return null;

    const naturalRisk = entry - (invalidation.price - buffer);
    if (naturalRisk <= 0) return null;
    const risk = Math.min(naturalRisk, maxRisk);
    const stopLoss = entry - risk;

    const targetLevel = keyLevels.resistance.find((r) => (r - entry) / risk >= MIN_RR_RATIO);
    const takeProfit = targetLevel ?? entry + risk * 3;
    const ratio = (takeProfit - entry) / risk;

    return { direction: 'long', entry, stopLoss, takeProfit, ratio: Number(ratio.toFixed(2)) };
  }

  const invalidation = [...swingHighs]
    .filter((s) => s.price > entry)
    .sort((a, b) => b.index - a.index)[0];
  if (!invalidation) return null;

  const naturalRisk = invalidation.price + buffer - entry;
  if (naturalRisk <= 0) return null;
  const risk = Math.min(naturalRisk, maxRisk);
  const stopLoss = entry + risk;

  const targetLevel = keyLevels.support.find((s) => (entry - s) / risk >= MIN_RR_RATIO);
  const takeProfit = targetLevel ?? entry - risk * 3;
  const ratio = (entry - takeProfit) / risk;

  return { direction: 'short', entry, stopLoss, takeProfit, ratio: Number(ratio.toFixed(2)) };
}

export function computePriceActionSetup(ohlcv: PriceActionOHLCV): PriceActionSetup {
  const { high, low, close, volume } = ohlcv;

  const swingHighs = findSwingHighs(high);
  const swingLows = findSwingLows(low);
  const trend = computeTrend(close);
  const currentPrice = close[close.length - 1];
  const keyLevels = computeKeyLevels(swingHighs, swingLows, currentPrice);
  const trendline = computeTrendline(trend, swingHighs, swingLows);
  const fibRetracement = computeFibRetracement(swingHighs, swingLows);
  const relativeVolume = computeRelativeVolume(volume);
  const longShortBox = computeLongShortBox(trend, close, high, low, swingHighs, swingLows, keyLevels);

  return { trend, swingHighs, swingLows, keyLevels, trendline, fibRetracement, longShortBox, relativeVolume };
}
