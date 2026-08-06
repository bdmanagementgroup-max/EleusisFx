import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createChartAnalysis, listChartAnalyses, type ChartAnalysisJobInput } from '@/lib/chart-analysis';
import { AGENT_BIAS_INSTRUMENTS } from '@/lib/agent-bias/instruments';
import { runChartAnalysisJobWithId } from '@/lib/chart-analysis/orchestrator';
import type { TimeframeValue } from '@/lib/chart-analysis/types';

export async function POST(request: Request) {
  try {
    // Check admin authentication
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { instrument, timeframes } = body;

    if (!instrument || !timeframes || !Array.isArray(timeframes)) {
      return Response.json({ error: 'Missing required fields: instrument, timeframes' }, { status: 400 });
    }

    // Validate instrument
    const instrumentData = AGENT_BIAS_INSTRUMENTS.find(i => i.yahoo === instrument);
    if (!instrumentData) {
      return Response.json({ error: 'Invalid instrument' }, { status: 400 });
    }

    // Validate timeframes
    const validTimeframes = ['4H', '1D', '1W'];
    const invalidTimeframes = timeframes.filter((tf: string) => !validTimeframes.includes(tf));
    if (invalidTimeframes.length > 0) {
      return Response.json({ error: `Invalid timeframes: ${invalidTimeframes.join(', ')}` }, { status: 400 });
    }

    // Create job input
    const jobInput: ChartAnalysisJobInput = {
      instrument,
      displayPair: instrumentData.display,
      timeframes: timeframes as TimeframeValue[],
      createdBy: user.id,
    };

    // Start the analysis job (fire and forget with job ID)
    // The job runs asynchronously - we return the job ID immediately
    const record = await createChartAnalysis(jobInput);

    // Trigger background processing
    // In production, you'd use a queue (Vercel Queues) or run with extended timeout
    // For now, run inline but respond immediately with job ID
    runChartAnalysisJobWithId(record.id, jobInput).catch(err => {
      console.error('[ChartAnalysis] Background job failed:', err);
    });

    return Response.json({
      success: true,
      jobId: record.id,
      status: 'processing',
      message: 'Chart analysis started. Poll for completion.',
    });

  } catch (err) {
    console.error('[ChartAnalysis API] POST error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as 'pending' | 'processing' | 'completed' | 'failed' | null;
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const analyses = await listChartAnalyses({ status: status ?? undefined, limit, offset });

    // Strip the (potentially large) PNG bytes from the list response — detail endpoint provides it
    const stripped = analyses.map(({ chart_image, ...rest }) => ({ ...rest, chart_image: null }));

    return Response.json({ analyses: stripped });

  } catch (err) {
    console.error('[ChartAnalysis API] GET error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}