"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

interface Article {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  sortKey: string; // ISO date string for sorting
}

export default function ArticlesList({ articles }: { articles: Article[] }) {
  const [asc, setAsc] = useState(false);

  const sorted = useMemo(
    () =>
      [...articles].sort((a, b) => {
        const diff = new Date(a.sortKey).getTime() - new Date(b.sortKey).getTime();
        return asc ? diff : -diff;
      }),
    [articles, asc]
  );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <button
          onClick={() => setAsc((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 10,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(210,220,240,0.58)",
            background: "none",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "8px 16px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#4f8ef7";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(79,142,247,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(210,220,240,0.58)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <span>{asc ? "↑" : "↓"}</span>
          <span>{asc ? "Oldest first" : "Newest first"}</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {sorted.map(({ slug, tag, title, excerpt, date, readTime }) => (
          <Link key={slug} href={`/articles/${slug}`} className="article-card-item">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase", color: "#4f8ef7", marginBottom: 20 }}>
              <span style={{ width: 16, height: 1, background: "#4f8ef7", display: "inline-block" }} />
              {tag}
            </div>
            <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 20, lineHeight: 1.25, letterSpacing: -0.4, marginBottom: 16, color: "#e8eaf0", transition: "color 0.2s" }}>
              {title}
            </h2>
            <p style={{ fontSize: 13, lineHeight: 1.85, color: "rgba(210,220,240,0.88)", flex: 1, marginBottom: 28 }}>{excerpt}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(210,220,240,0.58)" }}>
                {date}{readTime ? ` · ${readTime}` : ""}
              </span>
              <span className="article-arrow-item" style={{ fontSize: 12, color: "rgba(210,220,240,0.58)", transition: "all 0.2s" }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
