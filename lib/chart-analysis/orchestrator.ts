/**
 * Chart Analysis Orchestrator
 * Main entry point that coordinates the full chart analysis pipeline
 */

import { fetchMarketDataForTimeframes, fetchOHLCVWithVolume } from './market-data';
import { analyzeChartWithVision, analyzeChartWithPriceAction } from './llm-analysis';
import { generateChartScreenshot } from './browser';
import { generatePriceActionScreenshot } from './browser-price-action';
import { computePriceActionSetup } from './price-action';
import { createChartAnalysis, updateChartAnalysisProcessing, completeChartAnalysis, failChartAnalysis, getChartAnalysis } from './storage';
import type { ChartAnalysisJobInput, ChartAnalysisJobResult, ChartCaption } from './types';

/**
 * Run chart analysis job, creating the database record itself.
 * Use this when no record exists yet for the job.
 */
export async function runChartAnalysisJob(input: ChartAnalysisJobInput): Promise<ChartAnalysisJobResult> {
  const record = await createChartAnalysis(input);
  return runChartAnalysisPipeline(record.id, input);
}

/**
 * Run chart analysis job for an already-created database record.
 * Use this when the caller has already inserted the record (e.g. to return the job ID immediately).
 */
export async function runChartAnalysisJobWithId(jobId: string, input: ChartAnalysisJobInput): Promise<ChartAnalysisJobResult> {
  return runChartAnalysisPipeline(jobId, input);
}

async function runChartAnalysisPipeline(jobId: string, input: ChartAnalysisJobInput): Promise<ChartAnalysisJobResult> {
  const startTime = Date.now();
  const { instrument, displayPair, timeframes, config } = input;

  console.log(`[ChartAnalysis] Starting job ${jobId} for ${displayPair} (${instrument}), config=${config}`);

  try {
    await updateChartAnalysisProcessing(jobId);

    let chartImage: Uint8Array;
    let caption: ChartCaption;
    let model: string;
    let indicatorsUsed: string[];

    if (config === 'price_action') {
      console.log(`[ChartAnalysis] Fetching OHLCV+volume for price-action setup...`);
      const ohlcv = await fetchOHLCVWithVolume(instrument, timeframes[0]);
      const setup = computePriceActionSetup(ohlcv);

      console.log(`[ChartAnalysis] Rendering price-action chart...`);
      chartImage = await generatePriceActionScreenshot(ohlcv, setup);

      console.log(`[ChartAnalysis] Analyzing price-action chart with LLM vision...`);
      ({ caption, model } = await analyzeChartWithPriceAction(instrument, displayPair, timeframes, setup, chartImage));

      indicatorsUsed = ['Trendline', 'FibRetracement', 'KeyLevels', 'LongShortBox'];
      // Forex feeds report all-zero volume — don't claim we used it.
      if (ohlcv.volume.some((v) => v !== 0)) indicatorsUsed.push('Volume');
    } else {
      console.log(`[ChartAnalysis] Fetching market data for ${timeframes.join(', ')}...`);
      const marketData = await fetchMarketDataForTimeframes(instrument, timeframes);

      console.log(`[ChartAnalysis] Generating TradingView chart screenshot...`);
      chartImage = await generateChartScreenshot(instrument, timeframes);

      console.log(`[ChartAnalysis] Analyzing chart with LLM vision...`);
      ({ caption, model } = await analyzeChartWithVision(instrument, displayPair, timeframes, marketData, chartImage));

      indicatorsUsed = ['EMA20', 'EMA50', 'EMA200', 'RSI14', 'MACD12_26_9', 'Volume'];
    }

    const durationMs = Date.now() - startTime;
    const metadata = {
      indicators_used: indicatorsUsed,
      duration_ms: durationMs,
      model,
      timeframes_analyzed: timeframes,
    };

    await completeChartAnalysis(jobId, chartImage, caption, metadata);

    const completedRecord = await getChartAnalysis(jobId);

    console.log(`[ChartAnalysis] Job completed in ${durationMs}ms for ${displayPair}`);
    return { success: true, record: completedRecord! };

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    const durationMs = Date.now() - startTime;

    console.error(`[ChartAnalysis] Job failed for ${displayPair}:`, errorMsg);

    await failChartAnalysis(jobId, errorMsg, { duration_ms: durationMs });

    return { success: false, error: errorMsg };
  }
}
