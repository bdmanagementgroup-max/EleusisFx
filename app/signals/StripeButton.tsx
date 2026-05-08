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

      if (response.status === 401) {
        window.location.href = "/login?redirect=/signals";
        return;
      }

      if (!response.ok) {
        setError("Failed to redirect to checkout. Please try again.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Checkout unavailable. Please try again.");
        setLoading(false);
      }
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
