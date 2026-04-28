import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const initialData = {
    display_name: profile?.display_name ?? (user.user_metadata?.full_name as string) ?? "",
    phone:        profile?.phone ?? "",
    address_1:    profile?.address_1 ?? "",
    city:         profile?.city ?? "",
    postcode:     profile?.postcode ?? "",
    country:      profile?.country ?? "",
    avatar_url:   profile?.avatar_url ?? "",
  };

  return (
    <div style={{ padding: "40px 40px 80px", maxWidth: 720 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>
        Account
      </div>
      <h1 style={{
        fontFamily: "var(--font-syne), Syne, sans-serif",
        fontWeight: 800, fontSize: 32, letterSpacing: -1,
        color: "#e8eaf0", margin: "0 0 48px",
      }}>
        Profile
      </h1>
      <ProfileForm email={user.email ?? ""} initialData={initialData} />
    </div>
  );
}
