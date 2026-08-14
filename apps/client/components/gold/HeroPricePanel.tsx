"use client";

import Link from "next/link";
import type {
  CurrencyCode,
  MetalData,
} from "../../constants/gold/metals";
import { METAL_SLUGS } from "../../constants/gold/metals";
import {
  formatChange,
  formatChangePercent,
  formatPrice,
  formatSpread,
  getBidAsk,
} from "../../constants/gold/metals";

interface HeroPricePanelProps {
  metal: MetalData;
  metals: MetalData[];
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
}

export function HeroPricePanel({
  metal,
  metals,
  currency,
  onCurrencyChange,
}: HeroPricePanelProps) {
  const isUp = metal.change >= 0;
  const { bid, ask } = getBidAsk(metal, currency);
  const spread = formatSpread(bid, ask, currency);

  return (
    <div className="flex flex-col justify-between gap-6">
      {/* Metal selector pills + currency toggle */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Select a metal"
        >
          {metals.map((m) => {
            const isActive = metal.id === m.id;
            const slug = METAL_SLUGS[m.id];
            const href = `/${slug}`;
            return (
              <Link
                key={m.id}
                href={href}
                role="tab"
                aria-selected={isActive}
                className={`
                  rounded-full px-3 py-1 text-xs font-medium capitalize tracking-wide transition-colors
                  ${
                    isActive
                      ? "bg-white/[0.12] text-[#E8E6E1]"
                      : "text-white/40 hover:text-white/70"
                  }
                `}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {m.name}
              </Link>
            );
          })}
        </div>

        {/* Currency toggle */}
        <div
          className="flex shrink-0 gap-0.5 rounded-full border border-white/[0.08] p-0.5"
          role="group"
          aria-label="Display currency"
        >
          {(["NPR", "USD"] as const).map((c) => (
            <button
              key={c}
              onClick={() => onCurrencyChange(c)}
              aria-pressed={currency === c}
              className={`
                rounded-full px-3 py-1 text-xs font-medium transition-colors
                ${
                  currency === c
                    ? "bg-white/[0.12] text-[#E8E6E1]"
                    : "text-white/40 hover:text-white/70"
                }
              `}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {c === "NPR" ? "रू NPR" : "$ USD"}
            </button>
          ))}
        </div>
      </div>

      {/* Large price display */}
      <div>
        <div className="mb-1 flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: metal.accentColor }}
            aria-hidden="true"
          />
          <h1
            className="text-lg font-medium tracking-tight text-white/60"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {metal.name}
            <span className="ml-2 text-sm font-normal text-white/30">
              {metal.symbol} · per {metal.unit}
            </span>
          </h1>
        </div>

        <div
          className="text-5xl font-semibold tracking-tight text-[#E8E6E1] md:text-6xl"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatPrice(metal.price, currency)}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span
            className={`text-lg font-medium ${isUp ? "text-[#34D399]" : "text-[#F87171]"}`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatChange(currency === "USD" ? metal.changeUsd : metal.change)}{" "}
            {formatChangePercent(metal.changePercent)})
          </span>
          <span
            className="text-xs text-white/30"
            style={{ fontFamily: "var(--font-body)" }}
          >
            today
          </span>
        </div>

        {/* Bid / Ask / Spread */}
        {bid != null && ask != null && spread ? (
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
            <div>
              <span
                className="block text-[10px] uppercase tracking-wider text-white/30"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Bid
              </span>
              <span
                className="text-sm font-medium text-[#E8E6E1]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatPrice(bid, currency)}
              </span>
            </div>
            <div>
              <span
                className="block text-[10px] uppercase tracking-wider text-white/30"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Ask
              </span>
              <span
                className="text-sm font-medium text-[#E8E6E1]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatPrice(ask, currency)}
              </span>
            </div>
            <div>
              <span
                className="block text-[10px] uppercase tracking-wider text-white/30"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Spread
              </span>
              <span
                className="text-sm font-medium text-[#E8E6E1]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {spread}
              </span>
            </div>
          </div>
        ) : (
          <p
            className="mt-4 text-xs text-white/25"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Spot price only — no order book available for {metal.name}.
          </p>
        )}
      </div>

      {/* Description */}
      <p
        className="text-sm leading-relaxed text-white/50"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {metal.description}
      </p>
    </div>
  );
}
