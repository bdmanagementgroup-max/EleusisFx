"use client";

import { useState } from "react";

type Resource = {
  id: string;
  category: string;
  title: string;
  url: string;
  description: string;
  active: boolean;
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#020305",
  border: "1px solid rgba(255,255,255,0.06)", color: "#e8eaf0",
  fontFamily: "var(--font-epilogue), Epilogue, sans-serif",
  fontSize: 13, fontWeight: 300, padding: "10px 14px",
  outline: "none", borderRadius: 0,
};

export default function ResourcesClient({ initial }: { initial: Resource[] }) {
  const [resources, setResources] = useState<Resource[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "Prop Firm Tools", title: "", url: "", description: "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title || !form.url) return;
    setSaving(true);
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const { resource } = await res.json();
    if (resource) {
      setResources([resource, ...resources]);
      setForm({ category: "Prop Firm Tools", title: "", url: "", description: "" });
      setShowForm(false);
    }
    setSaving(false);
  };

  const handleToggle = async (id: string, active: boolean) => {
    setResources(resources.map((r) => r.id === id ? { ...r, active: !active } : r));
    await fetch("/api/resources", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
  };

  return (
    <div style={{ padding: "56px 48px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Content</div>
          <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5 }}>Resources</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="new-btn">
          <span>{showForm ? "Cancel" : "+ Add Resource"}</span>
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "32px 28px", marginBottom: 32, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7 40%, transparent)" }} />
          <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 24 }}>New Resource</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 8 }}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                {["Prop Firm Tools", "Calculators", "Educational", "Downloads"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 8 }}>Title</label>
              <input type="text" placeholder="Resource title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 8 }}>URL / Path</label>
            <input type="text" placeholder="https://… or /articles/slug" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 8 }}>Description</label>
            <textarea rows={2} placeholder="Brief description…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: "none" }} />
          </div>
          <button onClick={handleSave} disabled={saving} className="new-btn">
            <span>{saving ? "Saving…" : "Save Resource"}</span>
          </button>
        </div>
      )}

      <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
        {resources.length === 0 && (
          <div style={{ padding: "40px 28px", fontSize: 13, color: "rgba(210,220,240,0.88)" }}>
            No resources yet — add one above.
          </div>
        )}
        {resources.map(({ id, category, title, url, active }) => (
          <div key={id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", padding: "3px 10px", background: "rgba(79,142,247,0.08)", color: "#7eb3ff", whiteSpace: "nowrap" }}>{category}</span>
            <div>
              <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 600, fontSize: 14, color: "#e8eaf0" }}>{title}</div>
              <div style={{ fontSize: 11, color: "rgba(210,220,240,0.88)" }}>{url}</div>
            </div>
            <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: active ? "#22c55e" : "rgba(210,220,240,0.88)" }}>{active ? "Active" : "Hidden"}</span>
            <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#4f8ef7", background: "transparent", border: "1px solid rgba(79,142,247,0.3)", padding: "5px 12px", textDecoration: "none" }}>View →</a>
            <button onClick={() => handleToggle(id, active)} style={{ fontSize: 11, color: "rgba(210,220,240,0.88)", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", padding: "5px 12px", cursor: "pointer" }}>
              {active ? "Hide" : "Show"}
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
      `}</style>
    </div>
  );
}
