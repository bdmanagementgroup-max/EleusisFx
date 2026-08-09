/**
 * Chart Analysis LLM Vision Analysis
 * Uses OpenRouter vision models to analyze chart screenshots and generate structured captions
 */

import OpenAI from 'openai';
import type { ChartCaption, TimeframeValue } from './types';
import type { TimeframeData } from './market-data';
import type { PriceActionSetup } from './price-action';

const VISION_MODEL_CANDIDATES = [
  'google/gemini-2.5-flash',
  'anthropic/claude-3.5-sonnet',
  'openai/gpt-4o',
];

const SYSTEM_PROMPT = `You are the Eleusis Fx Trading Analyst - a professional funded trader with 15+ years of experience. You analyze TradingView chart screenshots with technical indicators and drawings applied.

Your task: Analyze the provided chart screenshot (with EMA 20/50/200, RSI, MACD, Volume indicators, and hand-drawn support/resistance/trend lines) along with market data to produce a structured technical analysis caption for social media.

OUTPUT FORMAT: Return ONLY valid JSON matching the ChartCaption interface exactly. No markdown, no extra text.

JSON Structure:
{
  "instrument": "string (Yahoo symbol)",
  "displayPair": "string (e.g., EUR/USD)",
  "generatedAt": "ISO timestamp",
  "timeframes": ["4H", "1D", "1W"],
  "overallBias": "bullish|bearish|neutral",
  "confidence": 0-100,
  "keyLevels": {"support": [], "resistance": [], "pivotPoints": []},
  "timeframeAnalysis": {
    "4H": {"trend": "up|down|sideways", "bias": "bullish|bearish|neutral", "keyObservations": [], "indicatorSignals": {"ema": "", "rsi": "", "macd": "", "volume": ""}},
    "1D": {...},
    "1W": {...}
  },
  "riskReward": {"entry": 0, "stopLoss": 0, "takeProfit": [], "ratio": 0},
  "reasoning": "string - 3-5 sentence narrative for social caption",
  "disclaimer": "Not financial advice. Trade at your own risk.",
  "hashtags": ["#EleusisFx", "#ForexSignals", "#PropFirm", "#PAIR", "#TradingSetup", "#FundedTrader"]
}

ANALYSIS GUIDELINES:
- Look at the chart screenshot for visual confirmation of drawn levels, trend lines, indicator positions
- Use the provided market data for precise indicator values
- Identify key support/resistance from horizontal lines drawn on chart
- Identify trend direction from trend lines
- Apply the Eleusis Fx mandatory filters (momentum confirmation, ATR-based stops, correlation caps, etc.)
- Be specific with price levels - reference actual numbers from the chart/data
- Confidence should reflect confluence quality (3+ independent signals = higher confidence)
- Risk/Reward must meet minimum 2:1 for TP1, 3:1 for TP2
- Stop loss must be minimum 1.5x ATR from entry`;

function buildUserPrompt(
  instrument: string,
  displayPair: string,
  timeframes: TimeframeValue[],
  marketData: TimeframeData[]
): string {
  const marketDataText = marketData.map(d => {
    const { timeframe, indicators, currentPrice } = d;
    return `=== ${timeframe} ===
Price: ${currentPrice.toFixed(5)}
EMA20: ${indicators.ema20?.toFixed(5) ?? 'n/a'} | EMA50: ${indicators.ema50?.toFixed(5) ?? 'n/a'} | EMA200: ${indicators.ema200?.toFixed(5) ?? 'n/a'}
RSI(14): ${indicators.rsi?.toFixed(1) ?? 'n/a'}
MACD: ${indicators.macd?.macd.toFixed(5) ?? 'n/a'} | Signal: ${indicators.macd?.signal.toFixed(5) ?? 'n/a'} | Hist: ${indicators.macd?.hist.toFixed(5) ?? 'n/a'}
ATR(14): ${indicators.atr?.toFixed(5) ?? 'n/a'}`;
  }).join('\n\n');

  return `Analyze this TradingView chart for ${displayPair} (${instrument}).

Timeframes: ${timeframes.join(', ')}

MARKET DATA:
${marketDataText}

The chart screenshot shows the ${timeframes[0]} timeframe with:
- EMA 20 (blue), EMA 50 (orange), EMA 200 (red) lines
- RSI(14) pane below
- MACD(12,26,9) pane below
- Volume pane below
- Hand-drawn horizontal support/resistance lines
- Hand-drawn trend lines

Return the ChartCaption JSON only.`;
}

