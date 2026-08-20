"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { CurrencyCode, MetalData } from "../../constants/gold/metals";
import { convertCurrency, formatPrice } from "../../constants/gold/metals";

interface MetalChartProps {
  metal: MetalData;
  currency: CurrencyCode;
}

// SVG layout constants
const SVG_W = 600;
const SVG_H = 220;
const PAD = { top: 12, right: 12, bottom: 24, left: 0 };
const CHART_H = SVG_H - PAD.top - PAD.bottom;

export function MetalChart({ metal, currency }: MetalChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [tooltipSide, setTooltipSide] = useState<"left" | "right">("right");

  const rawData = currency === "NPR" ? metal.sparkline : metal.sparklineUsd;

  // Compute all derived values in one memo
  const chart = useMemo(() => {
    if (rawData.length === 0)
      return {
        points: [] as [number, number][],
        minVal: 0,
        maxVal: 0,
        range: 1,
        pathD: "",
        areaD: "",
      };

    const min = Math.min(...rawData);
    const max = Math.max(...rawData);
    const range = max - min || 1;

    const usableW = SVG_W - PAD.left - PAD.right;

    const pts: [number, number][] = rawData.map((val, i) => {
      const x = PAD.left + (i / (rawData.length - 1)) * usableW;
      const y = PAD.top + CHART_H - ((val - min) / range) * CHART_H;
      return [x, y];
    });

    const linePath = pts
      .map(
        ([x, y], i) =>
          `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`,
      )
      .join(" ");

    const areaPath = `${linePath} L${SVG_W},${SVG_H} L0,${SVG_H} Z`;

    return {
      points: pts,
      minVal: min,
      maxVal: max,
      range,
      pathD: linePath,
      areaD: areaPath,
    };
  }, [rawData]);

  const { points, minVal, maxVal, range, pathD, areaD } = chart;

  // Y-axis tick values (5 evenly spaced)
  const yTicks = useMemo(() => {
    if (range === 0) return [minVal];
    return [0, 0.25, 0.5, 0.75, 1].map((pct) => minVal + pct * range);
  }, [minVal, range]);

  // Map a pixel x to the nearest data index
  const idxFromSvgX = useCallback(
    (svgX: number): number => {
      const usableW = SVG_W - PAD.left - PAD.right;
      const rawIdx = ((svgX - PAD.left) / usableW) * (points.length - 1);
      return Math.round(Math.max(0, Math.min(points.length - 1, rawIdx)));
    },
    [points.length],
  );

  // Handle pointer movement over the chart
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg || points.length === 0) return;

      const rect = svg.getBoundingClientRect();
      const scaleX = SVG_W / rect.width;
      const svgX = (e.clientX - rect.left) * scaleX;

      const idx = idxFromSvgX(svgX);
      setHoverIdx(idx);

      // Flip tooltip to left side when near the right edge
      const usableW = SVG_W - PAD.left - PAD.right;
      const normalizedX = (idx / (points.length - 1)) * usableW + PAD.left;
      setTooltipSide(normalizedX > SVG_W * 0.7 ? "left" : "right");
    },
    [idxFromSvgX, points.length],
  );

  const handlePointerLeave = useCallback(() => setHoverIdx(null), []);

  const isUp = metal.change >= 0;
  const strokeColor = isUp ? "#34D399" : "#F87171";
  const gradientId = `chart-gradient-${metal.id}`;

  // Min/max converted for display
  const displayMin =
    currency === "NPR" ? minVal : convertCurrency(minVal, currency);
  const displayMax =
    currency === "NPR" ? maxVal : convertCurrency(maxVal, currency);

  // Hover values
  const hoverPoint = hoverIdx != null ? points[hoverIdx] : null;
  const hoverRawVal = hoverIdx != null ? rawData[hoverIdx] : null;
  const hoverDisplayVal =
    hoverRawVal != null
      ? currency === "NPR"
        ? hoverRawVal
        : convertCurrency(hoverRawVal, currency)
      : null;

  return (
    <div className="chart-glow flex min-w-0 flex-col rounded-xl border border-white/[0.06] bg-[#1A1D23]">
      {/* Header — honest label, no fake time range */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <span
          className="text-xs font-medium tracking-wider text-white/40"
          style={{ fontFamily: "var(--font-body)" }}
        >
          PRICE TREND
        </span>
        <span
          className="text-[10px] text-white/25"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Simulated · 30 data points
        </span>
      </div>

      {/* Chart area */}
      <div
        className="relative flex-1 px-2 pt-4 sm:px-5"
        style={{ minHeight: 260 }}
      >
        {/* Tooltip overlay (rendered outside SVG for crisp text) */}
        {hoverPoint && hoverDisplayVal != null && (
          <div
            className="pointer-events-none absolute z-10 select-none"
            style={{
              left: `${(hoverPoint[0] / SVG_W) * 100}%`,
              top: `${(hoverPoint[1] / SVG_H) * 100}%`,
              transform:
                tooltipSide === "left"
                  ? "translate(-100%, -50%) translateX(-12px)"
                  : "translate(0, -50%) translateX(12px)",
            }}
          >
            <div className="rounded-lg border border-white/10 bg-[#12141A]/95 px-3 py-2 shadow-xl backdrop-blur-sm">
              <div
                className="text-[11px] font-medium text-white/40"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Point {hoverIdx != null ? hoverIdx + 1 : ""} of {rawData.length}
              </div>
              <div
                className="text-sm font-semibold tabular-nums text-[#E8E6E1]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatPrice(hoverDisplayVal, currency)}
              </div>
            </div>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="h-full w-full cursor-crosshair"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${metal.name} price trend chart`}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{ touchAction: "none" }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>

            {/* Glow filter for the hover dot */}
            <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>
          </defs>

          {/* Grid lines + Y-axis labels */}
          {yTicks.map((val, i) => {
            const pct = i / (yTicks.length - 1);
            const y = PAD.top + CHART_H * (1 - pct);
            const displayVal =
              currency === "NPR" ? val : convertCurrency(val, currency);
            const isHighlighted =
              hoverPoint && Math.abs(hoverPoint[1] - y) < 8;
            return (
              <g key={i}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={SVG_W}
                  y2={y}
                  stroke="white"
                  strokeOpacity={isHighlighted ? 0.08 : 0.04}
                  strokeWidth="1"
                  strokeDasharray={isHighlighted ? "4 4" : "none"}
                  style={{
                    transition: "stroke-opacity 0.15s, stroke-dasharray 0.15s",
                  }}
                />
                <text
                  x={SVG_W - 4}
                  y={y + 3.5}
                  textAnchor="end"
                  style={{
                    fontSize: "9px",
                    fontFamily: "var(--font-mono)",
                    fill: isHighlighted
                      ? "rgba(255,255,255,0.5)"
                      : "rgba(255,255,255,0.22)",
                    transition: "fill 0.15s",
                  }}
                >
                  {formatPrice(displayVal, currency)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Price line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Crosshair vertical line */}
          {hoverPoint && (
            <line
              x1={hoverPoint[0]}
              y1={PAD.top}
              x2={hoverPoint[0]}
              y2={PAD.top + CHART_H}
              stroke="white"
              strokeOpacity="0.12"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Hover data point with glow */}
          {hoverPoint && (
            <g>
              {/* Outer glow */}
              <circle
                cx={hoverPoint[0]}
                cy={hoverPoint[1]}
                r="8"
                fill={strokeColor}
                opacity="0.2"
                filter="url(#dot-glow)"
              />
              {/* Inner ring */}
              <circle
                cx={hoverPoint[0]}
                cy={hoverPoint[1]}
                r="5"
                fill="#1A1D23"
                stroke={strokeColor}
                strokeWidth="2"
              />
              {/* Center dot */}
              <circle
                cx={hoverPoint[0]}
                cy={hoverPoint[1]}
                r="2"
                fill={strokeColor}
              />
            </g>
          )}
        </svg>

      </div>

      {/* Low / High — below the plot so they never cover the line */}
      <div className="flex items-center justify-between gap-4 border-t border-white/[0.06] px-5 py-3">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider text-white/40"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Low
          </span>
          <span
            className="text-xs font-semibold tabular-nums text-[#E8E6E1]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatPrice(displayMin, currency)}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider text-white/40"
            style={{ fontFamily: "var(--font-body)" }}
          >
            High
          </span>
          <span
            className="text-xs font-semibold tabular-nums text-[#E8E6E1]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatPrice(displayMax, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
