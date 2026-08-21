"use client";

import type { CurrencyCode, MetalData } from "../../constants/gold/metals";
import { formatPrice, convertCurrency } from "../../constants/gold/metals";

interface AnalyticsGridProps {
  metal: MetalData;
  currency: CurrencyCode;
}

export function AnalyticsGrid({ metal, currency }: AnalyticsGridProps) {
  const usdPrice = metal.usdPrice;
  // Simulated analytics data based on current price
  const high52w = usdPrice * 1.12;
  const low52w = usdPrice * 0.78;
  const avgVolume = Math.round(usdPrice * 450);
  const volatility = (metal.volatility * 100).toFixed(1);
  const sentiment =
    metal.changePercent > 0.5
      ? "Bullish"
      : metal.changePercent < -0.5
        ? "Bearish"
        : "Neutral";
  const sentimentColor =
    sentiment === "Bullish"
      ? "#16a34a"
      : sentiment === "Bearish"
        ? "#dc2626"
        : "#55637a";

  const stats = [
    {
      label: "52W High",
      value: formatPrice(convertCurrency(high52w, currency), currency),
    },
    {
      label: "52W Low",
      value: formatPrice(convertCurrency(low52w, currency), currency),
    },
    {
      label: "Avg Volume",
      value: `${avgVolume.toLocaleString()} ${metal.unit}`,
    },
    { label: "Volatility", value: `${volatility}%` },
    { label: "Market Sentiment", value: sentiment, color: sentimentColor },
    {
      label: "24h Change",
      value: `${metal.changePercent >= 0 ? "+" : ""}${metal.changePercent.toFixed(2)}%`,
      color: metal.changePercent >= 0 ? "#16a34a" : "#dc2626",
    },
  ];

  return (
    <section aria-labelledby="analytics-heading">
      <h2
        id="analytics-heading"
        className="mb-6 text-2xl font-medium tracking-tight text-on-surface md:text-3xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Key Statistics
        <span className="ml-3 text-base font-normal text-on-surface-variant">
          {metal.name} ({metal.symbol})
        </span>
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-outline-variant bg-surface p-4 shadow-sm"
          >
            <span
              className="block text-[9px] uppercase tracking-wider text-on-surface-variant mb-1 sm:text-[10px]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {stat.label}
            </span>
            <span
              className="text-base font-semibold tabular-nums sm:text-lg"
              style={{
                fontFamily: "var(--font-mono)",
                color: stat.color || "var(--color-on-surface)",
              }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* 52-week range visual bar */}
      <div className="mt-4 rounded-xl border border-outline-variant bg-surface p-4 shadow-sm">
        <div
          className="flex items-center justify-between text-xs text-on-surface-variant mb-2"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <span>52W Low</span>
          <span className="uppercase tracking-wider">52-Week Range</span>
          <span>52W High</span>
        </div>
        <div className="relative h-2 w-full rounded-full bg-surface-container-high">
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${Math.min(100, Math.max(5, ((usdPrice - low52w) / (high52w - low52w)) * 100))}%`,
              backgroundColor: metal.accentColor,
              opacity: 0.7,
            }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-surface"
            style={{
              left: `${Math.min(98, Math.max(2, ((usdPrice - low52w) / (high52w - low52w)) * 100))}%`,
              backgroundColor: metal.accentColor,
            }}
          />
        </div>
        <div
          className="flex items-center justify-between mt-2 text-xs font-medium tabular-nums"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span className="text-on-surface-variant">
            {formatPrice(convertCurrency(low52w, currency), currency)}
          </span>
          <span style={{ color: metal.accentColor }}>
            {formatPrice(convertCurrency(usdPrice, currency), currency)}
          </span>
          <span className="text-on-surface-variant">
            {formatPrice(convertCurrency(high52w, currency), currency)}
          </span>
        </div>
      </div>
    </section>
  );
}