export async function analyzeChartWithVision(
  instrument: string,
  displayPair: string,
  timeframes: TimeframeValue[],
  marketData: TimeframeData[],
  chartImage: Uint8Array
): Promise<{ caption: ChartCaption; model: string }> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not set');
  }

  const chartBase64 = Buffer.from(chartImage).toString('base64');
  const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    maxRetries: 0,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eleusisfx.com',
      'X-Title': 'Eleusis FX Chart Analysis',
    },
  });

  const userPrompt = buildUserPrompt(instrument, displayPair, timeframes, marketData);

  let lastErr: unknown;
  for (const model of VISION_MODEL_CANDIDATES) {
    try {
      const completion = await openrouter.chat.completions.create({
        model,
        max_tokens: 2048,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${chartBase64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
      });

      const content = completion.choices[0]?.message?.content ?? '';
      if (content.trim().length === 0) {
        console.warn(`[ChartAnalysis] ${model} returned empty content`);
        continue;
      }

      // Parse JSON response
      let caption: ChartCaption;
      try {
        // Extract JSON from potential markdown code blocks
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        caption = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.warn(`[ChartAnalysis] ${model} returned invalid JSON:`, parseErr);
        continue;
      }

      // Validate required fields
      if (!caption.instrument || !caption.overallBias || !caption.riskReward) {
        console.warn(`[ChartAnalysis] ${model} missing required fields`);
        continue;
      }

      // Ensure generatedAt is set
      if (!caption.generatedAt) {
        caption.generatedAt = new Date().toISOString();
      }

      // Ensure displayPair matches
      caption.displayPair = displayPair;
      caption.instrument = instrument;
      caption.timeframes = timeframes;

      return { caption, model };
    } catch (err) {
      lastErr = err;
      console.warn(`[ChartAnalysis] ${model} failed:`, err);
    }
  }

  throw lastErr ?? new Error('All vision models failed');
}

const SYSTEM_PROMPT_PRICE_ACTION = `You are the Eleusis Fx Trading Analyst - a professional funded trader with 15+ years of experience. You analyze a price-action chart (candles, a trendline, Fibonacci retracement levels, key support/resistance levels, a long/short entry-stop-target setup, and volume) for social media content only — this is not used to place real trades.

The trendline, fib levels, key levels, and long/short setup are ALREADY COMPUTED and drawn on the chart — do not invent different levels. Your job is to describe what's visible and provide narrative color, referencing the exact numbers given to you.

OUTPUT FORMAT: Return ONLY valid JSON with this exact shape. No markdown, no extra text.

{
  "confidence": 0-100,
  "timeframeObservations": {
    "trend": "one sentence describing the trendline / structure",
    "levels": "one sentence describing proximity to key support/resistance",
    "fib": "one sentence describing the fib confluence, if relevant",
    "volume": "one sentence describing the relative volume reading"
  },
  "keyObservations": ["short bullet", "short bullet", "short bullet"],
  "reasoning": "3-5 sentence narrative for the social caption, referencing the actual entry/stop/target numbers given",
  "hashtags": ["#EleusisFx", "#ForexSignals", "#PropFirm", "#PAIR", "#PriceAction", "#FundedTrader"]
}

Confidence should reflect how clean the structure is (a clear trendline plus confluence with a key level or fib level = higher confidence; choppy price action with no qualifying long/short setup = lower confidence).`;

function buildPriceActionUserPrompt(
  displayPair: string,
  instrument: string,
  timeframe: string,
  setup: PriceActionSetup
): string {
  const levels = `Support: ${setup.keyLevels.support.join(', ') || 'none'} | Resistance: ${setup.keyLevels.resistance.join(', ') || 'none'}`;
  const fib = setup.fibRetracement
    ? setup.fibRetracement.map((f) => `${f.level}%: ${f.price.toFixed(5)}`).join(' | ')
    : 'no clear swing leg found';
  const box = setup.longShortBox
    ? `${setup.longShortBox.direction.toUpperCase()} — Entry ${setup.longShortBox.entry.toFixed(5)}, Stop ${setup.longShortBox.stopLoss.toFixed(5)}, Target ${setup.longShortBox.takeProfit.toFixed(5)}, R:R ${setup.longShortBox.ratio}:1`
    : 'no qualifying setup — market is sideways/choppy';
  const latestVolume = setup.relativeVolume[setup.relativeVolume.length - 1];
  // An empty relativeVolume means the data source reported no volume at all
  // (Yahoo does this for forex) — say so rather than implying a reading.
  const relativeVolumeLine =
    setup.relativeVolume.length === 0
      ? 'n/a - no volume data available for this instrument'
      : latestVolume
        ? `${latestVolume.ratio.toFixed(2)}x`
        : 'n/a';

  return `Analyze this price-action chart for ${displayPair} (${instrument}), ${timeframe} timeframe.

Trend: ${setup.trend}
Key Levels: ${levels}
Fibonacci Retracement: ${fib}
Long/Short Setup: ${box}
Relative Volume (latest bar vs 20-bar avg): ${relativeVolumeLine}

Return the JSON only.`;
}

