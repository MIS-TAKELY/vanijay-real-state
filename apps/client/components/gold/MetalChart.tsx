"use client";

import { useMemo } from "react";
import type { CurrencyCode, MetalData } from "../../constants/gold/metals";
import { formatPrice } from "../../constants/gold/metals";

interface MetalChartProps {
  metal: MetalData;
  currency: CurrencyCode;
  timeRange: "1D" | "1W" | "1M" | "3M" | "1Y";
  onTimeRangeChange: (range: "1D" | "1W" | "1M" | "3M" | "1Y") => void;
}

const TIME_RANGES = ["1D", "1W", "1M", "3M", "1Y"] as const;

export function MetalChart({
  metal,
  currency,
  timeRange,
  onTimeRangeChange,
}: MetalChartProps) {
  // Build SVG path from the sparkline in the display currency
  const { pathD, areaD, minVal, maxVal } = useMemo(() => {
    const data = currency === "USD" ? metal.sparklineUsd : metal.sparkline;
    if (data.length === 0)
      return { pathD: "", areaD: "", minVal: 0, maxVal: 0 };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 600;
    const height = 220;
    const padding = 8;

    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y =
        height - padding - ((val - min) / range) * (height - padding * 2);
      return [x, y] as const;
    });

    const linePath = points
      .map(
        ([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`,
      )
      .join(" ");

    const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

    return { pathD: linePath, areaD: areaPath, minVal: min, maxVal: max };
  }, [currency, metal.sparkline, metal.sparklineUsd]);

  const isUp = metal.change >= 0;
  const strokeColor = isUp ? "#34D399" : "#F87171";
  const gradientId = `chart-gradient-${metal.id}`;

  return (
    <div className="chart-glow flex flex-col rounded-xl border border-white/[0.06] bg-[#1A1D23]">
      {/* Time range tabs */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <span
          className="text-xs font-medium tracking-wider text-white/40"
          style={{ fontFamily: "var(--font-body)" }}
        >
          PRICE HISTORY
        </span>
        <div className="flex gap-1" role="tablist" aria-label="Time range">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              role="tab"
              aria-selected={timeRange === range}
              onClick={() => onTimeRangeChange(range)}
              className={`
                time-tab rounded px-3 py-1 text-xs font-medium transition-colors
                ${
                  timeRange === range
                    ? "bg-white/[0.08] text-[#E8E6E1]"
                    : "text-white/30 hover:text-white/60"
                }
              `}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="relative flex-1 px-5 py-4" style={{ minHeight: 240 }}>
        <svg
          viewBox="0 0 600 220"
          className="h-full w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${metal.name} price chart for ${timeRange}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <line
              key={pct}
              x1="0"
              y1={pct * 220}
              x2="600"
              y2={pct * 220}
              stroke="white"
              strokeOpacity="0.04"
              strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Min/Max labels */}
        <div className="absolute bottom-4 left-5 flex gap-4">
          <div>
            <span
              className="block text-[10px] uppercase tracking-wider text-white/30"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Low
            </span>
            <span
              className="text-xs font-medium text-white/60"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatPrice(minVal, currency)}
            </span>
          </div>
          <div>
            <span
              className="block text-[10px] uppercase tracking-wider text-white/30"
              style={{ fontFamily: "var(--font-body)" }}
            >
              High
            </span>
            <span
              className="text-xs font-medium text-white/60"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatPrice(maxVal, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
