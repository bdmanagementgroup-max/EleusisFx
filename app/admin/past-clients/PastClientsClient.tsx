"use client";

import { useState, useEffect } from "react";

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
  phase: number | null;
  phase_status: string | null;
  balance: number | null;
  equity: number | null;
  daily_drawdown: number | null;
  max_drawdown: number | null;
  profit_target: number | null;
  profit_goal: number | null;
  days_used: number | null;
  days_allowed: number | null;
};

type ColumnKey = "name" | "address" | "account" | "fee_paid" | "prop_firm" | "result" | "email" | "phone";

const DEFAULT_COLUMNS: ColumnKey[] = ["name", "address", "account", "fee_paid", "prop_firm", "result", "email", "phone"];

const COLUMN_LABELS: Record<ColumnKey, string> = {
  name: "Name",
  address: "Address",
  account: "Account",
  fee_paid: "Fee Paid",
  prop_firm: "Prop Firm",
  result: "Result",
  email: "Email",
  phone: "Phone",
};

const PROP_FIRMS = ["FTMO", "FundedTrader", "E8", "The5ers", "True Forex Funds", "Topstep", "Earn2Trade", "City Traders Imperium"];

const RESULT_STYLES: Record<string, { color: string; bg: string }> = {
  passed: { color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  pass:   { color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  failed: { color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  fail:   { color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
};

function resultStyle(raw: string | null) {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  return RESULT_STYLES[key] ?? { color: "rgba(210,220,240,0.6)", bg: "rgba(255,255,255,0.04)" };
}

export default function PastClientsClient({ clients: initial }: { clients: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initial);
  const [selected, setSelected] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ email: "", phone: "", address: "", account_size_usd: "", fee_paid_gbp: "", prop_firm: "", notes: "", challenge_result: "", phase: "1", phase_status: "unknown", balance: "", equity: "", daily_drawdown: "", max_drawdown: "", profit_target: "", profit_goal: "10", days_used: "", days_allowed: "30" });
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_COLUMNS);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("past_clients_columns");
    if (saved) {
      try {
        setVisibleColumns(JSON.parse(saved));
      } catch {
        setVisibleColumns(DEFAULT_COLUMNS);
      }
    }
  }, []);

  const saveColumnPrefs = (cols: ColumnKey[]) => {
    setVisibleColumns(cols);
    localStorage.setItem("past_clients_columns", JSON.stringify(cols));
  };

  const toggleColumn = (col: ColumnKey) => {
    const updated = visibleColumns.includes(col)
      ? visibleColumns.filter((c) => c !== col)
      : [...visibleColumns, col];
    saveColumnPrefs(updated);
  };

  const moveColumn = (col: ColumnKey, direction: "up" | "down") => {
    const idx = visibleColumns.indexOf(col);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === visibleColumns.length - 1)) return;
    const updated = [...visibleColumns];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    saveColumnPrefs(updated);
  };

  const renderCellValue = (c: Client, col: ColumnKey) => {
    switch (col) {
      case "name":
        return <span style={{ color: "#e8eaf0", fontWeight: 600 }}>{c.name}</span>;
      case "address":
        return <span style={{ color: "rgba(232,234,240,0.45)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{c.address ?? "—"}</span>;
      case "account":
        return <span style={{ color: c.account_size_usd ? "#4f8ef7" : "rgba(232,234,240,0.2)" }}>{c.account_size_usd ? `$${(c.account_size_usd / 1000).toFixed(0)}K` : "—"}</span>;
      case "fee_paid":
        return <span style={{ color: c.fee_paid_gbp ? "#22c55e" : "rgba(232,234,240,0.2)" }}>{c.fee_paid_gbp ? `£${c.fee_paid_gbp}` : "—"}</span>;
      case "prop_firm":
        return <span style={{ color: c.prop_firm ? "rgba(232,234,240,0.7)" : "rgba(232,234,240,0.15)" }}>{c.prop_firm ?? "—"}</span>;
      case "result": {
        const rs = resultStyle(c.challenge_result);
        return rs ? (
          <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", padding: "3px 8px", background: rs.bg, color: rs.color }}>
            {c.challenge_result}
          </span>
        ) : (
          <span style={{ color: "rgba(232,234,240,0.15)", fontSize: 10 }}>—</span>
        );
      }
      case "email":
        return <span style={{ color: c.email ? "rgba(232,234,240,0.7)" : "rgba(232,234,240,0.15)" }}>{c.email ?? <span style={{ fontSize: 10, letterSpacing: 1 }}>ADD</span>}</span>;
      case "phone":
        return <span style={{ color: c.phone ? "rgba(232,234,240,0.7)" : "rgba(232,234,240,0.15)" }}>{c.phone ?? <span style={{ fontSize: 10, letterSpacing: 1 }}>ADD</span>}</span>;
      default:
        return "—";
    }
  };

  const filtered = clients.filter((c) =>
    `${c.name} ${c.address ?? ""} ${c.email ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  function openClient(c: Client) {
    setSelected(c);
    setEditFields({
      email: c.email ?? "",
      phone: c.phone ?? "",
      address: c.address ?? "",
      account_size_usd: String(c.account_size_usd ?? ""),
      fee_paid_gbp: String(c.fee_paid_gbp ?? ""),
      prop_firm: c.prop_firm ?? "",
      notes: c.notes ?? "",
      challenge_result: c.challenge_result ?? "",
      phase: String(c.phase ?? 1),
      phase_status: c.phase_status ?? "unknown",
      balance: c.balance != null ? String(c.balance) : "",
      equity: c.equity != null ? String(c.equity) : "",
      daily_drawdown: c.daily_drawdown != null ? String(c.daily_drawdown) : "",
      max_drawdown: c.max_drawdown != null ? String(c.max_drawdown) : "",
      profit_target: c.profit_target != null ? String(c.profit_target) : "",
      profit_goal: String(c.profit_goal ?? 10),
      days_used: c.days_used != null ? String(c.days_used) : "",
      days_allowed: String(c.days_allowed ?? 30),
    });
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
      <div style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
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
        <button
          onClick={() => setShowColumnSettings(!showColumnSettings)}
          style={{
            background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)",
            color: "#4f8ef7", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
            padding: "11px 14px", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          ⚙ Columns
        </button>
      </div>

      {showColumnSettings && (
        <div style={{
          background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)",
          padding: "16px", marginBottom: 20, borderRadius: 4,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#4f8ef7", marginBottom: 12 }}>Column Settings</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {DEFAULT_COLUMNS.map((col) => (
              <div key={col} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(col)}
                  onChange={() => toggleColumn(col)}
                  style={{ cursor: "pointer" }}
                />
                <label style={{ fontSize: 12, color: "rgba(210,220,240,0.88)", cursor: "pointer", flex: 1 }}>
                  {COLUMN_LABELS[col]}
                </label>
                <button
                  onClick={() => moveColumn(col, "up")}
                  disabled={visibleColumns.indexOf(col) === 0}
                  style={{
                    background: "transparent", border: "1px solid rgba(79,142,247,0.2)", color: "#4f8ef7",
                    fontSize: 10, padding: "4px 6px", cursor: "pointer", opacity: visibleColumns.indexOf(col) === 0 ? 0.3 : 1,
                  }}
                >
                  ↑
                </button>
                <button
                  onClick={() => moveColumn(col, "down")}
                  disabled={visibleColumns.indexOf(col) === visibleColumns.length - 1}
                  style={{
                    background: "transparent", border: "1px solid rgba(79,142,247,0.2)", color: "#4f8ef7",
                    fontSize: 10, padding: "4px 6px", cursor: "pointer", opacity: visibleColumns.indexOf(col) === visibleColumns.length - 1 ? 0.3 : 1,
                  }}
                >
                  ↓
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#08090f", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {visibleColumns.map((col) => (
                  <th key={col} style={{ padding: "10px 14px", textAlign: "left", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.3)", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {COLUMN_LABELS[col]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
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
                  {visibleColumns.map((col) => (
                    <td key={col} style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      {renderCellValue(c, col)}
                    </td>
                  ))}
                </tr>
              ))}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Account Size (USD)</label>
                  <input
                    type="number"
                    value={editFields.account_size_usd}
                    onChange={(e) => setEditFields((f) => ({ ...f, account_size_usd: e.target.value }))}
                    placeholder="100000"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Fee Paid (GBP)</label>
                  <input
                    type="number"
                    value={editFields.fee_paid_gbp}
                    onChange={(e) => setEditFields((f) => ({ ...f, fee_paid_gbp: e.target.value }))}
                    placeholder="550"
                    style={inputStyle}
                  />
                </div>
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

              {/* Metrics */}
              <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 14 }}>Trading Metrics</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Phase</label>
                      <select value={editFields.phase} onChange={(e) => setEditFields((f) => ({ ...f, phase: e.target.value }))} style={inputStyle}>
                        <option value="1">Phase 1</option>
                        <option value="2">Phase 2</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Phase Status</label>
                      <select value={editFields.phase_status} onChange={(e) => setEditFields((f) => ({ ...f, phase_status: e.target.value }))} style={inputStyle}>
                        <option value="unknown">Unknown</option>
                        <option value="in_progress">In Progress</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Balance ($)</label>
                      <input type="number" value={editFields.balance} onChange={(e) => setEditFields((f) => ({ ...f, balance: e.target.value }))} placeholder="100000" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Equity ($)</label>
                      <input type="number" value={editFields.equity} onChange={(e) => setEditFields((f) => ({ ...f, equity: e.target.value }))} placeholder="100000" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Daily DD (%)</label>
                      <input type="number" step="0.01" value={editFields.daily_drawdown} onChange={(e) => setEditFields((f) => ({ ...f, daily_drawdown: e.target.value }))} placeholder="0" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Max DD (%)</label>
                      <input type="number" step="0.01" value={editFields.max_drawdown} onChange={(e) => setEditFields((f) => ({ ...f, max_drawdown: e.target.value }))} placeholder="0" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Profit Target (%)</label>
                      <input type="number" step="0.01" value={editFields.profit_target} onChange={(e) => setEditFields((f) => ({ ...f, profit_target: e.target.value }))} placeholder="0" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Profit Goal (%)</label>
                      <input type="number" step="0.01" value={editFields.profit_goal} onChange={(e) => setEditFields((f) => ({ ...f, profit_goal: e.target.value }))} placeholder="10" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Days Used</label>
                      <input type="number" value={editFields.days_used} onChange={(e) => setEditFields((f) => ({ ...f, days_used: e.target.value }))} placeholder="0" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Days Allowed</label>
                      <input type="number" value={editFields.days_allowed} onChange={(e) => setEditFields((f) => ({ ...f, days_allowed: e.target.value }))} placeholder="30" style={inputStyle} />
                    </div>
                  </div>
                </div>
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

              {selected.email && (
                <a
                  href={`/admin/tools/email?template=re-engagement&to=${encodeURIComponent(selected.email)}&name=${encodeURIComponent(selected.name.split(" ")[0])}`}
                  style={{
                    display: "block", textAlign: "center",
                    background: "transparent", border: "1px solid rgba(79,142,247,0.3)",
                    color: "#4f8ef7", fontFamily: "var(--font-syne), Syne, sans-serif",
                    fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                    padding: "12px", textDecoration: "none", transition: "all 0.2s",
                  }}
                >
                  Open in Email Editor →
                </a>
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
