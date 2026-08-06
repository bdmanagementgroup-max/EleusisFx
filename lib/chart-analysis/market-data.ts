/**
 * Chart Analysis Market Data
 * Fetches OHLCV data from Yahoo Finance and calculates technical indicators
 * Reuses existing indicator calculations from lib/trading/indicators.ts
 */

import { fetchYahoo, calcEMA, calcRSI, calcMACD, calcATR, type OHLCV } from '@/lib/trading/indicators';
import type { ChartCaption, TimeframeValue } from './types';

export interface TimeframeData {
  timeframe: TimeframeValue;
  ohlcv: OHLCV;
  indicators: {
    ema20: number | null;
    ema50: number | null;
    ema200: number | null;
    rsi: number | null;
    macd: { macd: number; signal: number; hist: number } | null;
    atr: number | null;
  };
  currentPrice: number;
}

// Map timeframe to Yahoo Finance interval and range
const TIMEFRAME_CONFIG: Record<TimeframeValue, { interval: string; range: string }> = {
  '4H': { interval: '4h', range: '6mo' },
  '1D': { interval: '1d', range: '1y' },
  '1W': { interval: '1wk', range: '2y' },
};

export async function fetchMarketDataForTimeframes(
  symbol: string,
  timeframes: TimeframeValue[]
): Promise<TimeframeData[]> {
  const results = await Promise.all(
    timeframes.map(async (tf) => {
      const config = TIMEFRAME_CONFIG[tf];
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${config.interval}&range=${config.range}`;

      try {
        const res = await fetch(url, {
          cache: 'no-store',
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (!res.ok) {
          throw new Error(`Yahoo Finance ${tf} fetch failed: ${res.status}`);
        }

        const json = await res.json();
        const q = json?.chart?.result?.[0]?.indicators?.quote?.[0];

        if (!q) {
          throw new Error(`No quote data for ${tf}`);
        }

        const open: number[] = [];
        const high: number[] = [];
        const low: number[] = [];
        const close: number[] = [];

        for (let i = 0; i < (q.close ?? []).length; i++) {
          if (q.close[i] != null && q.open[i] != null && q.high[i] != null && q.low[i] != null) {
            open.push(q.open[i]);
            high.push(q.high[i]);
            low.push(q.low[i]);
            close.push(q.close[i]);
          }
        }

        if (close.length < 50) {
          throw new Error(`Insufficient data for ${tf}: ${close.length} candles`);
        }

        const ohlcv: OHLCV = { open, high, low, close };
        const currentPrice = close[close.length - 1];

        // Calculate indicators
        const ema20 = calcEMA(close, 20);
        const ema50 = calcEMA(close, 50);
        const ema200 = calcEMA(close, 200);
        const rsi = calcRSI(close);
        const macd = calcMACD(close);
        const atr = calcATR(high, low, close);

        return {
          timeframe: tf,
          ohlcv,
          indicators: {
            ema20: ema20.length ? ema20[ema20.length - 1] : null,
            ema50: ema50.length ? ema50[ema50.length - 1] : null,
            ema200: ema200.length ? ema200[ema200.length - 1] : null,
            rsi,
            macd,
            atr,
          },
          currentPrice,
        };
      } catch (err) {
        console.error(`Failed to fetch ${tf} data for ${symbol}:`, err);
        throw err;
      }
    })
  );

  return results;
}

export function formatMarketDataForLLM(data: TimeframeData[]): string {
  return data.map(({ timeframe, ohlcv, indicators, currentPrice }) => {
    const { ema20, ema50, ema200, rsi, macd, atr } = indicators;
    const lastClose = currentPrice;
    const prevClose = ohlcv.close[ohlcv.close.length - 2];
    const changePct = Number((((lastClose - prevClose) / prevClose) * 100).toFixed(2));

    let trend = 'sideways';
    if (ema50 && ema200) {
      if (lastClose > ema50 && ema50 > ema200) trend = 'up';
      else if (lastClose < ema50 && ema50 < ema200) trend = 'down';
    }

    let rsiSignal = 'neutral';
    if (rsi !== null && !isNaN(rsi)) {
      if (rsi > 70) rsiSignal = 'overbought';
      else if (rsi > 60) rsiSignal = 'bullish';
      else if (rsi < 30) rsiSignal = 'oversold';
      else if (rsi < 40) rsiSignal = 'bearish';
    }

    let macdSignal = 'neutral';
    if (macd) {
      macdSignal = macd.hist > 0 ? 'bullish' : 'bearish';
    }

    // Would need volume data - simplifying for now
    const volumeSignal = 'normal';

    return [
      `=== ${timeframe} TIMEFRAME ===`,
      `Price: ${lastClose.toFixed(5)} (${changePct >= 0 ? '+' : ''}${changePct}%)`,
      `Trend: ${trend}`,
      `EMA20: ${ema20?.toFixed(5) ?? 'n/a'} | EMA50: ${ema50?.toFixed(5) ?? 'n/a'} | EMA200: ${ema200?.toFixed(5) ?? 'n/a'}`,
      `Price vs EMA50: ${ema50 ? (lastClose > ema50 ? 'above' : 'below') : 'n/a'} | vs EMA200: ${ema200 ? (lastClose > ema200 ? 'above' : 'below') : 'n/a'}`,
      `RSI(14): ${rsi?.toFixed(1) ?? 'n/a'} (${rsiSignal})`,
      `MACD: ${macd?.macd.toFixed(5) ?? 'n/a'} | Signal: ${macd?.signal.toFixed(5) ?? 'n/a'} | Hist: ${macd?.hist.toFixed(5) ?? 'n/a'} (${macdSignal})`,
      `ATR(14): ${atr?.toFixed(5) ?? 'n/a'}`,
      `Volume: ${volumeSignal}`,
      ``,
    ].join('\n');
  }).join('\n');
}

export function generateCaptionFromData(
  instrument: string,
  displayPair: string,
  timeframes: TimeframeValue[],
  data: TimeframeData[],
  chartImage: Uint8Array // For reference - actual analysis done by LLM
): ChartCaption {
  // This is a fallback/template - actual caption generated by LLM vision analysis
  const primaryTf = data[0];
  const price = primaryTf.currentPrice;
  const ema50 = primaryTf.indicators.ema50;
  const ema200 = primaryTf.indicators.ema200;
  const rsi = primaryTf.indicators.rsi;
  const macd = primaryTf.indicators.macd;
  const atr = primaryTf.indicators.atr;

  let overallBias: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (ema50 && ema200) {
    if (price > ema50 && ema50 > ema200) overallBias = 'bullish';
    else if (price < ema50 && ema50 < ema200) overallBias = 'bearish';
  }

  const atrValue = atr ?? 0;
  const entry = price;
  const stopLoss = overallBias === 'bullish' ? entry - atrValue * 1.5 : entry + atrValue * 1.5;
  const takeProfit = overallBias === 'bullish'
    ? [entry + atrValue * 3, entry + atrValue * 4.5]
    : [entry - atrValue * 3, entry - atrValue * 4.5];
  const ratio = Math.abs(takeProfit[0] - entry) / Math.abs(entry - stopLoss);

  return {
    instrument,
    displayPair,
    generatedAt: new Date().toISOString(),
    timeframes,
    overallBias,
    confidence: 65,
    keyLevels: {
      support: [],
      resistance: [],
      pivotPoints: [],
    },
    timeframeAnalysis: Object.fromEntries(
      timeframes.map(tf => {
        const tfData = data.find(d => d.timeframe === tf);
        if (!tfData) return [tf, { trend: 'sideways' as const, bias: 'neutral' as const, keyObservations: [], indicatorSignals: { ema: '', rsi: '', macd: '', volume: '' } }];

        const { indicators, currentPrice: p } = tfData;
        let trend: 'up' | 'down' | 'sideways' = 'sideways';
        if (indicators.ema50 && indicators.ema200) {
          if (p > indicators.ema50 && indicators.ema50 > indicators.ema200) trend = 'up';
          else if (p < indicators.ema50 && indicators.ema50 < indicators.ema200) trend = 'down';
        }

        return [tf, {
          trend,
          bias: trend === 'up' ? 'bullish' : trend === 'down' ? 'bearish' : 'neutral',
          keyObservations: [],
          indicatorSignals: {
            ema: `Price ${indicators.ema50 ? (p > indicators.ema50 ? 'above' : 'below') : 'n/a'} EMA50`,
            rsi: `RSI ${indicators.rsi?.toFixed(1) ?? 'n/a'}`,
            macd: `MACD ${indicators.macd ? (indicators.macd.hist > 0 ? 'bullish' : 'bearish') : 'n/a'}`,
            volume: 'normal',
          },
        }];
      })
    ),
    riskReward: {
      entry,
      stopLoss,
      takeProfit,
      ratio: Number(ratio.toFixed(2)),
    },
    reasoning: `Technical analysis for ${displayPair} based on ${timeframes.join(', ')} timeframes. Overall bias: ${overallBias}.`,
    disclaimer: 'Not financial advice. Trade at your own risk. Past performance does not guarantee future results.',
    hashtags: ['#EleusisFx', '#ForexSignals', '#PropFirm', `#${displayPair.replace('/', '')}`, '#TradingSetup', '#FundedTrader'],
  };
}