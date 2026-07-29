"use client";

import React from "react";
import type { Marker } from "../types";
import { getTrendColor, getTrendLabel } from "../utils";
import { PIN_WIDTH } from "../config";

interface PinMarkupProps {
  marker: Marker;
  selected: boolean;
  hottest: boolean;
}

/**
 * Renders the custom pin bubble markup used inside Leaflet divIcon.
 * This component is rendered to static HTML via renderToStaticMarkup.
 */
export function PinMarkup({ marker, selected, hottest }: PinMarkupProps) {
  const c = getTrendColor(marker.trend, marker.tier);
  const bg = selected ? "#1a3326" : "#ffffff";
  const fg = selected ? "#ffffff" : "#111827";
  const sub = selected ? "rgba(255,255,255,0.7)" : c;

  return React.createElement(
    "div",
    {
      style: {
        width: PIN_WIDTH,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        filter: selected
          ? "drop-shadow(0 12px 24px rgba(0,0,0,0.35))"
          : "drop-shadow(0 3px 8px rgba(0,0,0,0.18))",
        transform: selected ? "scale(1.18) translateY(-3px)" : "scale(1)",
        transformOrigin: "bottom center",
        transition:
          "transform 0.28s cubic-bezier(.175,.885,.32,1.275), filter 0.28s ease",
      },
    },
    React.createElement(
      "div",
      {
        style: {
          background: bg,
          border: `2px solid ${selected ? "#244530" : "#e5e7eb"}`,
          borderLeft: `4px solid ${c}`,
          borderRadius: 10,
          padding: "5px 9px",
          position: "relative",
          minWidth: PIN_WIDTH - 8,
        },
      },
      /* ── HOT badge ── */
      hottest &&
        React.createElement(
          "span",
          {
            style: {
              position: "absolute",
              top: -7,
              right: -4,
              background: c,
              color: "#fff",
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.08em",
              padding: "1px 5px",
              borderRadius: 99,
              animation: "nm-pulse 2s ease-out infinite",
            },
          },
          "HOT"
        ),
      /* ── Price ── */
      React.createElement(
        "div",
        {
          style: {
            fontSize: 12,
            fontWeight: 700,
            color: fg,
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
            fontFamily: "'IBM Plex Mono', monospace",
          },
        },
        marker.price
      ),
      /* ── Trend + Change ── */
      React.createElement(
        "div",
        {
          style: {
            fontSize: 10,
            fontWeight: 700,
            color: sub,
            marginTop: 1,
          },
        },
        `${getTrendLabel(marker.trend)} ${marker.change}`
      ),
      /* ── Area name ── */
      React.createElement(
        "div",
        {
          style: {
            fontSize: 8,
            fontWeight: 600,
            color: selected ? "rgba(255,255,255,0.5)" : "#6b7280",
            marginTop: 1,
          },
        },
        marker.area
      )
    ),
    /* ── Stem arrow ── */
    React.createElement(
      "div",
      {
        style: {
          width: 0,
          height: 0,
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: `8px solid ${selected ? "#244530" : "#e5e7eb"}`,
        },
      },
      null
    )
  );
}

/**
 * Generates the raw HTML string for a Leaflet divIcon.
 * This avoids React DOM rendering issues inside leaflet.
 */
export function renderPinHtml(
  marker: Marker,
  selected: boolean,
  hottest: boolean
): string {
  const c = getTrendColor(marker.trend, marker.tier);
  const bg = selected ? "#1a3326" : "#ffffff";
  const fg = selected ? "#ffffff" : "#111827";
  const sub = selected ? "rgba(255,255,255,0.75)" : c;
  const hotBadge = hottest
    ? `<span style="position:absolute;top:-7px;right:-4px;background:${c};color:#fff;font-size:8px;font-weight:800;letter-spacing:0.08em;padding:1px 5px;border-radius:99px;animation:nm-pulse 2s ease-out infinite;z-index:2">HOT</span>`
    : "";

  return `
<div style="width:${PIN_WIDTH}px;display:flex;flex-direction:column;align-items:center;${
    selected
      ? "filter:drop-shadow(0 12px 24px rgba(0,0,0,0.45));transform:scale(1.15) translateY(-3px);"
      : "filter:drop-shadow(0 3px 8px rgba(0,0,0,0.22));transform:scale(1);"
  }transform-origin:bottom center;transition:transform 0.28s cubic-bezier(.175,.885,.32,1.275),filter 0.28s ease">
  <div style="background:${bg};border:2px solid ${
    selected ? "#244530" : "#e5e7eb"
  };border-left:4px solid ${c};border-radius:10px;padding:4px 8px;position:relative;width:${PIN_WIDTH}px;box-sizing:border-box;text-align:center">
    ${hotBadge}
    <div style="font-size:11px;font-weight:700;color:${fg};letter-spacing:-0.02em;white-space:nowrap;font-family:'IBM Plex Mono',monospace;line-height:1.2">${
      marker.price
    }</div>
    <div style="font-size:9px;font-weight:700;color:${sub};margin-top:1px;line-height:1.2">${getTrendLabel(marker.trend)} ${marker.change}</div>
    <div style="font-size:8px;font-weight:600;color:${
      selected ? "rgba(255,255,255,0.6)" : "#6b7280"
    };margin-top:1px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${marker.area}</div>
  </div>
  <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid ${
    selected ? "#244530" : "#e5e7eb"
  };margin-top:-1px"></div>
</div>`;
}
