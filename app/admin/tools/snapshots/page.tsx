import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SnapshotsClient from "./SnapshotsClient";

export const dynamic = "force-dynamic";

export default async function SnapshotsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/login");

  const db = await getSupabaseAdminClient();
  const { data, error } = await db
    .from("trading_snapshots")
    .select("id, created_at, session, focus, news_level")
    .order("created_at", { ascending: false });

  return <SnapshotsClient initial={data ?? []} dbError={error?.message} />;
}
