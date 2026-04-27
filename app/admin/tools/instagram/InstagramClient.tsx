"use client";

import { useState } from "react";
import type { IGEntry } from "./page";

const BLANK_FORM = {
  recorded_at: new Date().toISOString().slice(0, 10),
  followers: "",
  following: "",
  posts: "",
  reach: "",
  impressions: "",
  profile_visits: "",
  website_clicks: "",
  likes: "",
  comments: "",
  saves: "",
  shares: "",
  notes: "",
};

function delta(entries: IGEntry[], key: keyof IGEntry) {
  if (entries.length < 2) return null;
  const a = entries[0][key] as number | null;
  const b = entries[1][key] as number | null;
  if (a == null || b == null) return null;
  return a - b;
}

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function DeltaBadge({ val }: { val: number | null }) {
  if (val === null) return null;
  const pos = val >= 0;
  return (
    <span style={{
      fontSize: 10, letterSpacing: 0.5, marginLeft: 8,
      color: pos ? "#22c55e" : "#ef4444",
    }}>
      {pos ? "+" : ""}{val}
    </span>
  );
}

function StatCard({ label, value, diff }: { label: string; value: string; diff?: number | null }) {
  return (
    <div style={{
      background: "#08090f", border: "1px solid rgba(255,255,255,0.07)",
      padding: "20px 22px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(79,142,247,0.3), transparent)" }} />
      <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 1.5, color: "rgba(210,220,240,0.3)", marginBottom: 10 }}>
        {"// " + label.toLowerCase().replace(/ /g, "_")}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "#e8eaf0", letterSpacing: -1 }}>
          {value}
        </div>
        {diff !== undefined && <DeltaBadge val={diff} />}
      </div>
    </div>
  );
}

