import { getSupabaseAdminClient } from "@/lib/supabase/server";
import InstagramClient from "./InstagramClient";

export const dynamic = "force-dynamic";

export type IGEntry = {
  id: string;
  recorded_at: string;
  followers: number;
  following: number;
  posts: number;
  reach: number | null;
  impressions: number | null;
  profile_visits: number | null;
  website_clicks: number | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
  notes: string | null;
};

export default async function InstagramMetricsPage() {
  const supabase = await getSupabaseAdminClient();

  const { data: entries, error } = await supabase
    .from("instagram_metrics")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(52);

  return <InstagramClient entries={entries ?? []} dbError={!!error} />;
}
