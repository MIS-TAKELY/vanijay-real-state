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
  const sentiment = metal.changePercent > 0.5 ? "Bullish" : metal.changePercent < -0.5 ? "Bearish" : "Neutral";
  const sentimentColor = sentiment === "Bullish" ? "#34D399" : sentiment === "Bearish" ? "#F87171" : "#A8A9AD";

  const stats = [
    { label: "52W High", value: formatPrice(convertCurrency(high52w, currency), currency) },
    { label: "52W Low", value: formatPrice(convertCurrency(low52w, currency), currency) },
    { label: "Avg Volume", value: `${avgVolume.toLocaleString()} ${metal.unit}` },
    { label: "Volatility", value: `${volatility}%` },
    { label: "Market Sentiment", value: sentiment, color: sentimentColor },
    { label: "24h Change", value: `${metal.changePercent >= 0 ? "+" : ""}${metal.changePercent.toFixed(2)}%`, color: metal.changePercent >= 0 ? "#34D399" : "#F87171" },
  ];

  return (
    <section aria-labelledby="analytics-heading">
      <h2
        id="analytics-heading"
        className="mb-6 text-2xl font-medium tracking-tight md:text-3xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Key Statistics
        <span className="ml-3 text-base font-normal text-white/30">
          {metal.name} ({metal.symbol})
        </span>
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.06] bg-[#1A1D23] p-4"
          >
            <span
              className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {stat.label}
            </span>
            <span
              className="text-lg font-semibold"
              style={{
                fontFamily: "var(--font-mono)",
                color: stat.color || "#E8E6E1",
              }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* 52-week range visual bar */}
      <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#1A1D23] p-4">
        <div className="flex items-center justify-between text-xs text-white/30 mb-2" style={{ fontFamily: "var(--font-body)" }}>
          <span>52W Low</span>
          <span className="uppercase tracking-wider">52-Week Range</span>
          <span>52W High</span>
        </div>
        <div className="relative h-2 w-full rounded-full bg-white/[0.06]">
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${Math.min(100, Math.max(5, ((usdPrice - low52w) / (high52w - low52w)) * 100))}%`,
              backgroundColor: metal.accentColor,
              opacity: 0.7,
            }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#0F1114]"
            style={{
              left: `${Math.min(98, Math.max(2, ((usdPrice - low52w) / (high52w - low52w)) * 100))}%`,
              backgroundColor: metal.accentColor,
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs font-medium" style={{ fontFamily: "var(--font-mono)" }}>
          <span className="text-white/40">{formatPrice(convertCurrency(low52w, currency), currency)}</span>
          <span style={{ color: metal.accentColor }}>{formatPrice(convertCurrency(usdPrice, currency), currency)}</span>
          <span className="text-white/40">{formatPrice(convertCurrency(high52w, currency), currency)}</span>
        </div>
      </div>
    </section>
  );
}
