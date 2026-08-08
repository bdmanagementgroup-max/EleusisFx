import { describe, it, expect } from 'vitest';
import { computePriceActionSetup } from './price-action';
import type { PriceActionOHLCV } from './market-data';

// Builds a deterministic 80-bar series with a linear trend plus a sine-wave
// oscillation superimposed, so fractal swing detection finds real swing
// points regardless of trend direction. 'flat' has zero slope for the
// sideways case.
function buildSyntheticOHLCV(direction: 'up' | 'down' | 'flat'): PriceActionOHLCV {
  const bars = 80;
  const open: number[] = [];
  const high: number[] = [];
  const low: number[] = [];
  const close: number[] = [];
  const volume: number[] = [];

  const slopePerBar = direction === 'up' ? 0.004 : direction === 'down' ? -0.004 : 0;
  const base = 1.1;

  for (let i = 0; i < bars; i++) {
    const trendComponent = base + slopePerBar * i;
    const oscillation = 0.02 * Math.sin(i / 3);
    const c = trendComponent + oscillation;
    const o = i === 0 ? c : close[i - 1];
    const h = Math.max(o, c) + 0.005;
    const l = Math.min(o, c) - 0.005;
    open.push(o);
    high.push(h);
    low.push(l);
    close.push(c);
    volume.push(i % 15 === 0 ? 5000 : 1000);
  }

  return { open, high, low, close, volume };
}

describe('computePriceActionSetup', () => {
  it('detects an uptrend and builds a long setup with a support trendline', () => {
    const setup = computePriceActionSetup(buildSyntheticOHLCV('up'));

    expect(setup.trend).toBe('up');
    expect(setup.trendline).not.toBeNull();
    expect(setup.longShortBox).not.toBeNull();
    expect(setup.longShortBox!.direction).toBe('long');
    expect(setup.longShortBox!.ratio).toBeGreaterThanOrEqual(2);
    expect(setup.longShortBox!.takeProfit).toBeGreaterThan(setup.longShortBox!.entry);
    expect(setup.longShortBox!.stopLoss).toBeLessThan(setup.longShortBox!.entry);
  });

  it('detects a downtrend and builds a short setup with a resistance trendline', () => {
    const setup = computePriceActionSetup(buildSyntheticOHLCV('down'));

    expect(setup.trend).toBe('down');
    expect(setup.trendline).not.toBeNull();
    expect(setup.longShortBox).not.toBeNull();
    expect(setup.longShortBox!.direction).toBe('short');
    expect(setup.longShortBox!.ratio).toBeGreaterThanOrEqual(2);
    expect(setup.longShortBox!.takeProfit).toBeLessThan(setup.longShortBox!.entry);
    expect(setup.longShortBox!.stopLoss).toBeGreaterThan(setup.longShortBox!.entry);
  });

  it('treats a flat series as sideways with no trendline or box', () => {
    const setup = computePriceActionSetup(buildSyntheticOHLCV('flat'));

    expect(setup.trend).toBe('sideways');
    expect(setup.trendline).toBeNull();
    expect(setup.longShortBox).toBeNull();
  });

  it('computes a monotonic fib retracement across all 7 standard levels', () => {
    const setup = computePriceActionSetup(buildSyntheticOHLCV('up'));

    expect(setup.fibRetracement).not.toBeNull();
    const levels = setup.fibRetracement!.map((f) => f.level);
    expect(levels).toEqual([0, 23.6, 38.2, 50, 61.8, 78.6, 100]);

    const prices = setup.fibRetracement!.map((f) => f.price);
    const ascending = prices.every((p, i) => i === 0 || p >= prices[i - 1]);
    const descending = prices.every((p, i) => i === 0 || p <= prices[i - 1]);
    expect(ascending || descending).toBe(true);
  });

  it('flags bars with volume at least 1.5x the trailing 20-bar average', () => {
    const setup = computePriceActionSetup(buildSyntheticOHLCV('up'));

    const spike = setup.relativeVolume.find((v) => v.ratio >= 1.5);
    expect(spike).toBeDefined();
  });
});
