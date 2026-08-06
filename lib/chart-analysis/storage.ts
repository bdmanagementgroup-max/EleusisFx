/**
 * Chart Analysis Storage
 * Supabase database operations for chart analyses
 */

import { getSupabaseAdminClient } from '@/lib/supabase/server';
import type { ChartAnalysisRecord, ChartAnalysisJobInput, ChartCaption, ChartAnalysisMetadata } from './types';

export async function createChartAnalysis(input: ChartAnalysisJobInput): Promise<ChartAnalysisRecord> {
  const supabase = await getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('chart_analyses')
    .insert({
      instrument: input.instrument,
      display_pair: input.displayPair,
      timeframes: input.timeframes,
      status: 'pending',
      caption_json: {},
      metadata: {
        indicators_used: [],
        duration_ms: 0,
        model: '',
      },
      created_by: input.createdBy,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create chart analysis: ${error.message}`);
  }

  return mapRecord(data);
}

export async function updateChartAnalysisProcessing(id: string): Promise<void> {
  const supabase = await getSupabaseAdminClient();

  const { error } = await supabase
    .from('chart_analyses')
    .update({ status: 'processing' })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update status to processing: ${error.message}`);
  }
}

export async function completeChartAnalysis(
  id: string,
  chartImage: Uint8Array,
  caption: ChartCaption,
  metadata: ChartAnalysisMetadata
): Promise<void> {
  const supabase = await getSupabaseAdminClient();

  // PostgREST expects bytea columns as a \x-prefixed hex literal string —
  // passing the raw Uint8Array gets JSON.stringify'd into {"0":137,"1":80,...}
  // instead of being encoded as binary, corrupting the stored image.
  const chartImageHex = `\\x${Buffer.from(chartImage).toString('hex')}`;

  const { error } = await supabase
    .from('chart_analyses')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      chart_image: chartImageHex,
      caption_json: caption,
      metadata: metadata,
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to complete chart analysis: ${error.message}`);
  }
}

export async function failChartAnalysis(id: string, errorMsg: string, partialMetadata?: Partial<ChartAnalysisMetadata>): Promise<void> {
  const supabase = await getSupabaseAdminClient();

  const { error } = await supabase
    .from('chart_analyses')
    .update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      metadata: {
        indicators_used: [],
        duration_ms: 0,
        model: '',
        error: errorMsg,
        ...partialMetadata,
      },
    })
    .eq('id', id);

  if (error) {
    console.error(`Failed to mark chart analysis as failed: ${error.message}`);
  }
}

export async function getChartAnalysis(id: string): Promise<ChartAnalysisRecord | null> {
  const supabase = await getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('chart_analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to get chart analysis: ${error.message}`);
  }

  return mapRecord(data);
}

export async function listChartAnalyses(
  options: {
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    limit?: number;
    offset?: number;
  } = {}
): Promise<ChartAnalysisRecord[]> {
  const supabase = await getSupabaseAdminClient();

  let query = supabase
    .from('chart_analyses')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list chart analyses: ${error.message}`);
  }

  return (data || []).map(mapRecord);
}

export async function deleteChartAnalysis(id: string): Promise<void> {
  const supabase = await getSupabaseAdminClient();

  const { error } = await supabase
    .from('chart_analyses')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete chart analysis: ${error.message}`);
  }
}

function mapRecord(row: {
  id: string;
  created_at: string;
  completed_at: string | null;
  instrument: string;
  display_pair: string;
  timeframes: string[];
  status: string;
  chart_image: string | null;
  caption_json: ChartCaption;
  metadata: ChartAnalysisMetadata;
  created_by: string | null;
}): ChartAnalysisRecord {
  return {
    id: row.id,
    created_at: row.created_at,
    completed_at: row.completed_at,
    instrument: row.instrument,
    display_pair: row.display_pair,
    timeframes: row.timeframes,
    status: row.status as ChartAnalysisRecord['status'],
    chart_image: decodeBytea(row.chart_image),
    caption_json: row.caption_json,
    metadata: row.metadata,
    created_by: row.created_by,
  };
}

// PostgREST returns bytea columns as a \x-prefixed hex string over JSON, not raw bytes
function decodeBytea(value: string | null): Uint8Array | null {
  if (!value) return null;
  const hex = value.startsWith('\\x') ? value.slice(2) : value;
  return new Uint8Array(Buffer.from(hex, 'hex'));
}
