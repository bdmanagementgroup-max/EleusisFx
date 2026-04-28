"use client";
import { useState } from "react";

export type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  user_email: string;
  user_name: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#020305",
  border: "1px solid rgba(255,255,255,0.06)", color: "#e8eaf0",
  fontFamily: "inherit", fontSize: 13, padding: "10px 14px",
  outline: "none", borderRadius: 0, boxSizing: "border-box",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function TicketRow({ ticket: initial }: { ticket: Ticket }) {
  const [ticket, setTicket] = useState(initial);
  const [expanded, setExpanded]   = useState(false);
  const [replying, setReplying]   = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending]     = useState(false);
  const [sent, setSent]           = useState(false);
  const [sendError, setSendError] = useState("");
  const [toggling, setToggling]   = useState(false);

  async function toggleStatus() {
    setToggling(true);
    const newStatus = ticket.status === "open" ? "closed" : "open";
    const res = await fetch("/api/admin/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ticket.id, status: newStatus }),
    });
    if (res.ok) setTicket((t) => ({ ...t, status: newStatus }));
    setToggling(false);
  }

  async function sendReply() {
    if (!replyBody.trim()) return;
    setSending(true);
    setSendError("");
    const subject = `Re: ${ticket.subject}`;
    const html = `<p>${replyBody.replace(/\n/g, "<br>")}</p><hr style="border:none;border-top:1px solid #eee;margin:24px 0"><p style="font-size:12px;color:#888;">Original message from ${ticket.user_name}:<br><em>${ticket.message}</em></p>`;
    const res = await fetch("/api/admin/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: [ticket.user_email], subject, html }),
    });
    const json = await res.json();
    setSending(false);
    if (json.error) {
      setSendError(json.error);
    } else {
      setSent(true);
      setReplyBody("");
      // Auto-close the ticket after reply
      await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ticket.id, status: "closed" }),
      });
      setTicket((t) => ({ ...t, status: "closed" }));
      setTimeout(() => { setSent(false); setReplying(false); }, 2000);
    }
  }

  const isOpen = ticket.status === "open";

  return (
    <div style={{
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      background: isOpen ? "rgba(79,142,247,0.02)" : "transparent",
    }}>
      {/* Ticket header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto auto auto",
          padding: "18px 28px",
          alignItems: "center",
          gap: 16,
          cursor: "pointer",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Status dot */}
        <div style={{
          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
          background: isOpen ? "#4f8ef7" : "rgba(255,255,255,0.15)",
        }} />

        {/* Subject + sender */}
        <div>
          <div style={{
            fontFamily: "var(--font-syne), Syne, sans-serif",
            fontWeight: isOpen ? 700 : 500,
            fontSize: 14,
            color: isOpen ? "#e8eaf0" : "rgba(210,220,240,0.58)",
          }}>
            {ticket.subject}
          </div>
          <div style={{ fontSize: 11, color: "rgba(210,220,240,0.4)", marginTop: 2 }}>
            {ticket.user_name !== ticket.user_email
              ? `${ticket.user_name} · ${ticket.user_email}`
              : ticket.user_email}
            {" · "}{formatDate(ticket.created_at)}
          </div>
        </div>

        {/* Status badge */}
        <span style={{
          fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
          padding: "3px 10px",
          background: isOpen ? "rgba(79,142,247,0.1)" : "rgba(34,197,94,0.08)",
          color: isOpen ? "#4f8ef7" : "#22c55e",
          whiteSpace: "nowrap",
        }}>
          {isOpen ? "Open" : "Closed"}
        </span>

        {/* Reply button */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(true); setReplying(true); }}
          style={{
            fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
            padding: "6px 14px", background: "rgba(79,142,247,0.1)",
            border: "1px solid rgba(79,142,247,0.25)", color: "#4f8ef7",
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          Reply
        </button>

        {/* Open/close toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleStatus(); }}
          disabled={toggling}
          style={{
            fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
            padding: "6px 14px", background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(210,220,240,0.5)",
            cursor: toggling ? "not-allowed" : "pointer", whiteSpace: "nowrap",
          }}
        >
          {isOpen ? "Close" : "Reopen"}
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: "0 28px 24px" }}>
          <div style={{
            background: "#020305",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "16px 20px",
            fontSize: 13, lineHeight: 1.7,
            color: "rgba(210,220,240,0.88)",
            marginBottom: replying ? 16 : 0,
            whiteSpace: "pre-wrap",
          }}>
            {ticket.message}
          </div>

          {replying && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.35)", marginBottom: 8 }}>
                Reply to {ticket.user_email}
              </div>
              <textarea
                rows={5}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Type your reply…"
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6, marginBottom: 12 }}
                autoFocus
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={sendReply}
                  disabled={sending || !replyBody.trim()}
                  style={{
                    padding: "10px 24px", background: "#4f8ef7", border: "none",
                    color: "#020305", fontSize: 11, letterSpacing: 2,
                    textTransform: "uppercase", fontFamily: "inherit",
                    cursor: sending || !replyBody.trim() ? "not-allowed" : "pointer",
                    opacity: sending || !replyBody.trim() ? 0.6 : 1,
                  }}
                >
                  {sending ? "Sending…" : "Send Reply"}
                </button>
                <button
                  onClick={() => { setReplying(false); setReplyBody(""); setSendError(""); }}
                  style={{
                    padding: "10px 20px", background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(210,220,240,0.5)", fontSize: 11, letterSpacing: 2,
                    textTransform: "uppercase", fontFamily: "inherit", cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                {sent && <span style={{ fontSize: 12, color: "#22c55e" }}>✓ Sent — ticket closed</span>}
                {sendError && <span style={{ fontSize: 12, color: "#ef4444" }}>{sendError}</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SupportAdminClient({ tickets }: { tickets: Ticket[] }) {
  const [filter, setFilter] = useState<"all" | "open" | "closed">("open");

  const filtered = tickets.filter((t) =>
    filter === "all" ? true : t.status === filter
  );

  const openCount = tickets.filter((t) => t.status === "open").length;

  return (
    <div style={{ padding: "56px 48px 80px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Client Portal</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, margin: 0 }}>
              Support
            </h1>
            {openCount > 0 && (
              <span style={{
                padding: "4px 10px", background: "#4f8ef7", borderRadius: 12,
                fontSize: 12, fontWeight: 700, color: "#fff",
              }}>
                {openCount} open
              </span>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {(["open", "all", "closed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px", fontSize: 10, letterSpacing: 2,
                textTransform: "uppercase", cursor: "pointer",
                background: filter === f ? "rgba(79,142,247,0.12)" : "transparent",
                border: `1px solid ${filter === f ? "rgba(79,142,247,0.3)" : "rgba(255,255,255,0.08)"}`,
                color: filter === f ? "#4f8ef7" : "rgba(210,220,240,0.5)",
                transition: "all 0.2s",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 28px", fontSize: 13, color: "rgba(210,220,240,0.5)", textAlign: "center" }}>
            No {filter === "all" ? "" : filter} support tickets.
          </div>
        ) : (
          filtered.map((t) => <TicketRow key={t.id} ticket={t} />)
        )}
      </div>

      <style>{`
        textarea:focus { border-color: rgba(79,142,247,0.5) !important; }
      `}</style>
    </div>
  );
}
