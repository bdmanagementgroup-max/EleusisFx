"use client";

import { useEffect, useState, useCallback } from "react";

type Email = {
  id: string;
  from_address: string;
  from_name: string | null;
  subject: string | null;
  text_body: string | null;
  html_body: string | null;
  received_at: string;
  read_at: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminInboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Email | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("unread");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/inbox");
    if (res.ok) setEmails(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function markRead(email: Email) {
    if (email.read_at) return;
    await fetch(`/api/admin/inbox/${email.id}`, { method: "PATCH" });
    setEmails((prev) => prev.map((e) => e.id === email.id ? { ...e, read_at: new Date().toISOString() } : e));
    setSelected((prev) => prev?.id === email.id ? { ...prev, read_at: new Date().toISOString() } : prev);
  }

  function open(email: Email) {
    setSelected(email);
    void markRead(email);
  }

  const visible = filter === "unread" ? emails.filter((e) => !e.read_at) : emails;
  const unreadCount = emails.filter((e) => !e.read_at).length;

  return (
    <div style={{ padding: "40px 48px 80px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Admin</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5 }}>
          Inbox
          {unreadCount > 0 && (
            <span style={{ marginLeft: 12, fontSize: 13, fontFamily: "monospace", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "2px 10px", letterSpacing: 0, fontWeight: 700 }}>
              {unreadCount} unread
            </span>
          )}
        </h1>
        <div style={{ display: "flex", gap: 2 }}>
          {(["unread", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
                padding: "7px 16px", cursor: "pointer", border: "1px solid",
                background: filter === f ? "#4f8ef7" : "transparent",
                borderColor: filter === f ? "#4f8ef7" : "rgba(255,255,255,0.1)",
                color: filter === f ? "#020305" : "rgba(210,220,240,0.6)",
                fontWeight: 700, transition: "all 0.15s",
              }}
            >
              {f === "unread" ? `Unread (${unreadCount})` : `All (${emails.length})`}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(210,220,240,0.3)", padding: "40px 0" }}>loading...</div>
      )}

      {!loading && visible.length === 0 && (
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(210,220,240,0.3)", padding: "40px 0" }}>
          {filter === "unread" ? "No unread emails." : "No emails received yet."}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 1, background: "rgba(255,255,255,0.04)" }}>
        {/* Email list */}
        <div>
          {visible.map((email) => (
            <div
              key={email.id}
              onClick={() => open(email)}
              style={{
                padding: "16px 20px", cursor: "pointer", background: selected?.id === email.id ? "rgba(79,142,247,0.06)" : "#020305",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                borderLeft: !email.read_at ? "2px solid #4f8ef7" : "2px solid transparent",
                transition: "background 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: email.read_at ? 500 : 700, fontSize: 13, color: "#e8eaf0" }}>
                  {email.from_name ? `${email.from_name}` : email.from_address}
                </div>
                <div style={{ fontSize: 10, color: "rgba(210,220,240,0.4)", whiteSpace: "nowrap", marginLeft: 12 }}>
                  {formatDate(email.received_at)}
                </div>
              </div>
              <div style={{ fontSize: 12, color: email.read_at ? "rgba(210,220,240,0.5)" : "rgba(210,220,240,0.88)", marginBottom: 2 }}>
                {email.subject ?? "(no subject)"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(210,220,240,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {email.from_name ? email.from_address : ""}
              </div>
            </div>
          ))}
        </div>

        {/* Email detail panel */}
        {selected && (
          <div style={{ background: "#08090f", padding: "24px 28px", borderLeft: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#e8eaf0", marginBottom: 4 }}>
                  {selected.subject ?? "(no subject)"}
                </div>
                <div style={{ fontSize: 11, color: "rgba(210,220,240,0.5)" }}>
                  From: {selected.from_name ? `${selected.from_name} <${selected.from_address}>` : selected.from_address}
                </div>
                <div style={{ fontSize: 11, color: "rgba(210,220,240,0.3)", marginTop: 2 }}>
                  {formatDate(selected.received_at)}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", color: "rgba(210,220,240,0.4)", fontSize: 18, cursor: "pointer", padding: "0 4px" }}
              >
                ✕
              </button>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 20 }} />

            {selected.html_body ? (
              <iframe
                srcDoc={selected.html_body}
                style={{ width: "100%", minHeight: 400, border: "none", background: "#fff", borderRadius: 2 }}
                title="Email content"
                sandbox="allow-same-origin"
              />
            ) : (
              <div style={{ fontSize: 13, color: "rgba(210,220,240,0.8)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {selected.text_body ?? "(no content)"}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <a
                href={`mailto:${selected.from_address}?subject=Re: ${encodeURIComponent(selected.subject ?? "")}`}
                style={{
                  display: "inline-block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
                  fontWeight: 700, padding: "9px 20px", background: "#4f8ef7", color: "#020305",
                  textDecoration: "none", transition: "opacity 0.2s",
                }}
              >
                Reply →
              </a>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .inbox-page { padding: 72px 16px 60px !important; }
        }
      `}</style>
    </div>
  );
}
