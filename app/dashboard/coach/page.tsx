import CoachClient from "./CoachClient";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: metrics } = await supabase
    .from("client_metrics")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  return <CoachClient metrics={metrics} />;
}
