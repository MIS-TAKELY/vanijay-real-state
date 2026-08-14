"use client";

import { useMemo } from "react";
import type {
  CurrencyCode,
  MetalData,
  MetalId,
} from "../../constants/gold/metals";
import {
  formatChangePercent,
  formatPrice,
  formatSpread,
  getBidAsk,
} from "../../constants/gold/metals";

interface MetalCardGridProps {
  metals: MetalData[];
  activeId: MetalId;
  currency: CurrencyCode;
  onSelect: (id: MetalId) => void;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const svgPath = useMemo(() => {
    if (data.length === 0) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 80;
    const h = 28;

    return data
      .map((val, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((val - min) / range) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data]);

  return (
    <svg viewBox="0 0 80 28" className="h-7 w-20" aria-hidden="true">
      <path
        d={svgPath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sparkline-path"
      />
    </svg>
  );
}

export function MetalCardGrid({
  metals,
  activeId,
  currency,
  onSelect,
}: MetalCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metals.map((metal) => {
        const isUp = metal.change >= 0;
        const isActive = metal.id === activeId;
        const { bid, ask } = getBidAsk(metal, currency);
        const spread = formatSpread(bid, ask, currency);

        return (
          <button
            key={metal.id}
            onClick={() => onSelect(metal.id)}
            className={`
              metal-card group flex flex-col gap-3 rounded-xl border p-5 text-left transition-colors
              ${
                isActive
                  ? "border-white/[0.12] bg-[#1A1D23]"
                  : "border-white/[0.06] bg-[#1A1D23]/60 hover:border-white/[0.10] hover:bg-[#1A1D23]"
              }
            `}
            aria-pressed={isActive}
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: metal.accentColor }}
                  aria-hidden="true"
                />
                <span
                  className="text-sm font-medium text-[#E8E6E1]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {metal.name}
                </span>
                <span
                  className="text-xs text-white/30"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {metal.symbol}
                </span>
              </div>
              <MiniSparkline
                data={metal.sparkline}
                color={isUp ? "#34D399" : "#F87171"}
              />
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl font-semibold text-[#E8E6E1]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatPrice(metal.price, currency)}
              </span>
              <span
                className="text-xs text-white/30"
                style={{ fontFamily: "var(--font-body)" }}
              >
                /{metal.unit}
              </span>
            </div>

            {/* Change + spread */}
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-xs font-medium ${isUp ? "text-[#34D399]" : "text-[#F87171]"}`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatChangePercent(metal.changePercent)} today
              </span>
              {spread && (
                <span
                  className="truncate text-[10px] text-white/25"
                  style={{ fontFamily: "var(--font-mono)" }}
                  title={`Spread: ${spread}`}
                >
                  {spread}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
