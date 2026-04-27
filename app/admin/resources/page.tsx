import { getSupabaseAdminClient } from "@/lib/supabase/server";
import ResourcesClient from "./ResourcesClient";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const supabase = await getSupabaseAdminClient();
  const { data } = await supabase
    .from("resources")
    .select("id, category, title, url, description, active")
    .order("sort_order", { ascending: true });

  return <ResourcesClient initial={data ?? []} />;
}
