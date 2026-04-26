"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  return (
    <button
      onClick={handleLogout}
      style={{
        fontFamily: "var(--font-syne), Syne, sans-serif",
        fontSize: 11, fontWeight: 600, letterSpacing: 2,
        textTransform: "uppercase", color: "rgba(210,220,240,0.88)",
        background: "transparent", border: "none", cursor: "pointer",
        padding: "8px 16px", transition: "color 0.2s",
      }}
    >
      Sign Out
    </button>
  );
}
