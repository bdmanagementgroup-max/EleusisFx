"use client";
import { useState } from "react";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function NotificationsList({ notifications: initial }: { notifications: Notification[] }) {
  const [items, setItems] = useState<Notification[]>(initial);

  async function markRead(id: string) {
    const res = await fetch(`/api/dashboard/notifications/${id}`, { method: "PATCH" });
    if (res.ok) {
      setItems((prev) =>
        prev.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
    }
  }

  if (items.length === 0) {
    return (
      <div style={{
        padding: "48px 28px",
        background: "#08090f",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 4,
        textAlign: "center",
      }}>
        <p style={{ color: "rgba(210,220,240,0.58)", fontSize: 13, margin: 0 }}>
          No notifications yet.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((n) => (
        <div
          key={n.id}
          style={{
            padding: "20px 24px",
            background: "#08090f",
            border: `1px solid ${n.read_at ? "rgba(255,255,255,0.06)" : "rgba(79,142,247,0.2)"}`,
            borderRadius: 4,
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          {/* Unread dot */}
          <div style={{
            flexShrink: 0,
            width: 7, height: 7,
            borderRadius: "50%",
            marginTop: 5,
            background: n.read_at ? "rgba(255,255,255,0.1)" : "#4f8ef7",
          }} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-syne), Syne, sans-serif",
              fontWeight: 700, fontSize: 14,
              color: n.read_at ? "rgba(210,220,240,0.58)" : "#e8eaf0",
              marginBottom: n.body ? 6 : 0,
            }}>
              {n.title}
            </div>
            {n.body && (
              <p style={{
                color: "rgba(210,220,240,0.58)", fontSize: 13,
                margin: "0 0 10px", lineHeight: 1.6,
              }}>
                {n.body}
              </p>
            )}
            <div style={{ fontSize: 11, color: "rgba(210,220,240,0.3)", letterSpacing: 0.5 }}>
              {formatDate(n.created_at)}
            </div>
          </div>

          {!n.read_at && (
            <button
              onClick={() => markRead(n.id)}
              style={{
                flexShrink: 0,
                padding: "7px 14px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 2,
                color: "rgba(210,220,240,0.58)",
                fontSize: 10,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Mark read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
