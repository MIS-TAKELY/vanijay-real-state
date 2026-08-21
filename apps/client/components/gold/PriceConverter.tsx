"use client";

import { useState } from "react";
import type { CurrencyCode, MetalData, WeightUnit } from "../../constants/gold/metals";
import {
  CURRENCY_SYMBOLS,
  convertUnit,
  formatPrice,
  priceInCurrency,
} from "../../constants/gold/metals";

interface PriceConverterProps {
  metal: MetalData;
  currency: CurrencyCode;
  defaultUnit?: WeightUnit;
}

const CONVERTER_UNITS: Array<{ value: WeightUnit; label: string }> = [
  { value: "tola", label: "Tola" },
  { value: "gram", label: "Gram" },
  { value: "oz", label: "Troy Ounce" },
  { value: "kilo", label: "Kilogram" },
  { value: "anna", label: "Anna" },
  { value: "sukhi", label: "Sukhi" },
];

export function PriceConverter({
  metal,
  currency,
  defaultUnit,
}: PriceConverterProps) {
  const [weight, setWeight] = useState("1");
  const [unit, setUnit] = useState<WeightUnit>(defaultUnit ?? metal.unit);
  const [convertedUnit, setConvertedUnit] = useState<WeightUnit>("gram");

  const amount = Number.parseFloat(weight) || 0;
  const basePrice = priceInCurrency(metal, currency);
  const priceInDisplayUnit = convertUnit(basePrice, metal.unit, unit);
  const value = amount * priceInDisplayUnit;

  const convertedPricePerUnit = convertUnit(basePrice, metal.unit, convertedUnit);
  const equivalentWeight = amount > 0 ? value / convertedPricePerUnit : 0;

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-6 md:p-8">
      <h3
        className="mb-1 text-2xl font-medium tracking-tight text-on-surface"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Price Converter
      </h3>
      <p
        className="mb-4 text-sm text-on-surface-variant sm:mb-6"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Convert {metal.name} weight into its current market value.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="pc-weight"
            className="mb-1.5 block text-xs font-medium text-on-surface-variant"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Weight
          </label>
          <input
            id="pc-weight"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm font-medium text-on-surface tabular-nums outline-none transition-colors focus:border-gold/60 focus:ring-1 focus:ring-gold/30"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </div>

        <div>
          <label
            htmlFor="pc-unit"
            className="mb-1.5 block text-xs font-medium text-on-surface-variant"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Unit
          </label>
          <select
            id="pc-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as WeightUnit)}
            className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm font-medium text-on-surface outline-none transition-colors focus:border-gold/60 focus:ring-1 focus:ring-gold/30"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {CONVERTER_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="mt-4 rounded-xl border border-gold/30 bg-gold-soft/40 p-5 text-center"
        aria-live="polite"
      >
        <p
          className="text-xs uppercase tracking-[0.14em] text-gold-deep"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Market Value
        </p>
        <p
          className="mt-1 text-3xl font-semibold tabular-nums text-on-surface"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatPrice(value, currency)}
        </p>
        <p
          className="mt-1 text-xs text-on-surface-variant"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {CURRENCY_SYMBOLS[currency]} {formatPrice(priceInDisplayUnit, currency)} per{" "}
          {unit} ({metal.symbol})
        </p>
      </div>

      <div
        className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-xl border border-outline-variant bg-surface-container/50 p-4 text-sm text-on-surface-variant"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <span>≈ {equivalentWeight.toFixed(2)} {convertedUnit}s</span>
        <span className="hidden text-on-surface-variant/50 sm:inline">·</span>
        <select
          aria-label="Convert to unit"
          value={convertedUnit}
          onChange={(e) => setConvertedUnit(e.target.value as WeightUnit)}
          className="rounded-lg border border-outline-variant bg-white px-2 py-1 text-xs font-medium text-on-surface outline-none focus:border-gold/60"
        >
          {CONVERTER_UNITS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}