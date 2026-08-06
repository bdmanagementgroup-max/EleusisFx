/**
 * Chart Analysis LLM Vision Analysis
 * Uses OpenRouter vision models to analyze chart screenshots and generate structured captions
 */

import OpenAI from 'openai';
import type { ChartCaption, TimeframeValue } from './types';
import type { TimeframeData } from './market-data';

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