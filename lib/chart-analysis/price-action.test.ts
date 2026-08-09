import { describe, it, expect } from 'vitest';
import { computePriceActionSetup, derivePricePrecision } from './price-action';
import { calcATR } from '@/lib/trading/indicators';
import type { PriceActionOHLCV } from './market-data';

// Turns a close-price path into OHLCV bars: each bar opens at the previous
// close and wicks a fixed amount beyond the open/close body. Used by the
// regression fixtures below, which need precise control over where swing
// points land.
function barsFromPath(prices: number[], wick: number): PriceActionOHLCV {
  const open: number[] = [];
  const high: number[] = [];
  const low: number[] = [];
  const close: number[] = [];
  const volume: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    const c = prices[i];
    const o = i === 0 ? c : prices[i - 1];
    open.push(o);
    high.push(Math.max(o, c) + wick);
    low.push(Math.min(o, c) - wick);
    close.push(c);
    volume.push(1000);
  }

  return { open, high, low, close, volume };
}

// Appends `n` linearly interpolated bars taking the path from its current
// value to `to`, so each leg is monotonic and only the turning points
// register as fractal swings.
function appendLeg(path: number[], to: number, n: number): void {
  const from = path[path.length - 1];
  for (let k = 1; k <= n; k++) path.push(from + ((to - from) * k) / n);
}

// 62 bars of steady rally (~1.00 -> ~1.30) followed by a lower-low pullback
// sequence: down to ~1.25, bounce to ~1.29, then a deeper drop to ~1.21.
// The 50-bar regression still reads 'up', but the two most recent swing lows
// DESCEND — the exact shape computeTrendline must refuse to draw an
// "ascending support" line through.
function buildUptrendWithLowerLowsOHLCV(): PriceActionOHLCV {
  const path: number[] = [];
  for (let i = 0; i < 62; i++) path.push(1.0 + 0.005 * i + 0.01 * Math.sin(i / 3));

  const rallyPeak = path[path.length - 1];
  appendLeg(path, rallyPeak - 0.06, 5); // first swing low
  appendLeg(path, rallyPeak - 0.02, 4); // bounce
  appendLeg(path, rallyPeak - 0.1, 5); // second, LOWER swing low
  appendLeg(path, rallyPeak - 0.08, 4); // tail up, so the low is a completed fractal

  return barsFromPath(path, 0.005);
}

// 56 bars chopping around 1.00 (leaving swing lows near 0.989), then a
// smooth, low-volatility 24-bar melt-up to ~1.20 with no intervening swing
// lows. The most recent invalidation swing therefore sits ~0.21 below entry
// while ATR14 is only ~0.0093 — a ~22x-ATR "natural" risk that must be
// clamped to MAX_RISK_ATR_MULTIPLE * ATR.
function buildDistantInvalidationOHLCV(): PriceActionOHLCV {
  const path: number[] = [];
  for (let i = 0; i < 56; i++) path.push(1.0 + 0.01 * Math.sin(i / 3));
  appendLeg(path, path[path.length - 1] + 0.2, 24);
  return barsFromPath(path, 0.001);
}