export default function InstagramClient({ entries, dbError }: { entries: IGEntry[]; dbError: boolean }) {
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(BLANK_FORM);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [localEntries, setLocalEntries] = useState<IGEntry[]>(entries);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const latest = localEntries[0] ?? null;

  function field(key: keyof typeof BLANK_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");

    const payload = {
      recorded_at: form.recorded_at,
      followers:      Number(form.followers),
      following:      Number(form.following),
      posts:          Number(form.posts),
      reach:          form.reach          ? Number(form.reach)          : null,
      impressions:    form.impressions    ? Number(form.impressions)    : null,
      profile_visits: form.profile_visits ? Number(form.profile_visits) : null,
      website_clicks: form.website_clicks ? Number(form.website_clicks) : null,
      likes:          form.likes          ? Number(form.likes)          : null,
      comments:       form.comments       ? Number(form.comments)       : null,
      saves:          form.saves          ? Number(form.saves)          : null,
      shares:         form.shares         ? Number(form.shares)         : null,
      notes:          form.notes || null,
    };

    const res = await fetch("/api/admin/instagram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setSaveError(data.error ?? "Save failed"); return; }

    setLocalEntries((prev) => [data, ...prev]);
    setShowForm(false);
    setForm({ ...BLANK_FORM, recorded_at: new Date().toISOString().slice(0, 10) });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    setDeleting(id);
    await fetch(`/api/admin/instagram?id=${id}`, { method: "DELETE" });
    setLocalEntries((prev) => prev.filter((e) => e.id !== id));
    setDeleting(null);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#020305",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#e8eaf0", fontSize: 13, padding: "10px 14px",
    outline: "none", borderRadius: 3, fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "monospace", fontSize: 9, letterSpacing: 1.5,
    textTransform: "uppercase" as const, color: "rgba(210,220,240,0.35)",
    marginBottom: 6, display: "block",
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: 960 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36 }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 2, color: "rgba(210,220,240,0.3)", marginBottom: 10 }}>
            {"// tools / instagram_metrics"}
          </div>
          <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "#e8eaf0", letterSpacing: -0.5 }}>
            Instagram Metrics
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "rgba(210,220,240,0.5)" }}>
            Manual log of account performance over time.
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            background: showForm ? "rgba(255,255,255,0.06)" : "#4f8ef7",
            border: "none", color: showForm ? "rgba(210,220,240,0.6)" : "#020305",
            fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700,
            fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
            padding: "12px 24px", cursor: "pointer", flexShrink: 0,
          }}
        >
          {showForm ? "Cancel" : "+ Log Entry"}
        </button>
      </div>

      {dbError && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", padding: "14px 18px", marginBottom: 24, fontSize: 12, color: "#ef4444" }}>
          Database table not found. Run the SQL migration to create the <code>instagram_metrics</code> table.
        </div>
      )}

      {/* Stats row */}
      {latest && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
          <StatCard label="Followers"      value={fmt(latest.followers)}      diff={delta(localEntries, "followers")} />
          <StatCard label="Reach"          value={fmt(latest.reach)}          diff={delta(localEntries, "reach")} />
          <StatCard label="Impressions"    value={fmt(latest.impressions)}    diff={delta(localEntries, "impressions")} />
          <StatCard label="Profile Visits" value={fmt(latest.profile_visits)} diff={delta(localEntries, "profile_visits")} />
          <StatCard label="Likes"          value={fmt(latest.likes)}          diff={delta(localEntries, "likes")} />
          <StatCard label="Comments"       value={fmt(latest.comments)}       diff={delta(localEntries, "comments")} />
          <StatCard label="Saves"          value={fmt(latest.saves)}          diff={delta(localEntries, "saves")} />
          <StatCard label="Website Clicks" value={fmt(latest.website_clicks)} diff={delta(localEntries, "website_clicks")} />
        </div>
      )}

      {/* Log entry form */}
      {showForm && (
        <form onSubmit={handleSave} style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.08)", padding: 28, marginBottom: 32 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 2, color: "rgba(210,220,240,0.3)", marginBottom: 20 }}>{"// new_entry"}</div>

          {/* Core */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" required value={form.recorded_at} onChange={field("recorded_at")} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Followers</label>
              <input type="number" required min={0} value={form.followers} onChange={field("followers")} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Following</label>
              <input type="number" required min={0} value={form.following} onChange={field("following")} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Posts</label>
              <input type="number" required min={0} value={form.posts} onChange={field("posts")} placeholder="0" style={inputStyle} />
            </div>
          </div>

          {/* Reach & discovery */}
          <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(79,142,247,0.6)", marginBottom: 10 }}>Reach &amp; Discovery</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
            {(["reach", "impressions", "profile_visits", "website_clicks"] as const).map((k) => (
              <div key={k}>
                <label style={labelStyle}>{k.replace(/_/g, " ")}</label>
                <input type="number" min={0} value={form[k]} onChange={field(k)} placeholder="—" style={inputStyle} />
              </div>
            ))}
          </div>

          {/* Engagement */}
          <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(79,142,247,0.6)", marginBottom: 10 }}>Engagement</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
            {(["likes", "comments", "saves", "shares"] as const).map((k) => (
              <div key={k}>
                <label style={labelStyle}>{k}</label>
                <input type="number" min={0} value={form[k]} onChange={field(k)} placeholder="—" style={inputStyle} />
              </div>
            ))}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={field("notes")} placeholder="e.g. posted reel on Tue, ran story poll…" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          {saveError && (
            <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 12 }}>{saveError}</div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              background: saving ? "rgba(79,142,247,0.2)" : "#4f8ef7",
              border: "none", color: saving ? "#4f8ef7" : "#020305",
              fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700,
              fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              padding: "12px 28px", cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving…" : "Save Entry"}
          </button>
        </form>
      )}

      {/* History table */}
      {localEntries.length > 0 ? (
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Date","Followers","Following","Posts","Reach","Impressions","Visits","Clicks","Likes","Comments","Saves","Shares","Notes",""].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontFamily: "monospace", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(210,220,240,0.3)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {localEntries.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "11px 14px", color: "rgba(210,220,240,0.7)", whiteSpace: "nowrap", fontFamily: "monospace", fontSize: 11 }}>
                    {e.recorded_at.slice(0, 10)}
                  </td>
                  {([
                    e.followers, e.following, e.posts,
                    e.reach, e.impressions, e.profile_visits, e.website_clicks,
                    e.likes, e.comments, e.saves, e.shares,
                  ] as (number | null)[]).map((v, i) => (
                    <td key={i} style={{ padding: "11px 14px", color: v != null ? "#e8eaf0" : "rgba(210,220,240,0.2)", fontFamily: "monospace" }}>
                      {fmt(v)}
                    </td>
                  ))}
                  <td style={{ padding: "11px 14px", color: "rgba(210,220,240,0.5)", fontSize: 11, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.notes ?? "—"}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <button
                      onClick={() => handleDelete(e.id)}
                      disabled={deleting === e.id}
                      style={{ background: "none", border: "none", color: "rgba(239,68,68,0.4)", cursor: "pointer", fontSize: 13, padding: 0 }}
                      title="Delete entry"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !dbError && (
          <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "48px", textAlign: "center", color: "rgba(210,220,240,0.3)", fontSize: 13 }}>
            No entries yet. Hit <strong style={{ color: "#4f8ef7" }}>+ Log Entry</strong> to add your first snapshot.
          </div>
        )
      )}
    </div>
  );
}
