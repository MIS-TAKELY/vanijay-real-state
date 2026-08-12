"use client";

import React from "react";
import type { Marker } from "../types";
import { getTrendColor } from "../utils";

interface SidebarProps {
  markers: Marker[];
  selectedId: number | null;
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
        width: showList ? 300 : 0,
        minWidth: 0,
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "rgba(10,20,13,0.85)",
        backdropFilter: "blur(16px)",
        borderLeft: showList ? "1px solid rgba(255,255,255,0.08)" : "none",
        overflow: "hidden",
        transition: "width 0.3s cubic-bezier(.4,0,.2,1), border 0.3s ease",
        position: "relative",
        zIndex: 40,
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
            {markers.length} Location{markers.length !== 1 ? "s" : ""}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(209,250,229,0.4)",
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
                color: "rgba(209,250,229,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Avg growth
            </div>
          </div>
        )}
      </div>

      <div
        ref={listRef}
        className="nm-list"
        style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}
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
          .map((m, i) => {
            const isActive = m.id === selectedId;
            const c = getTrendColor(m.trend, m.tier);
            return (
              <button
                key={m.id}
                data-id={m.id}
                onClick={() => onMarkerClick(m)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  border: "none",
                  background: isActive
                    ? "rgba(74,222,128,0.1)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #4ade80"
                    : "3px solid transparent",
                  transition: "all 0.15s ease",
                  animationDelay: `${i * 30}ms`,
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
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: isActive ? "#4ade80" : "#d1fae5",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {m.price}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: c,
                      background: "rgba(255,255,255,0.05)",
                      padding: "1px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {m.trend === "up" ? "↑" : m.trend === "down" ? "↓" : "→"}{" "}
                    {m.change}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isActive ? "#f0fdf4" : "rgba(209,250,229,0.7)",
                    marginBottom: 4,
                  }}
                >
                  {m.area}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    fontSize: 9,
                    color: "rgba(134,239,172,0.7)",
                  }}
                >
                  {m.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: "rgba(134,239,172,0.7)",
                        background: "rgba(74,222,128,0.08)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        letterSpacing: "0.03em",
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
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "rgba(209,250,229,0.35)",
            letterSpacing: "0.03em",
          }}
        >
          Nepal · {markers.length} locations
        </span>
        <a
          href="/map"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#4ade80",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 4,
            letterSpacing: "0.02em",
          }}
        >
          Full map ↗
        </a>
      </div>
    </div>
  );
}
