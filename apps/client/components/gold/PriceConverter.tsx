"use client";

import { useState } from "react";
import type {
  CurrencyCode,
  MetalData,
  WeightUnit,
} from "../../constants/gold/metals";
import {
  convertCurrency,
  convertUnit,
  CURRENCY_SYMBOLS,
  formatConvertedPrice,
} from "../../constants/gold/metals";

interface PriceConverterProps {
  metal: MetalData;
  currency: CurrencyCode;
  /** Page-level unit from the UnitToggle — converter defaults to this. */
  defaultUnit?: WeightUnit;
}

export function PriceConverter({
  metal,
  currency,
  defaultUnit,
}: PriceConverterProps) {
  const [amount, setAmount] = useState<string>("1");
  const [unit, setUnit] = useState<WeightUnit>(defaultUnit ?? "gram");

  const numericAmount = parseFloat(amount) || 0;
  // metal.usdPrice is in USD per metal.unit (e.g. USD/oz for gold, USD/lb for copper)
  const usdPriceInNativeUnit = metal.usdPrice;
  const pricePerSelectedUnit = convertUnit(
    usdPriceInNativeUnit,
    metal.unit,
    unit,
  );
  const totalUsd = pricePerSelectedUnit * numericAmount;
  const totalInCurrency = convertCurrency(totalUsd, currency);

  return (
    <section
      aria-labelledby="converter-heading"
      className="rounded-xl border border-white/[0.06] bg-[#1A1D23] p-6"
    >
      <h2
        id="converter-heading"
        className="mb-4 text-lg font-medium tracking-tight text-[#E8E6E1]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {metal.name} Price Converter
      </h2>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[120px]">
          <label
            htmlFor="converter-amount"
            className="mb-1.5 block text-xs uppercase tracking-wider text-white/30"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Amount
          </label>
          <input
            id="converter-amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-[#E8E6E1] outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </div>

        <div className="min-w-[100px]">
          <label
            htmlFor="converter-unit"
            className="mb-1.5 block text-xs uppercase tracking-wider text-white/30"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Unit
          </label>
          <select
            id="converter-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as WeightUnit)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-[#E8E6E1] outline-none focus:border-[#C9A84C]/50"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <option value="oz">Troy Ounce</option>
            <option value="gram">Gram</option>
            <option value="kilo">Kilogram</option>
            <option value="tola">Tola</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <span
            className="mb-1.5 block text-xs uppercase tracking-wider text-white/30"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Value in {currency}
          </span>
          <div
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-lg font-semibold text-[#C9A84C]"
            style={{ fontFamily: "var(--font-mono)" }}
            aria-live="polite"
          >
            {CURRENCY_SYMBOLS[currency]}
            {totalInCurrency.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      <p
        className="mt-3 text-xs text-white/25"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Based on live {metal.name} spot price of{" "}
        {formatConvertedPrice(metal.usdPrice, currency, "oz", metal.unit)} per{" "}
        {metal.unit}
      </p>
    </section>
  );
}
