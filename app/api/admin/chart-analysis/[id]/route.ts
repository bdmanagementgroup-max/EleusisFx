import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getChartAnalysis, deleteChartAnalysis } from '@/lib/chart-analysis/storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const analysis = await getChartAnalysis(id);

    if (!analysis) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    // Check access: admins can see all, users only completed
    const isAdmin = user.app_metadata?.role === 'admin';
    if (!isAdmin && analysis.status !== 'completed') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Convert image to base64 for frontend
    let imageBase64: string | null = null;
    if (analysis.chart_image) {
      imageBase64 = Buffer.from(analysis.chart_image).toString('base64');
    }

    return Response.json({
      ...analysis,
      chart_image_base64: imageBase64,
    });

  } catch (err) {
    console.error('[ChartAnalysis Detail API] GET error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { id } = await params;
    await deleteChartAnalysis(id);

    return Response.json({ success: true });

  } catch (err) {
    console.error('[ChartAnalysis Detail API] DELETE error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}