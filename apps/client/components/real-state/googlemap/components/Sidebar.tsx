"use client";

import React from "react";
import type { Marker } from "../types";

interface SidebarProps {
  markers: Marker[];
  selectedId: string | null;
  avgChange: number;
  onMarkerClick: (marker: Marker) => void;
  showList: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
}

export function Sidebar({
  markers,
  selectedId,
  avgChange,
  onMarkerClick,
  showList,
  listRef,
}: SidebarProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: showList ? 320 : 0,
        minWidth: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        background: "rgba(10,20,13,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderLeft: showList ? "1px solid rgba(255,255,255,0.08)" : "none",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(36,69,48,0.15)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#4ade80",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {markers.length} LOCATIONS
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(209,250,229,0.45)",
              marginTop: 1,
            }}
          >
            Sorted by market value
          </div>
        </div>
        {markers.length > 0 && (
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#f87171",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              +{avgChange.toFixed(1)}%
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "rgba(209,250,229,0.45)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              AVG GROWTH
            </div>
          </div>
        )}
      </div>

      <div
        ref={listRef}
        className="nm-list"
        style={{ overflowY: "auto", flex: 1, padding: "4px 0" }}
      >
        {markers.length === 0 && (
          <div
            style={{
              padding: "48px 16px",
              textAlign: "center",
              color: "rgba(209,250,229,0.4)",
              fontSize: 13,
            }}
          >
            No locations match your filters
          </div>
        )}

        {[...markers]
          .sort((a, b) => b.priceValue - a.priceValue)
          .map((m) => {
            const isActive = m.id === selectedId;
            const formattedPrice = m.price
              ? m.price.replace(/रू/g, "₹").replace(/NPR/g, "₹").trim()
              : `₹ ${m.priceValue}M`;
            const trendColor =
              m.trend === "up"
                ? "#f87171"
                : m.trend === "down"
                  ? "#60a5fa"
                  : "#fb923c";
            const trendSign =
              m.trend === "up" ? "↑" : m.trend === "down" ? "↓" : "→";

            return (
              <button
                key={m.id}
                data-id={m.id}
                onClick={() => onMarkerClick(m)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  borderTop: "none",
                  borderRight: "none",
                  background: isActive
                    ? "rgba(74,222,128,0.12)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #4ade80"
                    : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: isActive ? "#4ade80" : "#fafafa",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {formattedPrice}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: trendColor,
                    }}
                  >
                    {trendSign} {m.change}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isActive ? "#f0fdf4" : "#ffffff",
                    marginBottom: 6,
                  }}
                >
                  {m.area}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {m.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#4ade80",
                        background: "rgba(34, 197, 94, 0.15)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
      </div>

      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(10,20,13,0.95)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "rgba(209,250,229,0.45)",
            letterSpacing: "0.03em",
          }}
        >
          Nepal · {markers.length} locations
        </span>
      
      </div>
    </div>
  );
}

