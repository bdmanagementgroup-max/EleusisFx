import { notFound } from "next/navigation";
import CoachClient from "./CoachClient";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isAiCoachEnabled } from "@/lib/features/isCoachEnabled";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const enabled = await isAiCoachEnabled();
  if (!enabled) {
    notFound();
  }

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: metrics } = await supabase
    .from("client_metrics")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  return <CoachClient metrics={metrics} />;
}
