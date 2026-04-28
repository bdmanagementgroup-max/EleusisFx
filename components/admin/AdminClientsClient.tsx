"use client";

import { useState } from "react";
import { PDF_OPTIONS, type PdfKey } from "@/lib/email/sendPdfEmail";

type Application = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  prop_firm: string | null;
  created_at: string | null;
  status: string;
  notes: string | null;
};

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  new:      { color: "#e8eaf0", bg: "rgba(232,234,240,0.05)" },
  reviewed: { color: "#7eb3ff", bg: "rgba(126,179,255,0.08)" },
  active:   { color: "#4f8ef7", bg: "rgba(79,142,247,0.08)" },
  funded:   { color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  pending:  { color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function ActionBtn({ onClick, disabled, color, children }: {
  onClick: () => void; disabled?: boolean; color?: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "transparent",
        border: `1px solid ${color ?? "rgba(255,255,255,0.1)"}`,
        color: color ?? "rgba(210,220,240,0.6)",
        fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase",
        padding: "4px 10px", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1, fontFamily: "inherit", whiteSpace: "nowrap",
        transition: "opacity 0.2s",
      }}
    >
      {children}
    </button>
  );
}

export default function AdminClientsClient({ applications: initial }: { applications: Application[] }) {
  const [apps, setApps] = useState(initial);
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(initial.map((a) => [a.id, a.status ?? "new"]))
  );
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(initial.map((a) => [a.id, a.notes ?? ""]))
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [resetLinks, setResetLinks] = useState<Record<string, string>>({});
  const [resetLoading, setResetLoading] = useState<string | null>(null);
  const [noteErrors, setNoteErrors] = useState<Record<string, string>>({});
  const [welcomeSending, setWelcomeSending] = useState<string | null>(null);
  const [welcomeSent, setWelcomeSent] = useState<Set<string>>(new Set());
  const [welcomeError, setWelcomeError] = useState<Record<string, string>>({});
  const [selectedPdf, setSelectedPdf] = useState<Record<string, PdfKey>>(
    Object.fromEntries(initial.map((a) => [a.id, PDF_OPTIONS[0].key]))
  );
  const [pdfSending, setPdfSending] = useState<string | null>(null);
  const [pdfSent, setPdfSent] = useState<Record<string, string>>({});
  const [pdfError, setPdfError] = useState<Record<string, string>>({});
  const [archiving, setArchiving] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<Record<string, string>>({});

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function updateStatus(id: string, newStatus: string) {
    const prev = statuses[id];
    setStatuses((s) => ({ ...s, [id]: newStatus }));
    setSavingStatus(id);
    const res = await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    setSavingStatus(null);
    if (!res.ok) setStatuses((s) => ({ ...s, [id]: prev }));
  }

  async function saveNotes(id: string) {
    setSavingNotes(id);
    setNoteErrors((e) => ({ ...e, [id]: "" }));
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes: notes[id] }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setNoteErrors((e) => ({ ...e, [id]: data.error ?? "Failed to save notes" }));
      }
    } catch {
      setNoteErrors((e) => ({ ...e, [id]: "Network error — notes not saved" }));
    }
    setSavingNotes(null);
  }

  async function deleteApp(id: string) {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    setDeleting(id);
    const res = await fetch("/api/applications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setApps((prev) => prev.filter((a) => a.id !== id));
    }
    setDeleting(null);
  }

  async function sendWelcome(id: string, email: string, firstName: string) {
    setWelcomeSending(id);
    setWelcomeError((e) => ({ ...e, [id]: "" }));
    try {
      const res = await fetch("/api/admin/send-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName }),
      });
      if (res.ok) {
        setWelcomeSent((prev) => new Set([...prev, id]));
      } else {
        const data = await res.json().catch(() => ({}));
        setWelcomeError((e) => ({ ...e, [id]: data.error ?? "Send failed" }));
      }
    } catch {
      setWelcomeError((e) => ({ ...e, [id]: "Network error" }));
    }
    setWelcomeSending(null);
  }

  async function sendPdf(id: string, email: string, firstName: string) {
    setPdfSending(id);
    setPdfError((e) => ({ ...e, [id]: "" }));
    try {
      const res = await fetch("/api/admin/send-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, pdfKey: selectedPdf[id] }),
      });
      if (res.ok) {
        const label = PDF_OPTIONS.find((p) => p.key === selectedPdf[id])?.label ?? "PDF";
        setPdfSent((prev) => ({ ...prev, [id]: label }));
      } else {
        const data = await res.json().catch(() => ({}));
        setPdfError((e) => ({ ...e, [id]: data.error ?? "Send failed" }));
      }
    } catch {
      setPdfError((e) => ({ ...e, [id]: "Network error" }));
    }
    setPdfSending(null);
  }

  async function archiveClient(id: string, name: string) {
    if (!confirm(`Move "${name}" to Past Clients?\n\nThis will remove them from Applications and add them to the Past Clients table. Their record will still count in metrics.`)) return;
    setArchiving(id);
    setArchiveError((e) => ({ ...e, [id]: "" }));
    try {
      const res = await fetch("/api/admin/archive-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        setApps((prev) => prev.filter((a) => a.id !== id));
      } else {
        setArchiveError((e) => ({ ...e, [id]: data.error ?? "Failed to move client" }));
      }
    } catch {
      setArchiveError((e) => ({ ...e, [id]: "Network error" }));
    }
    setArchiving(null);
  }

  async function generateReset(id: string, email: string) {
    setResetLoading(id);
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setResetLoading(null);
    if (data.link) setResetLinks((prev) => ({ ...prev, [id]: data.link }));
  }

  if (apps.length === 0) {
    return (
      <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "40px 28px", fontSize: 13, color: "rgba(210,220,240,0.88)" }}>
        No applications yet — they&apos;ll appear here when someone submits the website form.
      </div>
    );
  }

  return (
    <>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", minWidth: 600 }}>
          {apps.map(({ id, first_name, last_name, email, prop_firm, created_at }) => {
            const status = statuses[id] ?? "new";
            const s = STATUS_COLORS[status] ?? STATUS_COLORS.new;
            const isExpanded = expanded.has(id);
            const resetLink = resetLinks[id];

            return (
              <div key={id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {/* Main row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto auto auto", padding: "16px 24px", alignItems: "center", gap: 16 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 600, fontSize: 14, color: "#e8eaf0" }}>
                      {first_name} {last_name}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(210,220,240,0.88)" }}>{email}</div>
                  </div>

                  <span style={{ fontSize: 12, color: "rgba(210,220,240,0.88)" }}>{prop_firm || "—"}</span>

                  <span style={{ fontSize: 11, color: "rgba(210,220,240,0.58)", whiteSpace: "nowrap" }}>{formatDate(created_at)}</span>

                  <select
                    value={status}
                    disabled={savingStatus === id}
                    onChange={(e) => updateStatus(id, e.target.value)}
                    style={{
                      appearance: "none", background: s.bg, color: s.color,
                      border: `1px solid ${s.color}22`, fontSize: 10, letterSpacing: 1.5,
                      textTransform: "uppercase", padding: "4px 10px",
                      cursor: savingStatus === id ? "not-allowed" : "pointer",
                      outline: "none", fontFamily: "inherit",
                      opacity: savingStatus === id ? 0.5 : 1, transition: "opacity 0.2s",
                    }}
                  >
                    {Object.keys(STATUS_COLORS).map((k) => (
                      <option key={k} value={k} style={{ background: "#08090f", color: "#e8eaf0" }}>
                        {k.charAt(0).toUpperCase() + k.slice(1)}
                      </option>
                    ))}
                  </select>

                  <ActionBtn onClick={() => toggleExpand(id)}>
                    {isExpanded ? "▲ Close" : "▼ Details"}
                  </ActionBtn>

                  <ActionBtn onClick={() => deleteApp(id)} disabled={deleting === id} color="rgba(239,68,68,0.5)">
                    {deleting === id ? "…" : "Delete"}
                  </ActionBtn>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div style={{ padding: "16px 24px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.2)" }}>
                    <div className="ac-detail-grid">
                      {/* Notes */}
                      <div>
                        <label style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.3)", display: "block", marginBottom: 8 }}>
                          Internal Notes
                        </label>
                        <textarea
                          value={notes[id] ?? ""}
                          onChange={(e) => setNotes((n) => ({ ...n, [id]: e.target.value }))}
                          rows={3}
                          placeholder="Add notes about this applicant…"
                          style={{
                            width: "100%", boxSizing: "border-box", resize: "vertical",
                            background: "#08090f", border: "1px solid rgba(255,255,255,0.1)",
                            color: "#e8eaf0", fontSize: 13, padding: "10px 12px",
                            outline: "none", fontFamily: "inherit",
                          }}
                        />
                        <ActionBtn onClick={() => saveNotes(id)} disabled={savingNotes === id} color="#4f8ef7">
                          {savingNotes === id ? "Saving…" : "Save Notes"}
                        </ActionBtn>
                        {noteErrors[id] && (
                          <div style={{ fontSize: 10, color: "#ef4444", marginTop: 6 }}>{noteErrors[id]}</div>
                        )}
                      </div>

                      {/* Password reset */}
                      <div>
                        <label style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.3)", display: "block", marginBottom: 8 }}>
                          Password Reset
                        </label>
                        <p style={{ fontSize: 12, color: "rgba(210,220,240,0.88)", marginBottom: 12 }}>
                          Generate a one-time reset link for {email}.
                        </p>
                        {!resetLink ? (
                          <ActionBtn onClick={() => generateReset(id, email)} disabled={resetLoading === id} color="#7eb3ff">
                            {resetLoading === id ? "Generating…" : "Generate Link"}
                          </ActionBtn>
                        ) : (
                          <div>
                            <div style={{ fontSize: 11, color: "rgba(210,220,240,0.4)", marginBottom: 6 }}>Copy and send to client:</div>
                            <div
                              onClick={() => { navigator.clipboard.writeText(resetLink); }}
                              style={{
                                background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.2)",
                                padding: "8px 12px", fontSize: 10, color: "#7eb3ff",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                cursor: "pointer", lineHeight: 1.6,
                              }}
                              title={resetLink}
                            >
                              {resetLink.length > 60 ? resetLink.slice(0, 60) + "…" : resetLink}
                            </div>
                            <div style={{ fontSize: 10, color: "rgba(210,220,240,0.3)", marginTop: 6 }}>Click to copy · Link expires after one use</div>
                          </div>
                        )}
                      </div>

                      {/* Send welcome email */}
                      <div>
                        <label style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.3)", display: "block", marginBottom: 8 }}>
                          Welcome Email
                        </label>
                        <p style={{ fontSize: 12, color: "rgba(210,220,240,0.88)", marginBottom: 12 }}>
                          Send welcome email + free guide to {email}. Creates a dashboard account if none exists.
                        </p>
                        {welcomeSent.has(id) ? (
                          <div style={{ fontSize: 11, color: "#22c55e", letterSpacing: 1 }}>✓ Sent</div>
                        ) : (
                          <ActionBtn onClick={() => sendWelcome(id, email, first_name)} disabled={welcomeSending === id} color="#22c55e">
                            {welcomeSending === id ? "Sending…" : "Send Welcome"}
                          </ActionBtn>
                        )}
                        {welcomeError[id] && (
                          <div style={{ fontSize: 10, color: "#ef4444", marginTop: 6 }}>{welcomeError[id]}</div>
                        )}
                      </div>

                      {/* Send PDF */}
                      <div>
                        <label style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.3)", display: "block", marginBottom: 8 }}>
                          Send PDF
                        </label>
                        <select
                          value={selectedPdf[id]}
                          onChange={(e) => setSelectedPdf((prev) => ({ ...prev, [id]: e.target.value as PdfKey }))}
                          style={{
                            width: "100%", appearance: "none",
                            background: "#08090f", border: "1px solid rgba(255,255,255,0.1)",
                            color: "rgba(210,220,240,0.88)", fontSize: 11, padding: "8px 10px",
                            outline: "none", fontFamily: "inherit", cursor: "pointer",
                            marginBottom: 12,
                          }}
                        >
                          {PDF_OPTIONS.map((p) => (
                            <option key={p.key} value={p.key} style={{ background: "#08090f" }}>{p.label}</option>
                          ))}
                        </select>
                        {pdfSent[id] ? (
                          <div style={{ fontSize: 11, color: "#22c55e", letterSpacing: 1 }}>✓ Sent: {pdfSent[id]}</div>
                        ) : (
                          <ActionBtn onClick={() => sendPdf(id, email, first_name)} disabled={pdfSending === id} color="#4f8ef7">
                            {pdfSending === id ? "Sending…" : "Send PDF"}
                          </ActionBtn>
                        )}
                        {pdfError[id] && (
                          <div style={{ fontSize: 10, color: "#ef4444", marginTop: 6 }}>{pdfError[id]}</div>
                        )}
                      </div>
                    </div>

                    {/* Move to Past Clients */}
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <ActionBtn
                        onClick={() => archiveClient(id, `${first_name} ${last_name}`)}
                        disabled={archiving === id}
                        color="rgba(245,158,11,0.6)"
                      >
                        {archiving === id ? "Moving…" : "→ Move to Past Clients"}
                      </ActionBtn>
                      <span style={{ fontSize: 10, color: "rgba(210,220,240,0.25)", fontFamily: "monospace" }}>
                        Removes from Applications · adds to Past Clients · counts in metrics
                      </span>
                      {archiveError[id] && (
                        <span style={{ fontSize: 10, color: "#ef4444" }}>{archiveError[id]}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .ac-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 768px) {
          .ac-detail-grid {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
        }
        @media (max-width: 480px) {
          .ac-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
