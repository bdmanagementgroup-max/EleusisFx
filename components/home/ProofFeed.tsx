import { getSupabaseAdminClient } from "@/lib/supabase/server";
import ProofFeedTicker from "./ProofFeedTicker";

export default async function ProofFeed() {
  let data: { account_size_usd: number | null; challenge: string | null }[] | null = null;
  try {
    const supabase = await getSupabaseAdminClient();
    const result = await supabase
      .from("past_clients")
      .select("account_size_usd, challenge")
      .order("created_at", { ascending: false })
      .limit(20);
    data = result.data;
  } catch {
    return null;
  }

  if (!data || data.length === 0) return null;

  const items = data.map((row) => {
    const size = row.account_size_usd
      ? `$${Math.round(row.account_size_usd / 1000)}K`
      : null;
    const firm = row.challenge ?? "Prop Firm Challenge";
    return size ? `Client passed ${size} — ${firm}` : `Client passed — ${firm}`;
  });

  return <ProofFeedTicker items={items} />;
}
