import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const BASE = "https://graph.facebook.com/v20.0";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const igId  = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!igId || !token) {
    return NextResponse.json({ error: "Instagram env vars not set" }, { status: 500 });
  }

  const [accountRes, insightsRes, mediaRes] = await Promise.all([
    fetch(`${BASE}/${igId}?fields=username,followers_count,follows_count,media_count&access_token=${token}`),
    fetch(`${BASE}/${igId}/insights?metric=reach,impressions,profile_views,website_clicks&period=days_28&access_token=${token}`),
    fetch(`${BASE}/${igId}/media?fields=id,caption,timestamp,media_type,like_count,comments_count,thumbnail_url,media_url&limit=9&access_token=${token}`),
  ]);

  const [account, insightsData, mediaData] = await Promise.all([
    accountRes.json(),
    insightsRes.json(),
    mediaRes.json(),
  ]);

  // Token expired or invalid
  if (account.error) {
    const code = account.error.code;
    const expired = code === 190 || code === 102;
    return NextResponse.json(
      { error: expired ? "TOKEN_EXPIRED" : account.error.message },
      { status: 401 }
    );
  }

  // Parse insights — take the most recent value from each metric
  const insights: Record<string, number | null> = {
    reach: null, impressions: null, profile_views: null, website_clicks: null,
  };
  if (insightsData.data) {
    for (const metric of insightsData.data) {
      const vals = metric.values ?? [];
      if (vals.length) insights[metric.name] = vals[vals.length - 1]?.value ?? null;
    }
  }

  return NextResponse.json({
    account: {
      username:  account.username,
      followers: account.followers_count,
      following: account.follows_count,
      posts:     account.media_count,
    },
    insights,
    media: mediaData.data ?? [],
  });
}
