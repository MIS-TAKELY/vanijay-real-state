"use client";

import React from "react";
import type { MapMode } from "../types";
import { MAP_MODE_LABELS } from "../config";

interface MapModeSwitcherProps {
  mode: MapMode;
  modes: MapMode[];
  onChange: (mode: MapMode) => void;
  rightOffset?: number;
}

/**
 * Pill-style switcher for toggling between map tile modes.
 */
export function MapModeSwitcher({ mode, modes, onChange, rightOffset = 16 }: MapModeSwitcherProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: rightOffset,
        zIndex: 1000,
        display: "flex",
        gap: 4,
        background: "rgba(13,26,20,0.8)",
        border: "1px solid rgba(74,222,128,0.2)",
        borderRadius: 99,
        padding: "4px 8px",
        backdropFilter: "blur(10px)",
        transition: "right 0.3s cubic-bezier(.4,0,.2,1)",
      }}
    >
      {modes.map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: active ? "#0d1a14" : "rgba(209,250,229,0.5)",
              background: active
                ? "#4ade80"
                : "transparent",
              border: "none",
              borderRadius: 99,
              padding: "6px 12px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {MAP_MODE_LABELS[m]}
          </button>
        );
      })}
    </div>
  );
}
