import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import CoachClient from "./CoachClient";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <CoachClient />;
}
