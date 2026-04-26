"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#020305",
  border: "1px solid rgba(255,255,255,0.06)", color: "#e8eaf0",
  fontFamily: "var(--font-epilogue), Epilogue, sans-serif",
  fontSize: 14, fontWeight: 300, padding: "12px 16px",
  outline: "none", transition: "border-color 0.2s", borderRadius: 0,
};

export default function NewArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", category: "Prop Firms", content: "", published: false });
  const [saving, setSaving] = useState(false);

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSave = async (publish: boolean) => {
    setSaving(true);
    const payload = { ...form, published: publish };
    await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    router.push("/admin/articles");
  };

  return (
    <div style={{ padding: "56px 48px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>New Article</div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1.5 }}>Create Article</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Main editor */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 8 }}>Title</label>
            <input
              type="text" placeholder="Article title…" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: autoSlug(e.target.value) })}
              style={{ ...inputStyle, fontSize: 18, fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 8 }}>Excerpt</label>
            <textarea
              placeholder="Brief summary shown in article listings…" rows={3} value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 8 }}>Content (HTML)</label>
            <textarea
              placeholder="<h2>Section heading</h2><p>Your content here…</p>"
              rows={24} value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 13 }}
            />
            <p style={{ marginTop: 8, fontSize: 11, color: "rgba(210,220,240,0.88)" }}>
              Write in HTML. Supported tags: h2, h3, p, ul/li, strong, em, table.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "24px 20px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 16 }}>Publish</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => handleSave(false)} disabled={saving} className="draft-btn">
                {saving ? "Saving…" : "Save as Draft"}
              </button>
              <button onClick={() => handleSave(true)} disabled={saving} className="publish-btn">
                <span>{saving ? "Publishing…" : "Publish Article →"}</span>
              </button>
            </div>
          </div>

          <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "24px 20px" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 16 }}>Settings</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 8 }}>Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 8 }}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                {["Prop Firms", "Strategy", "Funding", "News"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .draft-btn {
          width: 100%; background: transparent; color: #e8eaf0;
          font-family: var(--font-syne), Syne, sans-serif;
          font-weight: 600; font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; padding: 12px;
          border: 1px solid rgba(255,255,255,0.12); cursor: pointer;
          transition: all 0.2s; border-radius: 0;
        }
        .draft-btn:hover { border-color: rgba(255,255,255,0.3); }
        .publish-btn {
          width: 100%; background: #e8eaf0; color: #020305;
          font-family: var(--font-syne), Syne, sans-serif;
          font-weight: 700; font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; padding: 13px;
          border: none; cursor: pointer;
          transition: all 0.25s; position: relative; overflow: hidden; border-radius: 0;
        }
        .publish-btn::after {
          content: ''; position: absolute; inset: 0;
          background: #4f8ef7; transform: translateX(-101%);
          transition: transform 0.3s ease;
        }
        .publish-btn:hover::after { transform: translateX(0); }
        .publish-btn span { position: relative; z-index: 1; color: #020305; }
        .publish-btn:hover span { color: #e8eaf0; }
      `}</style>
    </div>
  );
}
