"use client";

import React from "react";
import { LEGEND_ITEMS } from "../config";

/**
 * Bottom legend bar explaining pin colors and status indicators.
 */
export function Legend() {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 10,
        maxWidth: 1400,
        margin: "0 auto",
        padding: "14px 24px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "8px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {LEGEND_ITEMS.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "rgba(209,250,229,0.5)",
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: item.color,
              flexShrink: 0,
              animation: item.pulse
                ? "nm-pulse 2s ease-out infinite"
                : undefined,
            }}
          />
          {item.label}
        </div>
      ))}
    </div>
  );
}
