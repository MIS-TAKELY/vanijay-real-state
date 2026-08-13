"use client";

import React from "react";
import type { Marker } from "../types";
import { getTrendColor, getTrendLabel } from "../utils";

interface DetailCardProps {
  marker: Marker;
  onClose: () => void;
  onStreetView: (marker: Marker) => void;
  onSatelliteZoom: (marker: Marker) => void;
}

export function DetailCard({
  marker,
  onClose,
  onStreetView,
  onSatelliteZoom,
}: DetailCardProps) {
  const m = marker;

  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        left: 16,
        zIndex: 1001,
        width: 300,
        background: "rgba(13,26,20,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(74,222,128,0.3)",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.65)",
        animation: "nm-card-in 0.3s ease forwards",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close detail"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "rgba(255,255,255,0.08)",
          border: "none",
          borderRadius: "50%",
          width: 26,
          height: 26,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(209,250,229,0.7)",
          fontSize: 14,
        }}
      >
        ✕
      </button>

      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "rgba(74,222,128,0.7)",
          marginBottom: 4,
        }}
      >
        {m.city} · {m.region}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "'Fraunces', serif",
            color: "#f0fdf4",
          }}
        >
          {m.area}
        </h3>
        {m.verified && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#4ade80",
              border: "1px solid rgba(74,222,128,0.4)",
              borderRadius: 4,
              padding: "1px 6px",
              letterSpacing: "0.05em",
            }}
          >
            ✓ VERIFIED
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
        <span
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#4ade80",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {m.price
            ? m.price.replace(/रू/g, "₹").replace(/NPR/g, "₹").trim()
            : `₹ ${m.priceValue}M`}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: m.trend === "up" ? "#f87171" : "rgba(209,250,229,0.6)",
            display: "flex",
            alignItems: "center",
            gap: 3,
            background:
              m.trend === "up"
                ? "rgba(220,38,38,0.15)"
                : "rgba(255,255,255,0.07)",
            padding: "2px 8px",
            borderRadius: 99,
          }}
        >
          {getTrendLabel(m.trend)} {m.change}
        </span>
      </div>

      <p
        style={{
          fontSize: 12,
          color: "rgba(209,250,229,0.6)",
          lineHeight: 1.5,
          marginBottom: 12,
        }}
      >
        {m.description}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {[
          { label: "Area", value: `${m.sqFt} sqft` },
          { label: "Price / sqft", value: `रू ${m.psf}` },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              padding: "8px 10px",
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "rgba(209,250,229,0.4)",
                marginBottom: 3,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#d1fae5",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 14,
        }}
      >
        {m.tags.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#86efac",
              background: "rgba(74,222,128,0.12)",
              border: "1px solid rgba(74,222,128,0.2)",
              padding: "3px 8px",
              borderRadius: 6,
              letterSpacing: "0.03em",
            }}
          >
            {t}
          </span>
        ))}
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#fcd34d",
            background: "rgba(252,211,77,0.1)",
            border: "1px solid rgba(252,211,77,0.2)",
            padding: "3px 8px",
            borderRadius: 6,
            textTransform: "capitalize",
            letterSpacing: "0.03em",
          }}
        >
          {m.tier}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <button
          type="button"
          onClick={() => onSatelliteZoom(m)}
          style={{
            padding: "8px 0",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'Public Sans', sans-serif",
            color: "#86efac",
            background: "rgba(36,69,48,0.6)",
            border: "1px solid rgba(74,222,128,0.3)",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          🛰️ Street Zoom (z18)
        </button>
        <button
          type="button"
          onClick={() => onStreetView(m)}
          style={{
            padding: "8px 0",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'Public Sans', sans-serif",
            color: "#38bdf8",
            background: "rgba(14,165,233,0.18)",
            border: "1px solid rgba(56,189,248,0.35)",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          📷 360° Street View
        </button>
      </div>

      <button
        style={{
          width: "100%",
          padding: "10px 0",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "'Public Sans', sans-serif",
          color: "#0d1a14",
          background:
            "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          letterSpacing: "0.02em",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.9";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        View Listings in {m.area} →
      </button>
    </div>
  );
}
