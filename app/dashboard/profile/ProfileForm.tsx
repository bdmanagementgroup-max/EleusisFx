"use client";
import { useState } from "react";

type ProfileData = {
  display_name: string;
  phone: string;
  address_1: string;
  city: string;
  postcode: string;
  country: string;
  avatar_url: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#020305",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 2,
  padding: "10px 12px",
  color: "#e8eaf0",
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "rgba(210,220,240,0.58)",
  marginBottom: 6,
};

const fieldStyle: React.CSSProperties = {
  marginBottom: 24,
};

export default function ProfileForm({
  email,
  initialData,
}: {
  email: string;
  initialData: ProfileData;
}) {
  const [form, setForm] = useState<ProfileData>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof ProfileData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Avatar preview */}
      {form.avatar_url && (
        <div style={{ marginBottom: 32 }}>
          <img
            src={form.avatar_url}
            alt="Avatar preview"
            style={{
              width: 72, height: 72,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(79,142,247,0.4)",
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Display Name</label>
          <input
            style={inputStyle}
            value={form.display_name}
            onChange={(e) => set("display_name", e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Email <span style={{ color: "rgba(210,220,240,0.3)", fontSize: 9, letterSpacing: 1 }}>— cannot be changed</span></label>
          <input
            style={{ ...inputStyle, color: "#e8eaf0", background: "rgba(255,255,255,0.03)", cursor: "default", borderColor: "rgba(255,255,255,0.04)" }}
            value={email}
            readOnly
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Phone</label>
          <input
            style={inputStyle}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+44 7700 000000"
            type="tel"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Address Line 1</label>
          <input
            style={inputStyle}
            value={form.address_1}
            onChange={(e) => set("address_1", e.target.value)}
            placeholder="123 Example Street"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>City</label>
          <input
            style={inputStyle}
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="London"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Postcode</label>
          <input
            style={inputStyle}
            value={form.postcode}
            onChange={(e) => set("postcode", e.target.value)}
            placeholder="SW1A 1AA"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Country</label>
          <input
            style={inputStyle}
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            placeholder="United Kingdom"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Avatar URL</label>
          <input
            style={inputStyle}
            value={form.avatar_url}
            onChange={(e) => set("avatar_url", e.target.value)}
            placeholder="https://..."
            type="url"
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "11px 28px",
            background: "#4f8ef7",
            border: "none",
            borderRadius: 2,
            color: "#fff",
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontFamily: "inherit",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>

        {saved && (
          <span style={{ fontSize: 12, color: "#22c55e", letterSpacing: 1 }}>
            ✓ Saved
          </span>
        )}
        {error && (
          <span style={{ fontSize: 12, color: "#ef4444" }}>{error}</span>
        )}
      </div>

      <style>{`
        form input:focus { border-color: rgba(79,142,247,0.5) !important; }
      `}</style>
    </form>
  );
}
