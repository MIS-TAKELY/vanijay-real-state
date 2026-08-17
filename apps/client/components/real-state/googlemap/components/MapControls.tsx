"use client";

import React from "react";

export function CompassRose() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 16,
        zIndex: 1000,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(10,37,64,0.85)",
        border: "1px solid rgba(201,162,39,0.35)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
      }}
      aria-label="Compass"
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: "#c9a227",
          fontFamily: "monospace",
        }}
      >
        N
      </span>
    </div>
  );
}

export function HintBar() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        background: "rgba(10,37,64,0.8)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: 99,
        padding: "5px 14px",
        fontSize: 10,
        fontWeight: 600,
        color: "rgba(232,217,168,0.65)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        letterSpacing: "0.03em",
      }}
    >
      Scroll to zoom &middot; Click pin for details &middot; Drag to pan
    </div>
  );
}

export function MobileListToggle({
  showList,
  onToggle,
  className,
}: {
  showList: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={showList ? "Hide list" : "Show list"}
      style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        zIndex: 1001,
        width: 46,
        height: 46,
        borderRadius: "50%",
        background: "#103050",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
      className={className}
    >
      <svg viewBox="0 0 24 24" fill="white" style={{ width: 18, height: 18 }}>
        {showList ? (
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        ) : (
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        )}
      </svg>
    </button>
  );
}
