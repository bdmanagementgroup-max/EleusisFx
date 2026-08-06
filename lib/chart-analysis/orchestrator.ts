/**
 * Chart Analysis Orchestrator
 * Main entry point that coordinates the full chart analysis pipeline
 */

import { fetchMarketDataForTimeframes } from './market-data';
import { analyzeChartWithVision } from './llm-analysis';
import { generateChartScreenshot } from './browser';
import { createChartAnalysis, updateChartAnalysisProcessing, completeChartAnalysis, failChartAnalysis, getChartAnalysis } from './storage';
import type { ChartAnalysisJobInput, ChartAnalysisJobResult } from './types';

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
  const { instrument, displayPair, timeframes } = input;

  console.log(`[ChartAnalysis] Starting job ${jobId} for ${displayPair} (${instrument})`);

  try {
    // Step 1: Update status to processing
    await updateChartAnalysisProcessing(jobId);

    // Step 2: Fetch market data for all timeframes
    console.log(`[ChartAnalysis] Fetching market data for ${timeframes.join(', ')}...`);
    const marketData = await fetchMarketDataForTimeframes(instrument, timeframes);

    // Step 3: Generate chart screenshot via TradingView embed widget
    console.log(`[ChartAnalysis] Generating TradingView chart screenshot...`);
    const chartImage = await generateChartScreenshot(instrument, timeframes);

    // Step 4: Analyze with LLM vision
    console.log(`[ChartAnalysis] Analyzing chart with LLM vision...`);
    const { caption, model } = await analyzeChartWithVision(
      instrument,
      displayPair,
      timeframes,
      marketData,
      chartImage
    );

    // Step 5: Complete the job
    const durationMs = Date.now() - startTime;
    const metadata = {
      indicators_used: ['EMA20', 'EMA50', 'EMA200', 'RSI14', 'MACD12_26_9', 'Volume'],
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