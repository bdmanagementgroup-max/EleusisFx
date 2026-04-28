import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NotificationsList from "./NotificationsList";

export const dynamic = "force-dynamic";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

export default async function NotificationsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("client_notifications")
    .select("id, title, body, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const notifications: Notification[] = data ?? [];
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div style={{ padding: "40px 40px 80px", maxWidth: 720 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>
        Account
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
        <h1 style={{
          fontFamily: "var(--font-syne), Syne, sans-serif",
          fontWeight: 800, fontSize: 32, letterSpacing: -1,
          color: "#e8eaf0", margin: 0,
        }}>
          Notifications
        </h1>
        {unreadCount > 0 && (
          <span style={{
            padding: "3px 9px",
            background: "#4f8ef7",
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
          }}>
            {unreadCount}
          </span>
        )}
      </div>

      <NotificationsList notifications={notifications} />
    </div>
  );
}
