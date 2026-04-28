"use client";

import { useEffect, useState } from "react";
import type { IGEntry } from "./page";

type PostInsights = {
  impressions: number | null;
  reach: number | null;
  saved: number | null;
};

type MediaItem = {
  id: string;
  caption?: string;
  timestamp: string;
  media_type: string;
  like_count: number;
  comments_count: number;
  thumbnail_url?: string;
  media_url?: string;
  postInsights?: PostInsights;
};

type Demographics = {
  gender_age: Record<string, number>;
  country: Record<string, number>;
};

type LiveData = {
  account: { username: string; followers: number; following: number; posts: number };
  insights: { reach: number | null; impressions: number | null; profile_views: number | null; website_clicks: number | null };
  media: MediaItem[];
  demographics: Demographics | null;
};

const BLANK_FORM = {
  recorded_at: new Date().toISOString().slice(0, 10),
  followers: "", following: "", posts: "",
  reach: "", impressions: "", profile_visits: "",
  website_clicks: "", likes: "", comments: "",
  saves: "", shares: "", notes: "",
};

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.07)", padding: "20px 22px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(79,142,247,0.3), transparent)" }} />
      <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 1.5, color: "rgba(210,220,240,0.3)", marginBottom: 10 }}>
        {"// " + label.toLowerCase().replace(/ /g, "_")}
      </div>
      <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "#e8eaf0", letterSpacing: -1 }}>
        {value}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 15, color: color ?? "#e8eaf0" }}>{value}</div>
      <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(210,220,240,0.3)", marginTop: 3 }}>{label}</div>
    </div>
  );
}

// ─── Demographics helpers ───────────────────────────────────────────────────

const AGE_ORDER = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

function parseGenderAge(raw: Record<string, number>) {
  const brackets: Record<string, { M: number; F: number; U: number; total: number }> = {};
  for (const [key, val] of Object.entries(raw)) {
    const dot = key.indexOf(".");
    if (dot === -1) continue;
    const gender = key.slice(0, dot) as "M" | "F" | "U";
    const age    = key.slice(dot + 1);
    if (!brackets[age]) brackets[age] = { M: 0, F: 0, U: 0, total: 0 };
    brackets[age][gender] = (brackets[age][gender] ?? 0) + val;
    brackets[age].total   += val;
  }
  const grandTotal = Object.values(brackets).reduce((s, b) => s + b.total, 0) || 1;
  return AGE_ORDER
    .filter((a) => brackets[a])
    .map((age) => ({
      age,
      M: brackets[age].M,
      F: brackets[age].F,
      total: brackets[age].total,
      pct: (brackets[age].total / grandTotal) * 100,
    }));
}

function parseCountry(raw: Record<string, number>) {
  const total = Object.values(raw).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(raw)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([code, count]) => ({ code, count, pct: (count / total) * 100 }));
}

function GenderAgeChart({ data }: { data: Record<string, number> }) {
  const rows = parseGenderAge(data);
  if (rows.length === 0) return <div style={{ fontSize: 12, color: "rgba(210,220,240,0.3)" }}>No data</div>;
  const maxPct = Math.max(...rows.map((r) => r.pct));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map(({ age, M, F, pct }) => {
        const mPct = (M / (M + F || 1)) * 100;
        const fPct = 100 - mPct;
        const barW = (pct / maxPct) * 100;
        return (
          <div key={age}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, letterSpacing: 1, color: "rgba(210,220,240,0.6)", fontFamily: "monospace" }}>{age}</span>
              <span style={{ fontSize: 10, color: "rgba(210,220,240,0.3)", fontFamily: "monospace" }}>{pct.toFixed(1)}%</span>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.04)", width: `${barW}%`, minWidth: 40, display: "flex", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${mPct}%`, background: "#4f8ef7" }} />
              <div style={{ height: "100%", width: `${fPct}%`, background: "#f472b6" }} />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 3 }}>
              <span style={{ fontSize: 9, color: "#4f8ef7", fontFamily: "monospace" }}>M {fmt(M)}</span>
              <span style={{ fontSize: 9, color: "#f472b6", fontFamily: "monospace" }}>F {fmt(F)}</span>
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
        <span style={{ fontSize: 9, letterSpacing: 1, color: "#4f8ef7" }}>■ Male</span>
        <span style={{ fontSize: 9, letterSpacing: 1, color: "#f472b6" }}>■ Female</span>
      </div>
    </div>
  );
}

