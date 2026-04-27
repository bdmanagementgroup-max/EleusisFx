"use client";

import { useRef, useState } from "react";
import type { Recipient } from "./page";

const TOOLBAR = [
  { cmd: "bold",                icon: "B",   title: "Bold",           style: { fontWeight: 700 } },
  { cmd: "italic",              icon: "I",   title: "Italic",         style: { fontStyle: "italic" } },
  { cmd: "underline",           icon: "U",   title: "Underline",      style: { textDecoration: "underline" } },
  { cmd: "insertUnorderedList", icon: "≡",   title: "Bullet list",    style: {} },
  { cmd: "insertOrderedList",   icon: "1≡",  title: "Numbered list",  style: {} },
];

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#020305",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#e8eaf0", fontFamily: "inherit",
  fontSize: 13, padding: "10px 14px",
  outline: "none", borderRadius: 3,
};

const labelStyle: React.CSSProperties = {
  fontFamily: "monospace", fontSize: 10,
  letterSpacing: 1.5, textTransform: "uppercase" as const,
  color: "rgba(210,220,240,0.35)", marginBottom: 8, display: "block",
};

export default function EmailEditorClient({ recipients }: { recipients: Recipient[] }) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Recipients
  const [selected, setSelected]           = useState<Recipient[]>([]);
  const [customInput, setCustomInput]     = useState("");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [dropOpen, setDropOpen]           = useState(false);

  // Editor
  const [subject, setSubject]     = useState("");
  const [mode, setMode]           = useState<"compose" | "html">("compose");
  const [htmlSource, setHtmlSource] = useState("");
  const [composeHtml, setComposeHtml] = useState("");
  const [preview, setPreview]     = useState(false);

  // Send
  const [sending, setSending]     = useState(false);
  const [result, setResult]       = useState<{ sent: number; failed: number } | null>(null);
  const [sendError, setSendError] = useState("");

  // ── Recipient helpers ──
  const filteredRecipients = recipients.filter((r) => {
    const q = recipientSearch.toLowerCase();
    return (
      !selected.find((s) => s.email === r.email) &&
      (r.label.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
    );
  });

  const grouped = ["Active Clients", "Past Clients"].map((g) => ({
    group: g,
    items: filteredRecipients.filter((r) => r.group === g),
  })).filter((g) => g.items.length > 0);

  function addRecipient(r: Recipient) {
    setSelected((prev) => [...prev, r]);
    setRecipientSearch("");
  }

  function addCustom() {
    const email = customInput.trim();
    if (!email || !email.includes("@")) return;
    if (selected.find((s) => s.email === email)) { setCustomInput(""); return; }
    setSelected((prev) => [...prev, { label: email, email, group: "Active Clients" }]);
    setCustomInput("");
  }

  function removeRecipient(email: string) {
    setSelected((prev) => prev.filter((s) => s.email !== email));
  }

  // ── Editor helpers ──
  function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  }

  function switchToHtml() {
    const html = editorRef.current?.innerHTML ?? "";
    setHtmlSource(html);
    setComposeHtml(html);
    setMode("html");
  }

  function switchToCompose() {
    if (editorRef.current) editorRef.current.innerHTML = htmlSource;
    setComposeHtml(htmlSource);
    setMode("compose");
  }

  function getHtml() {
    return mode === "html" ? htmlSource : composeHtml;
  }

  // ── Send ──
  async function handleSend() {
    const html = getHtml();
    if (!selected.length) { setSendError("Add at least one recipient."); return; }
    if (!subject.trim()) { setSendError("Subject is required."); return; }
    if (!html.trim() || html === "<br>") { setSendError("Email body is empty."); return; }

    setSending(true);
    setSendError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selected.map((s) => s.email), subject, html }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult(data);
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 2, color: "rgba(210,220,240,0.3)", marginBottom: 10 }}>
          {"// tools / email_editor"}
        </div>
        <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "#e8eaf0", letterSpacing: -0.5 }}>
          Email Editor
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: "rgba(210,220,240,0.5)" }}>
          Compose and send to clients, past clients, or custom addresses.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Recipients ── */}
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: 24 }}>
          <span style={labelStyle}>{"// recipients"}</span>

          {selected.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {selected.map((r) => (
                <div
                  key={r.email}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.25)",
                    borderRadius: 3, padding: "3px 8px 3px 10px",
                    fontSize: 11, letterSpacing: 1, color: "#a8c8ff",
                  }}
                >
                  <span>
                    {r.label !== r.email ? `${r.label} ` : ""}
                    <span style={{ opacity: 0.65 }}>&lt;{r.email}&gt;</span>
                  </span>
                  <button
                    onClick={() => removeRecipient(r.email)}
                    style={{ background: "none", border: "none", color: "rgba(168,200,255,0.6)", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: 13 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Dropdown search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <input
              placeholder="Search clients by name or email…"
              value={recipientSearch}
              onChange={(e) => { setRecipientSearch(e.target.value); setDropOpen(true); }}
              onFocus={() => setDropOpen(true)}
              onBlur={() => setTimeout(() => setDropOpen(false), 150)}
              style={inputStyle}
            />
            {dropOpen && grouped.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20,
                background: "#0d0f1a", border: "1px solid rgba(255,255,255,0.1)",
                maxHeight: 260, overflowY: "auto", borderTop: "none",
              }}>
                {grouped.map(({ group, items }) => (
                  <div key={group}>
                    <div style={{ padding: "8px 14px 4px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.3)" }}>
                      {group}
                    </div>
                    {items.map((r) => (
                      <button
                        key={r.email}
                        onMouseDown={() => addRecipient(r)}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          background: "none", border: "none", cursor: "pointer",
                          padding: "9px 14px", color: "rgba(210,220,240,0.88)",
                          fontSize: 12, transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(79,142,247,0.08)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "none")}
                      >
                        <span style={{ color: "#e8eaf0" }}>{r.label}</span>
                        {r.label !== r.email && (
                          <span style={{ marginLeft: 8, color: "rgba(210,220,240,0.4)", fontSize: 11 }}>{r.email}</span>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom recipient */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Or type a new email address…"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={addCustom}
              style={{
                background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.25)",
                color: "#4f8ef7", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
                padding: "0 18px", cursor: "pointer", whiteSpace: "nowrap", borderRadius: 3,
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* ── Subject ── */}
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: 24 }}>
          <span style={labelStyle}>{"// subject"}</span>
          <input
            placeholder="Email subject line…"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ ...inputStyle, fontSize: 15 }}
          />
        </div>

        {/* ── Body ── */}
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={labelStyle}>{"// body"}</span>
            <div style={{ display: "flex", gap: 4 }}>
              {(["compose", "html"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => m === "html" ? switchToHtml() : switchToCompose()}
                  style={{
                    background: mode === m ? "rgba(79,142,247,0.15)" : "none",
                    border: `1px solid ${mode === m ? "rgba(79,142,247,0.4)" : "rgba(255,255,255,0.1)"}`,
                    color: mode === m ? "#4f8ef7" : "rgba(210,220,240,0.55)",
                    fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                    padding: "5px 12px", cursor: "pointer", borderRadius: 3,
                  }}
                >
                  {m === "compose" ? "Compose" : "HTML"}
                </button>
              ))}
              <button
                onClick={() => setPreview((p) => !p)}
                style={{
                  background: preview ? "rgba(34,197,94,0.1)" : "none",
                  border: `1px solid ${preview ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                  color: preview ? "#22c55e" : "rgba(210,220,240,0.55)",
                  fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                  padding: "5px 12px", cursor: "pointer", borderRadius: 3,
                }}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Toolbar */}
          {mode === "compose" && !preview && (
            <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
              {TOOLBAR.map(({ cmd, icon, title, style: s }) => (
                <button
                  key={cmd}
                  title={title}
                  onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
                  style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(210,220,240,0.88)", cursor: "pointer",
                    width: 32, height: 32, fontSize: 12, borderRadius: 3,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    ...s,
                  }}
                >
                  {icon}
                </button>
              ))}
              <div style={{ width: 1, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
              <select
                onChange={(e) => exec("fontSize", e.target.value)}
                defaultValue=""
                style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(210,220,240,0.88)", fontSize: 11, padding: "0 8px",
                  cursor: "pointer", borderRadius: 3, height: 32,
                }}
              >
                <option value="" disabled>Size</option>
                {[1,2,3,4,5,6,7].map((n) => (
                  <option key={n} value={n}>{["8","10","12","14","18","24","36"][n-1]}px</option>
                ))}
              </select>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }} title="Text colour">
                <span style={{ fontSize: 11, color: "rgba(210,220,240,0.55)" }}>A</span>
                <input
                  type="color"
                  defaultValue="#e8eaf0"
                  onChange={(e) => exec("foreColor", e.target.value)}
                  style={{ width: 24, height: 24, padding: 0, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "none", borderRadius: 3 }}
                />
              </div>
              <button
                title="Insert link"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const url = prompt("URL:");
                  if (url) exec("createLink", url);
                }}
                style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(210,220,240,0.88)", cursor: "pointer",
                  padding: "0 10px", height: 32, fontSize: 11, borderRadius: 3,
                  letterSpacing: 0.5,
                }}
              >
                Link
              </button>
              <button
                title="Clear formatting"
                onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }}
                style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(210,220,240,0.55)", cursor: "pointer",
                  padding: "0 10px", height: 32, fontSize: 10, borderRadius: 3,
                  letterSpacing: 0.5,
                }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Compose editor */}
          {mode === "compose" && !preview && (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() => setComposeHtml(editorRef.current?.innerHTML ?? "")}
              style={{
                minHeight: 340, background: "#020305",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e8eaf0", fontSize: 14, lineHeight: 1.7,
                padding: "16px 18px", outline: "none", borderRadius: 3,
              }}
            />
          )}

          {/* HTML source */}
          {mode === "html" && !preview && (
            <textarea
              value={htmlSource}
              onChange={(e) => setHtmlSource(e.target.value)}
              spellCheck={false}
              style={{
                ...inputStyle,
                minHeight: 340, fontFamily: "monospace", fontSize: 12,
                lineHeight: 1.6, resize: "vertical",
              }}
            />
          )}

          {/* Preview */}
          {preview && (
            <div
              style={{
                minHeight: 340, background: "#fff", borderRadius: 3,
                padding: "24px", color: "#111", fontSize: 14,
              }}
              dangerouslySetInnerHTML={{ __html: getHtml() }}
            />
          )}
        </div>

        {/* ── Send bar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px",
        }}>
          <div>
            {sendError && <div style={{ color: "#ef4444", fontSize: 12, letterSpacing: 0.5 }}>{sendError}</div>}
            {result && (
              <div style={{ fontSize: 12, color: "#22c55e", letterSpacing: 0.5 }}>
                ✓ Sent to {result.sent} recipient{result.sent !== 1 ? "s" : ""}
                {result.failed > 0 && <span style={{ color: "#ef4444", marginLeft: 8 }}>· {result.failed} failed</span>}
              </div>
            )}
            {!sendError && !result && (
              <div style={{ fontSize: 11, color: "rgba(210,220,240,0.3)", letterSpacing: 0.5 }}>
                {selected.length} recipient{selected.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={sending}
            style={{
              background: sending ? "rgba(79,142,247,0.2)" : "#4f8ef7",
              border: "none", color: sending ? "#4f8ef7" : "#020305",
              fontFamily: "var(--font-syne), Syne, sans-serif",
              fontWeight: 700, fontSize: 11, letterSpacing: 2,
              textTransform: "uppercase", padding: "12px 32px",
              cursor: sending ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {sending ? "Sending…" : "Send Email"}
          </button>
        </div>

      </div>
    </div>
  );
}
