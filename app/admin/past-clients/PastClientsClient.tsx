"use client";

import { useState } from "react";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  account_size_usd: number | null;
  fee_paid_gbp: number | null;
  prop_firm: string | null;
  notes: string | null;
  source_file: string;
  challenge_result: string | null;
};

const PROP_FIRMS = ["FTMO", "FundedTrader", "E8", "The5ers", "True Forex Funds", "Topstep", "Earn2Trade", "City Traders Imperium"];

const RESULT_STYLES: Record<string, { color: string; bg: string }> = {
  passed: { color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  failed: { color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
};

export default function PastClientsClient({ clients: initial }: { clients: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initial);
  const [selected, setSelected] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ email: "", phone: "", address: "", prop_firm: "", notes: "", challenge_result: "" });

  const filtered = clients.filter((c) =>
    `${c.name} ${c.address ?? ""} ${c.email ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  function openClient(c: Client) {
    setSelected(c);
    setEditFields({ email: c.email ?? "", phone: c.phone ?? "", address: c.address ?? "", prop_firm: c.prop_firm ?? "", notes: c.notes ?? "", challenge_result: c.challenge_result ?? "" });
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/past-clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, ...editFields }),
      });
      const updated = await res.json();
      if (updated.error) {
        setSaveError(updated.error);
      } else {
        setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setSelected(updated);
      }
    } catch {
      setSaveError("Network error — changes not saved");
    } finally {
      setSaving(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
    color: "rgba(232,234,240,0.3)", display: "block", marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "#020305", border: "1px solid rgba(255,255,255,0.1)",
    color: "#e8eaf0", fontSize: 13, padding: "10px 12px",
    outline: "none", fontFamily: "inherit",
  };

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Search by name, address or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "#08090f", border: "1px solid rgba(255,255,255,0.08)",
            color: "#e8eaf0", fontSize: 13, padding: "11px 16px", width: 360,
            outline: "none", fontFamily: "inherit",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#08090f", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Name", "Address", "Account", "Fee Paid", "Result", "Email", "Phone"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.3)", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const result = c.challenge_result?.toLowerCase();
                const rs = result ? RESULT_STYLES[result] : null;
                return (
                  <tr
                    key={c.id}
                    onClick={() => openClient(c)}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      cursor: "pointer",
                      background: selected?.id === c.id ? "rgba(79,142,247,0.06)" : "transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { if (selected?.id !== c.id) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={(e) => { if (selected?.id !== c.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <td style={{ padding: "12px 14px", color: "#e8eaf0", fontWeight: 600, whiteSpace: "nowrap" }}>{c.name}</td>
                    <td style={{ padding: "12px 14px", color: "rgba(232,234,240,0.45)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.address ?? <span style={{ color: "rgba(232,234,240,0.2)" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 14px", color: c.account_size_usd ? "#4f8ef7" : "rgba(232,234,240,0.2)", whiteSpace: "nowrap" }}>
                      {c.account_size_usd ? `$${(c.account_size_usd / 1000).toFixed(0)}K` : "—"}
                    </td>
                    <td style={{ padding: "12px 14px", color: c.fee_paid_gbp ? "#22c55e" : "rgba(232,234,240,0.2)", whiteSpace: "nowrap" }}>
                      {c.fee_paid_gbp ? `£${c.fee_paid_gbp}` : "—"}
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      {rs ? (
                        <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", padding: "3px 8px", background: rs.bg, color: rs.color }}>
                          {result}
                        </span>
                      ) : (
                        <span style={{ color: "rgba(232,234,240,0.15)", fontSize: 10 }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", color: c.email ? "rgba(232,234,240,0.7)" : "rgba(232,234,240,0.15)", whiteSpace: "nowrap" }}>
                      {c.email ?? <span style={{ fontSize: 10, letterSpacing: 1 }}>ADD</span>}
                    </td>
                    <td style={{ padding: "12px 14px", color: c.phone ? "rgba(232,234,240,0.7)" : "rgba(232,234,240,0.15)", whiteSpace: "nowrap" }}>
                      {c.phone ?? <span style={{ fontSize: 10, letterSpacing: 1 }}>ADD</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 12, fontSize: 11, color: "rgba(232,234,240,0.2)" }}>
            {filtered.length} of {clients.length} clients ·{" "}
            {clients.filter(c => c.challenge_result?.toLowerCase() === "passed").length} passed ·{" "}
            {clients.filter(c => c.challenge_result?.toLowerCase() === "failed").length} failed
          </div>
        </div>

        {selected && (
          <div style={{
            width: 320, flexShrink: 0, background: "#08090f",
            border: "1px solid rgba(79,142,247,0.2)", padding: "28px 24px", position: "sticky", top: 20,
          }}>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: -0.5, color: "#e8eaf0", marginBottom: 6 }}>
              {selected.name}
            </div>
            {selected.address && (
              <div style={{ fontSize: 12, color: "rgba(210,220,240,0.88)", lineHeight: 1.6, marginBottom: 20 }}>
                {selected.address}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              {selected.account_size_usd && (
                <div style={{ background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", padding: "8px 14px" }}>
                  <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 4 }}>Account</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>${(selected.account_size_usd / 1000).toFixed(0)}K</div>
                </div>
              )}
              {selected.fee_paid_gbp && (
                <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", padding: "8px 14px" }}>
                  <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "#22c55e", marginBottom: 4 }}>Fee Paid</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>£{selected.fee_paid_gbp}</div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Prop Firm</label>
                <select
                  value={editFields.prop_firm}
                  onChange={(e) => setEditFields((f) => ({ ...f, prop_firm: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Select prop firm</option>
                  {PROP_FIRMS.map((firm) => (
                    <option key={firm} value={firm}>{firm}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Challenge Result</label>
                <select
                  value={editFields.challenge_result}
                  onChange={(e) => setEditFields((f) => ({ ...f, challenge_result: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Unknown</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {[
                { label: "Email", key: "email" as const, placeholder: "client@email.com" },
                { label: "Phone", key: "phone" as const, placeholder: "+44 7700 000000" },
                { label: "Address", key: "address" as const, placeholder: "Street address" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    value={editFields[key]}
                    onChange={(e) => setEditFields((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}

              <div>
                <label style={labelStyle}>Notes</label>
                <textarea
                  value={editFields.notes}
                  onChange={(e) => setEditFields((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Internal notes…"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <button
                onClick={save}
                disabled={saving}
                style={{
                  background: "#4f8ef7", color: "#020305", border: "none",
                  fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700,
                  fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                  padding: "12px", cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1, transition: "opacity 0.2s",
                }}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              {saveError && (
                <div style={{ fontSize: 10, color: "#ef4444", marginTop: 6 }}>{saveError}</div>
              )}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "rgba(232,234,240,0.2)" }}>
              Source: {selected.source_file}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
