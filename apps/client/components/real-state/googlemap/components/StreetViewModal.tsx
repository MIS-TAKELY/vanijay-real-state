"use client";

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import type { Marker, ModalTab } from "../types";
import { buildStreetViewUrl } from "../utils";

interface StreetViewModalProps {
  marker: Marker;
  tab: ModalTab;
  onTabChange: (tab: ModalTab) => void;
  onClose: () => void;
}

const TABS: { id: ModalTab; label: string }[] = [
  { id: "streetview", label: "🌐 Street View" },
  { id: "satellite", label: "🛰️ Satellite" },
  { id: "data", label: "📊 Data" },
];

export function StreetViewModal({
  marker,
  tab,
  onTabChange,
  onClose,
}: StreetViewModalProps) {
  const streetViewUrl = buildStreetViewUrl(marker.lat, marker.lng);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${marker.lat},${marker.lng}`;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const popup = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Street View — ${marker.area}`}
        style={{
          width: "100%",
          maxWidth: 540,
          maxHeight: "calc(100vh - 80px)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 16,
          overflow: "hidden",
          background: "rgba(10,20,13,0.98)",
          border: "1px solid rgba(74,222,128,0.2)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(74,222,128,0.06)",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(36,69,48,0.18)",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#f0fdf4" }}>
              {marker.area}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(209,250,229,0.4)",
                fontFamily: "'IBM Plex Mono', monospace",
                marginTop: 2,
              }}
            >
              {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(209,250,229,0.7)",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.14)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.07)";
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(13,26,20,0.6)",
            flexShrink: 0,
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: active ? "#4ade80" : "rgba(209,250,229,0.45)",
                  background: "transparent",
                  border: "none",
                  borderBottom: active
                    ? "2px solid #4ade80"
                    : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          {tab === "data" ? (
            <DataTabContent marker={marker} />
          ) : tab === "satellite" ? (
            <SatellitePlaceholder marker={marker} />
          ) : (
            <StreetViewLauncher
              marker={marker}
              streetViewUrl={streetViewUrl}
              googleMapsUrl={googleMapsUrl}
            />
          )}
        </div>

        <div
          style={{
            padding: "10px 18px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(13,26,20,0.5)",
            flexShrink: 0,
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a
              href={streetViewUrl}
              target="_blank"
              rel="noreferrer"
              style={footerLink("#38bdf8")}
            >
              🌐 Street View ↗
            </a>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              style={footerLink("#4ade80")}
            >
              📍 Maps ↗
            </a>
          </div>
          <span
            style={{
              fontSize: 9,
              color: "rgba(209,250,229,0.25)",
              whiteSpace: "nowrap",
            }}
          >
            © Google Maps
          </span>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(popup, document.body);
}

function footerLink(color: string): React.CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 700,
    color,
    textDecoration: "none",
    background: `${color}15`,
    border: `1px solid ${color}35`,
    padding: "4px 10px",
    borderRadius: 99,
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  };
}

function SatellitePlaceholder({ marker }: { marker: Marker }) {
  return (
    <div
      style={{
        height: 340,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a140d",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 40 }}>🛰️</div>
      <div style={{ fontSize: 13, color: "rgba(209,250,229,0.6)", textAlign: "center", maxWidth: 300 }}>
        Satellite view uses Google Maps native tiles. Open in Google Maps for full satellite imagery.
      </div>
      <a
        href={`https://www.google.com/maps/@${marker.lat},${marker.lng},17z/data=!3m1!1e3`}
        target="_blank"
        rel="noreferrer"
        style={{
          ...footerLink("#4ade80"),
          padding: "8px 20px",
          fontSize: 12,
        }}
      >
        Open Satellite View ↗
      </a>
    </div>
  );
}

function StreetViewLauncher({
  marker,
  streetViewUrl,
  googleMapsUrl,
}: {
  marker: Marker;
  streetViewUrl: string;
  googleMapsUrl: string;
}) {
  return (
    <div
      style={{
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        background:
          "radial-gradient(ellipse at center, rgba(36,69,48,0.28) 0%, rgba(0,0,0,0) 70%)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(74,222,128,0.1)",
          border: "1.5px solid rgba(74,222,128,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
        }}
      >
        🌐
      </div>

      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#f0fdf4",
            marginBottom: 8,
          }}
        >
          360° Street View
        </div>
        <p
          style={{
            fontSize: 12,
            color: "rgba(209,250,229,0.5)",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          Google Maps blocks in-app embedding. Click below to open an
          interactive panorama for{" "}
          <strong style={{ color: "#4ade80" }}>{marker.area}</strong> in a new
          tab.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <a
          href={streetViewUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#4ade80",
            color: "#0d1a14",
            fontWeight: 800,
            fontSize: 12,
            padding: "10px 22px",
            borderRadius: 99,
            textDecoration: "none",
            boxShadow: "0 6px 20px rgba(74,222,128,0.3)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 10px 28px rgba(74,222,128,0.45)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 6px 20px rgba(74,222,128,0.3)";
          }}
        >
          🌐 Open 360° View ↗
        </a>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.07)",
            color: "#d1fae5",
            fontWeight: 700,
            fontSize: 12,
            padding: "10px 20px",
            borderRadius: 99,
            textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.12)",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.12)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.07)";
          }}
        >
          📍 Google Maps ↗
        </a>
      </div>

      <div
        style={{
          fontSize: 10,
          color: "rgba(209,250,229,0.3)",
          fontFamily: "'IBM Plex Mono', monospace",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 6,
          padding: "4px 12px",
        }}
      >
        {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
      </div>
    </div>
  );
}

function DataTabContent({ marker }: { marker: Marker }) {
  const rows = [
    { label: "Area", value: marker.area },
    { label: "City", value: marker.city },
    { label: "Region", value: marker.region },
    { label: "Price", value: marker.price },
    { label: "Price / sqft", value: `रू ${marker.psf}` },
    { label: "SqFt", value: marker.sqFt },
    { label: "Change", value: marker.change },
    { label: "Tier", value: marker.tier },
    { label: "Verified", value: marker.verified ? "✅ Yes" : "No" },
    {
      label: "Coordinates",
      value: `${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}`,
    },
  ];
  return (
    <div style={{ overflowY: "auto", maxHeight: 320, padding: "4px 0" }}>
      {rows.map((r, i) => (
        <div
          key={r.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "9px 18px",
            background:
              i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "rgba(209,250,229,0.4)",
              fontWeight: 600,
            }}
          >
            {r.label}
          </span>
          <span
            style={{
              fontSize: 12,
              color: "#d1fae5",
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 500,
            }}
          >
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}
