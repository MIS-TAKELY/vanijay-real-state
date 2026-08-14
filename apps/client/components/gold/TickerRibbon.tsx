"use client";

import type {
  CurrencyCode,
  MetalData,
  MetalId,
} from "../../constants/gold/metals";
import { formatChangePercent, formatPrice } from "../../constants/gold/metals";

interface TickerRibbonProps {
  metals: MetalData[];
  currency: CurrencyCode;
  onSelect: (id: MetalId) => void;
  activeId: MetalId;
}

export function TickerRibbon({
  metals,
  currency,
  onSelect,
  activeId,
}: TickerRibbonProps) {
  // Duplicate the list for seamless infinite scroll
  const doubled = [...metals, ...metals];

  return (
    <div
      className="relative overflow-hidden border-b border-white/[0.06] bg-[#0A0C0F]"
      role="marquee"
      aria-label="Live precious metals prices"
    >
      <div className="ticker-track py-3">
        {doubled.map((metal, i) => {
          const isUp = metal.change >= 0;
          const isActive = metal.id === activeId && i < metals.length;

          return (
            <button
              key={`${metal.id}-${i}`}
              onClick={() => onSelect(metal.id)}
              className={`
                flex shrink-0 items-center gap-3 border-r border-white/[0.06] px-6
                transition-colors hover:bg-white/[0.04]
                ${isActive ? "bg-white/[0.06]" : ""}
              `}
              style={{ fontFamily: "var(--font-mono)" }}
              aria-pressed={isActive}
            >
              {/* Metal indicator dot */}
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: metal.accentColor }}
                aria-hidden="true"
              />

              {/* Symbol */}
              <span className="text-xs font-medium tracking-wider text-white/50">
                {metal.symbol}
              </span>

              {/* Price */}
              <span className="text-sm font-semibold text-[#E8E6E1]">
                {formatPrice(metal.price, currency)}
              </span>

              {/* Change */}
              <span
                className={`text-xs font-medium ${isUp ? "text-[#34D399]" : "text-[#F87171]"}`}
              >
                {formatChangePercent(metal.changePercent)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fade edges */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0A0C0F] to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0A0C0F] to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
