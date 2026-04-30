import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import TradingAnalysisClient from "./TradingAnalysisClient";

export const dynamic = "force-dynamic";

export default async function TradingAnalysisPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/login");
  }

  return <TradingAnalysisClient />;
}
