"use client";

import { useState } from "react";

export default function StripeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      if (!response.ok) {
        setError("Failed to redirect to checkout");
        setLoading(false);
        return;
      }

      // Response is a redirect, the browser should follow it automatically
      // But just in case, we'll wait a moment for the redirect to happen
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          background: loading ? "#3d7bde" : "#4f8ef7",
          color: "#fff",
          border: "none",
          padding: "14px 28px",
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          borderRadius: 4,
          transition: "all 0.3s ease",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Redirecting..." : "Subscribe Now"}
      </button>
      {error && <p style={{ color: "#ff6b6b", fontSize: 12, marginTop: 12 }}>{error}</p>}
    </>
  );
}
