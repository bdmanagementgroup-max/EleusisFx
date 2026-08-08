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

// Builds an 80-bar series that rallies steadily from 1.0 to 1.5 over the
// first 60 bars, then pulls back gently over the remaining 20 bars — enough
// to leave the rally's swing high standing above the current price as an
// untouched resistance level, but not enough to flip the 50-bar linear
// regression trend away from 'up'. This exercises the branch of
// computeLongShortBox where a key level (not the 3x-risk fallback) supplies
// the take-profit target, which the other fixtures never reach because they
// oscillate around a single trendline with no real corrective structure.
// Verified numerically (scratch script against this exact implementation):
// trend 'up', one swing high at index 61 (~1.5187) above the current price
// (~1.4665), one swing low at index 73 (~1.4514) below it, ATR14 ~0.01452,
// natural risk (~0.0187) comes in under the 2xATR cap so it's used as-is,
// and the resistance level clears the >=2:1 threshold at ratio ~2.79 —
// not the fallback's exact 3.00.
function buildPullbackUptrendOHLCV(): PriceActionOHLCV {
  const bars = 80;
  const rallyEnd = 60;
  const rallyTarget = 1.5;
  const pullbackFrac = 0.1;
  const open: number[] = [];
  const high: number[] = [];
  const low: number[] = [];
  const close: number[] = [];
  const volume: number[] = [];

  for (let i = 0; i < bars; i++) {
    let trendComponent: number;
    if (i < rallyEnd) {
      trendComponent = 1.0 + ((rallyTarget - 1.0) / rallyEnd) * i;
    } else {
      const pullbackProgress = (i - rallyEnd) / (bars - rallyEnd);
      trendComponent = rallyTarget - (rallyTarget - 1.0) * pullbackFrac * pullbackProgress;
    }
    const oscillation = 0.015 * Math.sin(i / 3);
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

  it('computes a monotonic fib retracement across all 7 standard levels, with level 0 anchored to the most recent extreme', () => {
    const ohlcv = buildSyntheticOHLCV('up');
    const setup = computePriceActionSetup(ohlcv);

    expect(setup.fibRetracement).not.toBeNull();
    const levels = setup.fibRetracement!.map((f) => f.level);
    expect(levels).toEqual([0, 23.6, 38.2, 50, 61.8, 78.6, 100]);

    const prices = setup.fibRetracement!.map((f) => f.price);
    const ascending = prices.every((p, i) => i === 0 || p >= prices[i - 1]);
    const descending = prices.every((p, i) => i === 0 || p <= prices[i - 1]);
    expect(ascending || descending).toBe(true);

    // Monotonicity alone doesn't catch a mirrored (0/100 swapped) retracement
    // — a mirrored sequence is still monotonic. By convention, level 0 is the
    // most recent extreme of the swing leg and level 100 is its origin, so
    // level 0 must sit closer to the current price than level 100 does.
    const currentPrice = ohlcv.close[ohlcv.close.length - 1];
    const level0 = setup.fibRetracement![0].price;
    const level100 = setup.fibRetracement![setup.fibRetracement!.length - 1].price;
    expect(Math.abs(level0 - currentPrice)).toBeLessThan(Math.abs(level100 - currentPrice));
  });

  it('flags bars with volume at least 1.5x the trailing 20-bar average', () => {
    const setup = computePriceActionSetup(buildSyntheticOHLCV('up'));

    const spike = setup.relativeVolume.find((v) => v.ratio >= 1.5);
    expect(spike).toBeDefined();
  });

  it('targets a key resistance level for take-profit when one clears the 2:1 threshold, instead of the 3x-risk fallback', () => {
    const setup = computePriceActionSetup(buildPullbackUptrendOHLCV());

    expect(setup.trend).toBe('up');
    expect(setup.keyLevels.resistance.length).toBeGreaterThan(0);
    expect(setup.longShortBox).not.toBeNull();
    expect(setup.longShortBox!.direction).toBe('long');
    expect(setup.longShortBox!.ratio).toBeGreaterThanOrEqual(2);
    // The fallback path always produces exactly ratio 3 (entry + risk*3). A
    // ratio that isn't 3 proves the resistance-level branch was actually hit.
    expect(setup.longShortBox!.ratio).not.toBe(3);
    // computeLongShortBox uses `.find()` on the ascending-sorted resistance
    // array, so the first (lowest) qualifying level wins.
    expect(setup.longShortBox!.takeProfit).toBe(setup.keyLevels.resistance[0]);
  });
});
