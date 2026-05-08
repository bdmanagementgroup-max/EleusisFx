import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function isAiCoachEnabled(): Promise<boolean> {
  try {
    const supabase = await getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("setting_value")
      .eq("setting_key", "ai_coach_enabled")
      .single();

    if (error || !data) return false;

    const value = data.setting_value;
    return value === true || value === "true";
  } catch {
    return false;
  }
}

export async function setAiCoachEnabled(enabled: boolean): Promise<void> {
  const supabase = await getSupabaseAdminClient();
  await supabase
    .from("app_settings")
    .update({ setting_value: enabled })
    .eq("setting_key", "ai_coach_enabled");
}
