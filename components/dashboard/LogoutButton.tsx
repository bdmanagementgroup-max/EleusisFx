"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };
  return (
    <button
      onClick={handleLogout}
      style={{
        fontFamily: "var(--font-syne), Syne, sans-serif",
        fontSize: 11, fontWeight: 600, letterSpacing: 2,
        textTransform: "uppercase", color: "rgba(232,234,240,0.38)",
        background: "transparent", border: "none", cursor: "pointer",
        padding: "8px 16px", transition: "color 0.2s",
      }}
    >
      Sign Out
    </button>
  );
}
