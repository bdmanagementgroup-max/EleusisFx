/**
 * Chart Analysis Agent Types
 * Shared type definitions for the TradingView chart analysis feature
 */

export interface ChartCaption {
  instrument: string;
  displayPair: string;
  generatedAt: string;           // ISO timestamp
  timeframes: string[];
  overallBias: 'bullish' | 'bearish' | 'neutral';
  confidence: number;            // 0-100
  keyLevels: {
    support: number[];
    resistance: number[];
    pivotPoints: number[];
  };
  timeframeAnalysis: {
    [timeframe: string]: {
      trend: 'up' | 'down' | 'sideways';
      bias: 'bullish' | 'bearish' | 'neutral';
      keyObservations: string[];
      indicatorSignals: {
        ema: string;
        rsi: string;
        macd: string;
        volume: string;
      };
    };
  };
  riskReward: {
    entry: number;
    stopLoss: number;
    takeProfit: number[];
    ratio: number;
  };
  reasoning: string;             // Narrative explanation for caption
  disclaimer: string;            // Standard financial disclaimer
  hashtags: string[];            // For social posting
}

export interface ChartAnalysisRecord {
  id: string;
  created_at: string;
  completed_at: string | null;
  instrument: string;            // Yahoo symbol (e.g., EURUSD=X)
  display_pair: string;          // Display pair (e.g., EUR/USD)
  timeframes: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  chart_image: Uint8Array | null;  // PNG bytes
  caption_json: ChartCaption;
  metadata: ChartAnalysisMetadata;
  created_by: string | null;
}

export interface ChartAnalysisMetadata {
  indicators_used: string[];
  duration_ms: number;
  model: string;
  error?: string;
  timeframes_analyzed: string[];
}

export interface ChartAnalysisJobInput {
  instrument: string;            // Yahoo symbol
  displayPair: string;           // Display pair
  timeframes: TimeframeValue[];  // e.g., ['4H', '1D', '1W']
  createdBy: string;             // User ID
}

export interface ChartAnalysisJobResult {
  success: boolean;
  record?: ChartAnalysisRecord;
  error?: string;
}

// Instrument mapping from existing agent-bias instruments
export interface ChartInstrument {
  yahoo: string;
  display: string;
  assetType: 'forex' | 'crypto';
  tradingViewSymbol: string;     // e.g., 'TVC:EURUSD', 'BINANCE:BTCUSDT'
}

export const TIMEFRAME_OPTIONS = [
  { value: '4H', label: '4 Hour' },
  { value: '1D', label: 'Daily' },
  { value: '1W', label: 'Weekly' },
] as const;

export type TimeframeValue = (typeof TIMEFRAME_OPTIONS)[number]['value'];

// Map Yahoo symbols to TradingView symbols
export function yahooToTradingView(yahoo: string): string {
  const map: Record<string, string> = {
    'EURUSD=X': 'TVC:EURUSD',
    'GBPUSD=X': 'TVC:GBPUSD',
    'USDJPY=X': 'TVC:USDJPY',
    'AUDUSD=X': 'TVC:AUDUSD',
    'GBPJPY=X': 'TVC:GBPJPY',
    'USDCAD=X': 'TVC:USDCAD',
    'NZDUSD=X': 'TVC:NZDUSD',
    'EURGBP=X': 'TVC:EURGBP',
    'USDCHF=X': 'TVC:USDCHF',
    'EURJPY=X': 'TVC:EURJPY',
    'CADJPY=X': 'TVC:CADJPY',
    'AUDNZD=X': 'TVC:AUDNZD',
    'BTC-USD': 'BINANCE:BTCUSDT',
    'ETH-USD': 'BINANCE:ETHUSDT',
    'SOL-USD': 'BINANCE:SOLUSDT',
    'XRP-USD': 'BINANCE:XRPUSDT',
  };
  return map[yahoo] ?? `TVC:${yahoo.replace('=X', '').replace('-USD', 'USDT')}`;
}

// Map Yahoo symbols to display pairs
export function yahooToDisplay(yahoo: string): string {
  const map: Record<string, string> = {
    'EURUSD=X': 'EUR/USD',
    'GBPUSD=X': 'GBP/USD',
    'USDJPY=X': 'USD/JPY',
    'AUDUSD=X': 'AUD/USD',
    'GBPJPY=X': 'GBP/JPY',
    'USDCAD=X': 'USD/CAD',
    'NZDUSD=X': 'NZD/USD',
    'EURGBP=X': 'EUR/GBP',
    'USDCHF=X': 'USD/CHF',
    'EURJPY=X': 'EUR/JPY',
    'CADJPY=X': 'CAD/JPY',
    'AUDNZD=X': 'AUD/NZD',
    'BTC-USD': 'BTC/USDT',
    'ETH-USD': 'ETH/USDT',
    'SOL-USD': 'SOL/USDT',
    'XRP-USD': 'XRP/USDT',
  };
  return map[yahoo] ?? yahoo;
}