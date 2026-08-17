"use client";

import React from "react";
import Link from "next/link";
import type { Marker } from "../types";
import { getTrendColor, getTrendLabel, stripHtml } from "../utils";

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
  const cleanDesc = stripHtml(m.description);
  const listingUrl =
    m.id && m.id.length > 5
      ? `/${m.id}`
      : `/search?q=${encodeURIComponent(m.area)}`;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: 16,
        transform: "translateY(-50%)",
        zIndex: 1001,
        width: 300,
        maxWidth: "calc(100% - 32px)",
        maxHeight: "calc(100% - 24px)",
        overflowY: "auto",
        overscrollBehavior: "contain",
        boxSizing: "border-box",
        background: "rgba(13,26,20,0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(74,222,128,0.35)",
        borderRadius: 16,
        padding: "14px 16px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.75)",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(74,222,128,0.3) transparent",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close detail"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "rgba(255,255,255,0.08)",
          border: "none",
          borderRadius: "50%",
          width: 24,
          height: 24,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(232,217,168,0.7)",
          fontSize: 13,
        }}
      >
        ✕
      </button>

      <div
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "rgba(74,222,128,0.7)",
          marginBottom: 3,
          paddingRight: 24,
        }}
      >
        {m.city} · {m.region}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
          paddingRight: 24,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 800,
            fontFamily: "'Fraunces', serif",
            color: "#f0fdf4",
            lineHeight: 1.2,
          }}
        >
          {m.area}
        </h3>
        {m.verified && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#c9a227",
              border: "1px solid rgba(74,222,128,0.4)",
              borderRadius: 4,
              padding: "1px 5px",
              letterSpacing: "0.05em",
              flexShrink: 0,
            }}
          >
            ✓ VERIFIED
          </span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#c9a227",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {m.price
            ? m.price.replace(/रू/g, "₹").replace(/NPR/g, "₹").trim()
            : `₹ ${m.priceValue}M`}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: m.trend === "up" ? "#f87171" : "rgba(232,217,168,0.6)",
            display: "flex",
            alignItems: "center",
            gap: 3,
            background:
              m.trend === "up"
                ? "rgba(220,38,38,0.15)"
                : "rgba(255,255,255,0.07)",
            padding: "1px 6px",
            borderRadius: 99,
          }}
        >
          {getTrendLabel(m.trend)} {m.change}
        </span>
      </div>

      {cleanDesc && (
        <p
          style={{
            fontSize: 11.5,
            color: "rgba(232,217,168,0.7)",
            lineHeight: 1.4,
            marginBottom: 8,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordBreak: "break-word",
          }}
          title={cleanDesc}
        >
          {cleanDesc}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          marginBottom: 8,
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
              borderRadius: 6,
              padding: "6px 8px",
            }}
          >
            <div
              style={{
                fontSize: 8.5,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "rgba(232,217,168,0.4)",
                marginBottom: 2,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#e8d9a8",
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
          gap: 5,
          marginBottom: 8,
        }}
      >
        {m.tags.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              color: "#a8bfd9",
              background: "rgba(74,222,128,0.12)",
              border: "1px solid rgba(74,222,128,0.2)",
              padding: "2px 6px",
              borderRadius: 5,
              letterSpacing: "0.03em",
            }}
          >
            {t}
          </span>
        ))}
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            color: "#fcd34d",
            background: "rgba(252,211,77,0.1)",
            border: "1px solid rgba(252,211,77,0.2)",
            padding: "2px 6px",
            borderRadius: 5,
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
          gap: 6,
          marginBottom: 8,
        }}
      >
        <button
          type="button"
          onClick={() => onSatelliteZoom(m)}
          style={{
            padding: "6px 0",
            fontSize: 10.5,
            fontWeight: 700,
            fontFamily: "'Public Sans', sans-serif",
            color: "#a8bfd9",
            background: "rgba(36,69,48,0.6)",
            border: "1px solid rgba(74,222,128,0.3)",
            borderRadius: 6,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          🛰️ Street Zoom
        </button>
        <button
          type="button"
          onClick={() => onStreetView(m)}
          style={{
            padding: "6px 0",
            fontSize: 10.5,
            fontWeight: 700,
            fontFamily: "'Public Sans', sans-serif",
            color: "#38bdf8",
            background: "rgba(14,165,233,0.18)",
            border: "1px solid rgba(56,189,248,0.35)",
            borderRadius: 6,
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

      <Link
        href={listingUrl}
        style={{
          width: "100%",
          padding: "8px 0",
          fontSize: 11.5,
          fontWeight: 700,
          fontFamily: "'Public Sans', sans-serif",
          color: "#0a2540",
          background: "linear-gradient(135deg, #c9a227 0%, #8a6d1d 100%)",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          letterSpacing: "0.02em",
          transition: "opacity 0.15s ease, transform 0.15s ease",
          textAlign: "center",
          textDecoration: "none",
          display: "block",
          boxSizing: "border-box",
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
      </Link>
    </div>
  );
}
