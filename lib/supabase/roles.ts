import { getSupabaseAdminClient } from "./server";

export async function addSubscriberRole(userId: string): Promise<void> {
  const supabase = await getSupabaseAdminClient();

  const { data, error: fetchError } = await supabase.auth.admin.getUserById(userId);
  if (fetchError || !data?.user) throw new Error(`User not found: ${userId}`);

  const user = data.user as any;
  const currentRoles = (user.app_metadata?.roles as string[]) || [];
  const updatedRoles = [...new Set([...currentRoles, "subscriber"])]; // Avoid duplicates

  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { ...user.app_metadata, roles: updatedRoles, role: "subscriber" },
  });

  if (updateError) throw new Error(`Failed to update user: ${updateError.message}`);
}

export async function removeSubscriberRole(userId: string): Promise<void> {
  const supabase = await getSupabaseAdminClient();

  const { data, error: fetchError } = await supabase.auth.admin.getUserById(userId);
  if (fetchError || !data?.user) throw new Error(`User not found: ${userId}`);

  const user = data.user as any;
  const currentRoles = (user.app_metadata?.roles as string[]) || [];
  const updatedRoles = currentRoles.filter((r) => r !== "subscriber");

  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { ...user.app_metadata, roles: updatedRoles, role: updatedRoles[0] || null },
  });

  if (updateError) throw new Error(`Failed to update user: ${updateError.message}`);
}