function CountryChart({ data }: { data: Record<string, number> }) {
  const rows = parseCountry(data);
  if (rows.length === 0) return <div style={{ fontSize: 12, color: "rgba(210,220,240,0.3)" }}>No data</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map(({ code, count, pct }) => (
        <div key={code}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, letterSpacing: 1, color: "rgba(210,220,240,0.7)", fontFamily: "monospace" }}>{code}</span>
            <span style={{ fontSize: 10, color: "rgba(210,220,240,0.3)", fontFamily: "monospace" }}>{fmt(count)} · {pct.toFixed(1)}%</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #4f8ef7, rgba(79,142,247,0.4))", borderRadius: 2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Post card ──────────────────────────────────────────────────────────────

function PostCard({ post }: { post: MediaItem }) {
  const [expanded, setExpanded] = useState(false);
  const pi = post.postInsights;
  const thumb = post.thumbnail_url ?? post.media_url;

  const engagementRate =
    pi?.reach && pi.reach > 0
      ? (((post.like_count + post.comments_count + (pi.saved ?? 0)) / pi.reach) * 100).toFixed(1) + "%"
      : null;

  return (
    <div
      style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", cursor: "pointer" }}
      onClick={() => setExpanded((v) => !v)}
    >
      {thumb && (
        <div style={{ aspectRatio: "1", overflow: "hidden", background: "#020305" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s", ...(expanded ? { transform: "scale(1.03)" } : {}) }} />
        </div>
      )}
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: 11, color: "rgba(210,220,240,0.5)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {post.caption?.slice(0, 60) ?? post.media_type}
        </div>

        {/* Basic stats row */}
        <div style={{ display: "flex", gap: 14, fontSize: 11, fontFamily: "monospace", color: "rgba(210,220,240,0.7)", marginBottom: expanded && pi ? 10 : 0 }}>
          <span>♥ {fmt(post.like_count)}</span>
          <span>💬 {fmt(post.comments_count)}</span>
          <span style={{ marginLeft: "auto", color: "rgba(210,220,240,0.3)", fontSize: 10 }}>
            {new Date(post.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        </div>

        {/* Per-post insights — shown on expand */}
        {expanded && pi && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, marginTop: 2 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              <MiniStat label="Impr." value={fmt(pi.impressions)} />
              <MiniStat label="Reach" value={fmt(pi.reach)} />
              <MiniStat label="Saves" value={fmt(pi.saved)} color="#22c55e" />
              <MiniStat label="Eng. Rate" value={engagementRate ?? "—"} color="#f59e0b" />
            </div>
          </div>
        )}

        {!expanded && pi && (
          <div style={{ fontSize: 9, letterSpacing: 1, color: "rgba(210,220,240,0.25)", textTransform: "uppercase", marginTop: 6 }}>
            tap for insights
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function InstagramClient({ entries: initialEntries, dbError }: { entries: IGEntry[]; dbError: boolean }) {
  const [live, setLive]               = useState<LiveData | null>(null);
  const [liveError, setLiveError]     = useState("");
  const [liveLoading, setLiveLoading] = useState(true);
  const [entries, setEntries]         = useState<IGEntry[]>(initialEntries);
  const [saving, setSaving]           = useState(false);
  const [snapshotMsg, setSnapshotMsg] = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(BLANK_FORM);
  const [formSaving, setFormSaving]   = useState(false);
  const [formError, setFormError]     = useState("");
  const [deleting, setDeleting]       = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/instagram-live")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setLiveError(data.error === "TOKEN_EXPIRED"
            ? "Access token has expired — update INSTAGRAM_ACCESS_TOKEN in Vercel env vars to restore live data."
            : data.error);
        } else {
          setLive(data);
        }
      })
      .catch(() => setLiveError("Failed to reach Instagram API."))
      .finally(() => setLiveLoading(false));
  }, []);

  async function saveSnapshot() {
    if (!live) return;
    setSaving(true); setSnapshotMsg("");
    const payload = {
      recorded_at:    new Date().toISOString().slice(0, 10),
      followers:      live.account.followers,
      following:      live.account.following,
      posts:          live.account.posts,
      reach:          live.insights.reach,
      impressions:    live.insights.impressions,
      profile_visits: live.insights.profile_views,
      website_clicks: live.insights.website_clicks,
      likes: null, comments: null, saves: null, shares: null, notes: "Auto snapshot",
    };
    const res  = await fetch("/api/admin/instagram", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { setEntries((prev) => [data, ...prev]); setSnapshotMsg("Snapshot saved."); }
    else { setSnapshotMsg(data.error ?? "Save failed."); }
  }

  function field(key: keyof typeof BLANK_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleManualSave(e: React.FormEvent) {
    e.preventDefault();
    setFormSaving(true); setFormError("");
    const payload = {
      recorded_at:    form.recorded_at,
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
    const res  = await fetch("/api/admin/instagram", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setFormSaving(false);
    if (!res.ok) { setFormError(data.error ?? "Save failed"); return; }
    setEntries((prev) => [data, ...prev]);
    setShowForm(false);
    setForm({ ...BLANK_FORM, recorded_at: new Date().toISOString().slice(0, 10) });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    setDeleting(id);
    await fetch(`/api/admin/instagram?id=${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeleting(null);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#020305", border: "1px solid rgba(255,255,255,0.1)",
    color: "#e8eaf0", fontSize: 13, padding: "10px 14px", outline: "none",
    borderRadius: 3, fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "monospace", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase" as const,
    color: "rgba(210,220,240,0.35)", marginBottom: 6, display: "block",
  };
  const sectionLabel: React.CSSProperties = {
    fontFamily: "monospace", fontSize: 9, letterSpacing: 2,
    color: "rgba(210,220,240,0.3)", marginBottom: 14,
  };

  const hasDemographics =
    live?.demographics &&
    (Object.keys(live.demographics.gender_age).length > 0 || Object.keys(live.demographics.country).length > 0);

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36 }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 2, color: "rgba(210,220,240,0.3)", marginBottom: 10 }}>
            {"// tools / instagram_metrics"}
          </div>
          <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "#e8eaf0", letterSpacing: -0.5 }}>
            Instagram Metrics
          </div>
          {live && (
            <div style={{ marginTop: 5, fontSize: 13, color: "rgba(210,220,240,0.4)" }}>
              @{live.account.username}
            </div>
          )}
        </div>
        {live && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {snapshotMsg && <span style={{ fontSize: 11, color: snapshotMsg.includes("failed") ? "#ef4444" : "#22c55e" }}>{snapshotMsg}</span>}
            <button
              onClick={saveSnapshot}
              disabled={saving}
              style={{
                background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
                color: "#22c55e", fontFamily: "var(--font-syne), Syne, sans-serif",
                fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                padding: "10px 20px", cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving…" : "Save Snapshot"}
            </button>
          </div>
        )}
      </div>

      {/* Loading / error */}
      {liveLoading && (
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "32px", marginBottom: 32, textAlign: "center", color: "rgba(210,220,240,0.3)", fontSize: 12, letterSpacing: 1 }}>
          Fetching live data…
        </div>
      )}
      {liveError && (
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", padding: "16px 20px", marginBottom: 32, fontSize: 12, color: "rgba(239,68,68,0.9)", lineHeight: 1.6 }}>
          ⚠ {liveError}
        </div>
      )}

      {live && (
        <>
          {/* ── Account stat cards ─────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
            <StatCard label="Followers"            value={fmt(live.account.followers)} />
            <StatCard label="Following"            value={fmt(live.account.following)} />
            <StatCard label="Posts"                value={fmt(live.account.posts)} />
            <StatCard label="Reach (28d)"          value={fmt(live.insights.reach)} />
            <StatCard label="Impressions (28d)"    value={fmt(live.insights.impressions)} />
            <StatCard label="Profile Views (28d)"  value={fmt(live.insights.profile_views)} />
            <StatCard label="Website Clicks (28d)" value={fmt(live.insights.website_clicks)} />
          </div>

          {/* ── Recent posts with per-post insights ───────────────────── */}
          {live.media.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <div style={sectionLabel}>{"// recent_posts — tap to reveal insights"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {live.media.map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            </div>
          )}

          {/* ── Audience demographics ──────────────────────────────────── */}
          {hasDemographics && (
            <div style={{ marginBottom: 40 }}>
              <div style={sectionLabel}>{"// audience_demographics"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                {/* Gender / Age */}
                {Object.keys(live.demographics!.gender_age).length > 0 && (
                  <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.07)", padding: "22px 24px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(79,142,247,0.25), transparent)" }} />
                    <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "rgba(210,220,240,0.3)", marginBottom: 18 }}>
                      {"// gender_age_breakdown"}
                    </div>
                    <GenderAgeChart data={live.demographics!.gender_age} />
                  </div>
                )}

                {/* Top countries */}
                {Object.keys(live.demographics!.country).length > 0 && (
                  <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.07)", padding: "22px 24px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(79,142,247,0.25), transparent)" }} />
                    <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "rgba(210,220,240,0.3)", marginBottom: 18 }}>
                      {"// top_countries"}
                    </div>
                    <CountryChart data={live.demographics!.country} />
                  </div>
                )}

              </div>
            </div>
          )}
        </>
      )}

      {/* ── Snapshot history ──────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={sectionLabel}>{"// snapshot_history"}</div>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            background: showForm ? "rgba(255,255,255,0.04)" : "rgba(79,142,247,0.1)",
            border: `1px solid ${showForm ? "rgba(255,255,255,0.1)" : "rgba(79,142,247,0.25)"}`,
            color: showForm ? "rgba(210,220,240,0.5)" : "#4f8ef7",
            fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
            padding: "7px 14px", cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "+ Manual Entry"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleManualSave} style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.08)", padding: 24, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
            {(["recorded_at", "followers", "following", "posts"] as const).map((k) => (
              <div key={k}>
                <label style={labelStyle}>{k.replace(/_/g, " ")}</label>
                <input type={k === "recorded_at" ? "date" : "number"} required value={form[k]} onChange={field(k)} style={inputStyle} />
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
            {(["reach", "impressions", "profile_visits", "website_clicks", "likes", "comments", "saves", "shares"] as const).map((k) => (
              <div key={k}>
                <label style={labelStyle}>{k.replace(/_/g, " ")}</label>
                <input type="number" min={0} value={form[k]} onChange={field(k)} placeholder="—" style={inputStyle} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={field("notes")} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          {formError && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 10 }}>{formError}</div>}
          <button type="submit" disabled={formSaving} style={{ background: formSaving ? "rgba(79,142,247,0.2)" : "#4f8ef7", border: "none", color: formSaving ? "#4f8ef7" : "#020305", fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", padding: "11px 24px", cursor: formSaving ? "not-allowed" : "pointer" }}>
            {formSaving ? "Saving…" : "Save"}
          </button>
        </form>
      )}

      {dbError && (
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", padding: "14px 18px", fontSize: 12, color: "#ef4444" }}>
          Run instagram-metrics-migration.sql in Supabase to enable snapshot history.
        </div>
      )}

      {!dbError && entries.length > 0 && (
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Date","Followers","Following","Posts","Reach","Impressions","Visits","Clicks","Likes","Comments","Saves","Shares","Notes",""].map((h) => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontFamily: "monospace", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(210,220,240,0.3)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px 14px", color: "rgba(210,220,240,0.7)", whiteSpace: "nowrap", fontFamily: "monospace", fontSize: 11 }}>{e.recorded_at.slice(0,10)}</td>
                  {([e.followers, e.following, e.posts, e.reach, e.impressions, e.profile_visits, e.website_clicks, e.likes, e.comments, e.saves, e.shares] as (number | null)[]).map((v, i) => (
                    <td key={i} style={{ padding: "10px 14px", color: v != null ? "#e8eaf0" : "rgba(210,220,240,0.2)", fontFamily: "monospace" }}>{fmt(v)}</td>
                  ))}
                  <td style={{ padding: "10px 14px", color: "rgba(210,220,240,0.5)", fontSize: 11, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.notes ?? "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => handleDelete(e.id)} disabled={deleting === e.id} style={{ background: "none", border: "none", color: "rgba(239,68,68,0.4)", cursor: "pointer", fontSize: 14, padding: 0 }} title="Delete">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!dbError && entries.length === 0 && !liveLoading && (
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "40px", textAlign: "center", color: "rgba(210,220,240,0.3)", fontSize: 13 }}>
          No snapshots yet — hit <strong style={{ color: "#22c55e" }}>Save Snapshot</strong> to capture today&apos;s data.
        </div>
      )}
    </div>
  );
}
