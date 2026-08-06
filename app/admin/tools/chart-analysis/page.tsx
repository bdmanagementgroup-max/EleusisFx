import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import ChartAnalysisClient from "./ChartAnalysisClient";

export const dynamic = "force-dynamic";

export default async function ChartAnalysisPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/login");
  }

  return <ChartAnalysisClient />;
}