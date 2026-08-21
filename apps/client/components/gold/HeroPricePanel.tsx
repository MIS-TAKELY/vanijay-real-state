"use client";

import { ArrowDownRight, ArrowUpRight, ChevronDown } from "lucide-react";
import type {
  CurrencyCode,
  MetalData,
  WeightUnit,
} from "../../constants/gold/metals";
import {
  changeInCurrency,
  convertUnit,
  formatChange,
  formatChangePercent,
  formatPrice,
  formatSpread,
  getBidAsk,
  priceInCurrency,
} from "../../constants/gold/metals";
import { CurrencyToggle } from "./CurrencyToggle";
import type { FenegosidaTodayRate } from "lib/fenegosida";

/** Weight-unit drop-down options for ounce-priced metals. Tola is the default. */
const UNIT_OPTIONS: Array<{ value: WeightUnit; label: string }> = [
  { value: "tola", label: "Tola (तोला)" },
  { value: "gram", label: "Gram" },
  { value: "oz", label: "Troy Ounce" },
  { value: "kilo", label: "Kilogram" },
  { value: "anna", label: "Anna (आना)" },
  { value: "sukhi", label: "Sukhi (सुकी)" },
];

interface HeroPricePanelProps {
  metal: MetalData;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  unit: WeightUnit;
  onUnitChange: (unit: WeightUnit) => void;
  /** Official Fenegosida NPR rate — overrides the headline price for gold/silver in NPR. */
  todayRate?: FenegosidaTodayRate | null;
}

export function HeroPricePanel({
  metal,
  currency,
  onCurrencyChange,
  unit,
  onUnitChange,
  todayRate,
}: HeroPricePanelProps) {
  const isUp = metal.change >= 0;
  const { bid, ask } = getBidAsk(metal, currency);
  const spread = formatSpread(bid, ask, currency);
  const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;
  const hasOrderBook = bid != null && ask != null && spread != null;

  // Today's price — live spot converted into the selected display unit.
  // Only weight-priced metals (gold, silver, …) offer the unit dropdown;
  // metals quoted per lb/carat/ton keep their native unit.
  const canChooseUnit = metal.unit === "oz";
  const displayUnit = canChooseUnit ? unit : metal.unit;
  const spotInCurrency = priceInCurrency(metal, currency);

  // Official Fenegosida NPR rate overrides the headline for gold/silver.
  // Tola uses the API's own figure; every other unit scales from per-gram.
  const officialRate =
    todayRate &&
    (metal.id === "gold" || metal.id === "silver") &&
    currency === "NPR"
      ? todayRate
      : null;

  const pricePerUnit = officialRate
    ? displayUnit === "tola"
      ? officialRate.perTola
      : convertUnit(officialRate.perGram, "gram", displayUnit)
    : convertUnit(spotInCurrency, metal.unit, displayUnit);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {/* Header: metal identity */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: metal.accentColor }}
          aria-hidden="true"
        />
        <h2
          className="text-lg font-medium tracking-tight text-on-surface-variant"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {metal.name}
          <span className="ml-2 text-sm font-normal text-on-surface-variant/70">
            {metal.symbol}
          </span>
        </h2>
      </div>

      {/* Highlight: Today's price + unit dropdown right next to it */}
      <div>
        <div
          className="mb-2 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-gold-deep"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <span className="h-px w-6 bg-gold/60" aria-hidden="true" />
          Today&apos;s Price
        </div>

        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <div
            className="text-4xl font-semibold tracking-tight text-on-surface tabular-nums sm:text-5xl lg:text-[clamp(2.25rem,4vw,3.75rem)]"
            style={{ fontFamily: "var(--font-mono)" }}
            aria-live="polite"
          >
            {formatPrice(pricePerUnit, currency)}
            {!canChooseUnit && (
              <span
                className="ml-2 text-base font-normal text-on-surface-variant/70"
                style={{ fontFamily: "var(--font-body)" }}
              >
                per {displayUnit}
              </span>
            )}
          </div>

          {/* Unit dropdown — sits right next to the price */}
          {canChooseUnit ? (
            <div className="relative self-end">
              <label htmlFor="hero-unit-select" className="sr-only">
                Price unit
              </label>
              <select
                id="hero-unit-select"
                value={unit}
                onChange={(e) => onUnitChange(e.target.value as WeightUnit)}
                className="appearance-none rounded-md border border-outline-variant bg-surface py-1.5 pl-3 pr-8 text-sm font-medium text-on-surface outline-none shadow-sm transition-colors focus:border-gold/60 focus:ring-1 focus:ring-gold/30"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
                aria-hidden="true"
              />
            </div>
          ) : null}
        </div>

        {/* Currency chooser — stays near the price */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CurrencyToggle
            currency={currency}
            onCurrencyChange={onCurrencyChange}
          />
        </div>
      </div>

      {/* Change badge */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium tabular-nums ${
            isUp
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-red-500/10 text-red-600"
          }`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <TrendIcon size={14} aria-hidden="true" />
          {formatChange(changeInCurrency(metal, currency))} (
          {formatChangePercent(metal.changePercent)})
        </span>
        <span
          className="text-xs text-on-surface-variant/70"
          style={{ fontFamily: "var(--font-body)" }}
        >
          today
        </span>
      </div>

      {/* Order book snapshot (spot price available) */}
      {hasOrderBook && (
        <dl className="grid grid-cols-3 gap-2 border-t border-outline-variant bg-surface-container/50 px-3 py-3 pt-3 text-center rounded-xl sm:gap-3 sm:px-4 sm:py-4 sm:pt-4">
          {[
            { label: "Bid", value: bid != null ? formatPrice(bid, currency) : "—" },
            { label: "Ask", value: ask != null ? formatPrice(ask, currency) : "—" },
            { label: "Spread", value: spread ?? "—" },
          ].map((row) => (
            <div key={row.label} className="min-w-0">
              <dt
                className="text-[9px] font-medium uppercase tracking-wider text-on-surface-variant sm:text-[10px]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {row.label}
              </dt>
              <dd
                className="mt-0.5 text-sm font-medium text-on-surface tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <p
        className="text-sm leading-relaxed text-on-surface-variant"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {metal.description}
      </p>
    </div>
  );
}