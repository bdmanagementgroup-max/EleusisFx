"use client";
import { useState } from "react";

type Notif = {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
  user_id: string;
};

type Client = { id: string; label: string };

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#020305",
  border: "1px solid rgba(255,255,255,0.06)", color: "#e8eaf0",
  fontFamily: "var(--font-epilogue), Epilogue, sans-serif",
  fontSize: 13, fontWeight: 300, padding: "10px 14px",
  outline: "none", borderRadius: 0, boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 10, letterSpacing: 2,
  textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 8,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function NotificationsAdminClient({
  initial,
  clients,
}: {
  initial: Notif[];
  clients: Client[];
}) {
  const [notifs, setNotifs] = useState<Notif[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ user_id: "", title: "", body: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!form.user_id || !form.title.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (json.error) { setError(json.error); return; }
    setNotifs([json, ...notifs]);
    setForm({ user_id: "", title: "", body: "" });
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this notification?")) return;
    setNotifs(notifs.filter((n) => n.id !== id));
    await fetch("/api/admin/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  function clientLabel(user_id: string) {
    return clients.find((c) => c.id === user_id)?.label ?? user_id.slice(0, 8) + "…";
  }

  return (
    <div style={{ padding: "56px 48px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Client Portal</div>
          <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, margin: 0 }}>Notifications</h1>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError(""); }} className="new-btn">
          <span>{showForm ? "Cancel" : "+ Send Notification"}</span>
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "32px 28px", marginBottom: 32, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7 40%, transparent)" }} />
          <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 24 }}>New Notification</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Send to</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              >
                <option value="">— Select client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Title</label>
              <input
                style={inputStyle} placeholder="Notification title"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Message (optional)</label>
            <textarea
              rows={3} style={{ ...inputStyle, resize: "none" }}
              placeholder="Additional detail…"
              value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: 12, marginBottom: 16 }}>{error}</p>}

          <button onClick={handleSend} disabled={saving || !form.user_id || !form.title.trim()} className="new-btn">
            <span>{saving ? "Sending…" : "Send"}</span>
          </button>
        </div>
      )}

      <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
        {notifs.length === 0 && (
          <div style={{ padding: "40px 28px", fontSize: 13, color: "rgba(210,220,240,0.88)" }}>
            No notifications sent yet.
          </div>
        )}
        {notifs.map((n) => (
          <div
            key={n.id}
            style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto auto",
              padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,0.04)",
              alignItems: "center", gap: 20,
            }}
          >
            <div style={{
              width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
              background: n.read_at ? "rgba(255,255,255,0.15)" : "#4f8ef7",
            }} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 3 }}>
                <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 600, fontSize: 14, color: "#e8eaf0" }}>
                  {n.title}
                </span>
                <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: n.read_at ? "#22c55e" : "rgba(210,220,240,0.3)" }}>
                  {n.read_at ? "Read" : "Unread"}
                </span>
              </div>
              {n.body && <div style={{ fontSize: 12, color: "rgba(210,220,240,0.58)" }}>{n.body}</div>}
              <div style={{ fontSize: 11, color: "rgba(210,220,240,0.3)", marginTop: 4 }}>
                {clientLabel(n.user_id)} · {formatDate(n.created_at)}
              </div>
            </div>
            <button
              onClick={() => handleDelete(n.id)}
              style={{ fontSize: 11, color: "#ef4444", background: "transparent", border: "1px solid rgba(239,68,68,0.3)", padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .new-btn {
          font-family: var(--font-syne), Syne, sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; color: #020305; background: #e8eaf0;
          padding: 12px 24px; border: none; cursor: pointer;
          transition: all 0.25s; position: relative; overflow: hidden; border-radius: 0;
        }
        .new-btn::after {
          content: ''; position: absolute; inset: 0;
          background: #4f8ef7; transform: translateX(-101%); transition: transform 0.3s ease;
        }
        .new-btn:hover::after { transform: translateX(0); }
        .new-btn span { position: relative; z-index: 1; color: #020305; }
        .new-btn:hover span { color: #e8eaf0; }
        .new-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        input:focus, textarea:focus, select:focus { border-color: rgba(79,142,247,0.5) !important; }
      `}</style>
    </div>
  );
}