interface PriceActionLLMResponse {
  confidence: number;
  timeframeObservations: { trend: string; levels: string; fib: string; volume: string };
  keyObservations: string[];
  reasoning: string;
  hashtags: string[];
}

export async function analyzeChartWithPriceAction(
  instrument: string,
  displayPair: string,
  timeframes: TimeframeValue[],
  setup: PriceActionSetup,
  chartImage: Uint8Array
): Promise<{ caption: ChartCaption; model: string }> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not set');
  }

  const chartBase64 = Buffer.from(chartImage).toString('base64');
  const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    maxRetries: 0,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eleusisfx.com',
      'X-Title': 'Eleusis FX Chart Analysis',
    },
  });

  const primaryTf = timeframes[0];
  const userPrompt = buildPriceActionUserPrompt(displayPair, instrument, primaryTf, setup);

  let lastErr: unknown;
  for (const model of VISION_MODEL_CANDIDATES) {
    try {
      const completion = await openrouter.chat.completions.create({
        model,
        max_tokens: 1024,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_PRICE_ACTION },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${chartBase64}`, detail: 'high' } },
            ],
          },
        ],
      });

      const content = completion.choices[0]?.message?.content ?? '';
      if (content.trim().length === 0) {
        console.warn(`[ChartAnalysis] ${model} returned empty content`);
        continue;
      }

      let parsed: PriceActionLLMResponse;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (parseErr) {
        console.warn(`[ChartAnalysis] ${model} returned invalid JSON:`, parseErr);
        continue;
      }

      if (typeof parsed.confidence !== 'number' || !parsed.reasoning) {
        console.warn(`[ChartAnalysis] ${model} missing required fields`);
        continue;
      }

      const overallBias = setup.trend === 'up' ? 'bullish' : setup.trend === 'down' ? 'bearish' : 'neutral';

      const caption: ChartCaption = {
        instrument,
        displayPair,
        generatedAt: new Date().toISOString(),
        timeframes,
        overallBias,
        confidence: parsed.confidence,
        keyLevels: {
          support: setup.keyLevels.support,
          resistance: setup.keyLevels.resistance,
          pivotPoints: [],
        },
        timeframeAnalysis: {
          [primaryTf]: {
            trend: setup.trend,
            bias: overallBias,
            keyObservations: parsed.keyObservations ?? [],
            indicatorSignals: {
              ema: parsed.timeframeObservations?.trend ?? '',
              rsi: parsed.timeframeObservations?.levels ?? '',
              macd: parsed.timeframeObservations?.fib ?? '',
              volume: parsed.timeframeObservations?.volume ?? '',
            },
          },
        },
        riskReward: setup.longShortBox
          ? {
              entry: setup.longShortBox.entry,
              stopLoss: setup.longShortBox.stopLoss,
              takeProfit: [setup.longShortBox.takeProfit],
              ratio: setup.longShortBox.ratio,
            }
          : { entry: 0, stopLoss: 0, takeProfit: [], ratio: 0 },
        reasoning: parsed.reasoning,
        disclaimer: 'Not financial advice. Trade at your own risk. Past performance does not guarantee future results.',
        hashtags: parsed.hashtags?.length
          ? parsed.hashtags
          : ['#EleusisFx', '#ForexSignals', '#PropFirm', `#${displayPair.replace('/', '')}`, '#PriceAction', '#FundedTrader'],
      };

      return { caption, model };
    } catch (err) {
      lastErr = err;
      console.warn(`[ChartAnalysis] ${model} failed:`, err);
    }
  }

  throw lastErr ?? new Error('All vision models failed');
}