// A zigzag whose turning points are deliberately grouped: three peaks within
// ~0.07% of each other (inside SWING_CLUSTER_TOLERANCE, so they must merge
// into one level), two peaks ~0.8% apart (outside it, so they must stay
// separate), three troughs within ~0.05% (merge) and one ~0.9% away
// (separate). Ends at 1.15, between the trough and peak groups, so all of
// them survive computeKeyLevels' above/below-current-price filter.
function buildClusteredSwingsOHLCV(): PriceActionOHLCV {
  const anchors = [1.1, 1.2, 1.1005, 1.2008, 1.09, 1.2004, 1.1002, 1.25, 1.1003, 1.26];
  const path: number[] = [anchors[0]];
  for (let a = 1; a < anchors.length; a++) appendLeg(path, anchors[a], 6);
  appendLeg(path, 1.15, 6);
  return barsFromPath(path, 0.0002);
}

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

  it('refuses to draw an uptrend trendline when the two most recent swing lows descend', () => {
    const setup = computePriceActionSetup(buildUptrendWithLowerLowsOHLCV());

    expect(setup.trend).toBe('up');

    // Guard precondition: the last two swing lows really are lower-lows, so
    // the only thing that can null the trendline is the direction check.
    const [prev, last] = setup.swingLows.slice(-2);
    expect(prev).toBeDefined();
    expect(last.price).toBeLessThan(prev.price);

    // A line drawn through them would slope DOWN while the trend reads 'up' —
    // a support trendline that contradicts its own label.
    expect(setup.trendline).toBeNull();
  });

  it('caps long-setup risk at 2x ATR when the invalidation swing is far from entry', () => {
    const ohlcv = buildDistantInvalidationOHLCV();
    const setup = computePriceActionSetup(ohlcv);
    const atr = calcATR(ohlcv.high, ohlcv.low, ohlcv.close, 14);

    expect(setup.trend).toBe('up');
    expect(setup.longShortBox).not.toBeNull();
    expect(setup.longShortBox!.direction).toBe('long');

    const { entry, stopLoss } = setup.longShortBox!;

    // The untruncated distance to the invalidation swing is an order of
    // magnitude past the cap — without the clamp the box would be unusable.
    const invalidation = setup.swingLows.filter((s) => s.price < entry).sort((a, b) => b.index - a.index)[0];
    expect(entry - invalidation.price).toBeGreaterThan(10 * atr);

    expect(entry - stopLoss).toBeCloseTo(2 * atr, 8);
  });

  it('merges swings inside the cluster tolerance into one key level and keeps distant ones separate', () => {
    const setup = computePriceActionSetup(buildClusteredSwingsOHLCV());

    // Peaks at ~1.2002/1.2010/1.2006 collapse to a single level; 1.2502 and
    // 1.2602 (~0.8% apart) do not merge with it or with each other.
    expect(setup.keyLevels.resistance).toHaveLength(3);
    const [merged, mid, far] = setup.keyLevels.resistance;
    expect(merged).toBeCloseTo(1.2006, 3);
    expect(mid).toBeCloseTo(1.2502, 3);
    expect(far).toBeCloseTo(1.2602, 3);

    // Troughs at ~1.1003/1.1000/1.1001 collapse to one level; ~1.0898 stays
    // its own level. Support is sorted nearest-first (descending).
    expect(setup.keyLevels.support).toHaveLength(2);
    expect(setup.keyLevels.support[0]).toBeCloseTo(1.1001, 3);
    expect(setup.keyLevels.support[1]).toBeCloseTo(1.0898, 3);

    // Five raw swing highs and four raw swing lows fed those clusters — the
    // reduction to 3 + 2 is the merge, not a shortage of swing points.
    expect(setup.swingHighs.length).toBe(5);
    expect(setup.swingLows.length).toBe(4);
  });

  it('rounds key levels to the precision implied by the instrument magnitude', () => {
    const setup = computePriceActionSetup(buildClusteredSwingsOHLCV());
    const allLevels = [...setup.keyLevels.support, ...setup.keyLevels.resistance];

    expect(allLevels.length).toBeGreaterThan(0);
    for (const level of allLevels) {
      expect(level).toBe(Number(level.toFixed(5)));
    }
  });

  it('returns no relative-volume readings when the feed reports zero volume on every bar', () => {
    const ohlcv = buildSyntheticOHLCV('up');
    const setup = computePriceActionSetup({ ...ohlcv, volume: ohlcv.volume.map(() => 0) });

    expect(setup.relativeVolume).toEqual([]);
  });
});

describe('derivePricePrecision', () => {
  it('uses 5dp for forex-magnitude prices and steps down for larger ones', () => {
    expect(derivePricePrecision(1.13163)).toBe(5);
    expect(derivePricePrecision(0.6543)).toBe(5);
    expect(derivePricePrecision(15.2)).toBe(4);
    expect(derivePricePrecision(157.25)).toBe(3);
    expect(derivePricePrecision(1950.5)).toBe(2);
    expect(derivePricePrecision(94000)).toBe(2);
  });

  it('falls back to 5dp for non-positive or non-finite input', () => {
    expect(derivePricePrecision(0)).toBe(5);
    expect(derivePricePrecision(-1)).toBe(5);
    expect(derivePricePrecision(Number.NaN)).toBe(5);
  });
});
