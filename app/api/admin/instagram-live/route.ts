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

  // Phase 1: account, rolling insights, media list, audience demographics — all parallel
  const [accountRes, insightsRes, mediaRes, demographicsRes] = await Promise.all([
    fetch(`${BASE}/${igId}?fields=username,followers_count,follows_count,media_count&access_token=${token}`),
    fetch(`${BASE}/${igId}/insights?metric=reach,impressions,profile_views,website_clicks&period=days_28&access_token=${token}`),
    fetch(`${BASE}/${igId}/media?fields=id,caption,timestamp,media_type,like_count,comments_count,thumbnail_url,media_url&limit=9&access_token=${token}`),
    fetch(`${BASE}/${igId}/insights?metric=audience_gender_age,audience_country&period=lifetime&access_token=${token}`),
  ]);

  const [account, insightsData, mediaData, demographicsData] = await Promise.all([
    accountRes.json(),
    insightsRes.json(),
    mediaRes.json(),
    demographicsRes.json(),
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

  // Phase 2: per-post insights — parallel across all posts
  const posts: any[] = mediaData.data ?? [];
  const postInsightsResults = await Promise.all(
    posts.map((post) =>
      fetch(`${BASE}/${post.id}/insights?metric=impressions,reach,saved&access_token=${token}`)
        .then((r) => r.json())
        .catch(() => ({ data: [] }))
    )
  );

  // Map post id → insights values
  const postInsightsMap: Record<string, { impressions: number | null; reach: number | null; saved: number | null }> = {};
  posts.forEach((post, i) => {
    const data: any[] = postInsightsResults[i]?.data ?? [];
    const get = (name: string): number | null => {
      const metric = data.find((m) => m.name === name);
      return metric?.values?.[0]?.value ?? null;
    };
    postInsightsMap[post.id] = {
      impressions: get("impressions"),
      reach:       get("reach"),
      saved:       get("saved"),
    };
  });

  // Parse rolling insights (28d)
  const insights: Record<string, number | null> = {
    reach: null, impressions: null, profile_views: null, website_clicks: null,
  };
  if (insightsData.data) {
    for (const metric of insightsData.data) {
      const vals = metric.values ?? [];
      if (vals.length) insights[metric.name] = vals[vals.length - 1]?.value ?? null;
    }
  }

  // Parse audience demographics — gracefully skip if permission not granted
  const genderAge: Record<string, number> = {};
  const country: Record<string, number>   = {};
  if (demographicsData.data) {
    for (const metric of demographicsData.data) {
      const value = metric.values?.[0]?.value ?? {};
      if (metric.name === "audience_gender_age") Object.assign(genderAge, value);
      if (metric.name === "audience_country")    Object.assign(country, value);
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
    media: posts.map((post) => ({
      ...post,
      postInsights: postInsightsMap[post.id] ?? { impressions: null, reach: null, saved: null },
    })),
    demographics: {
      gender_age: genderAge,
      country,
    },
  });
}
