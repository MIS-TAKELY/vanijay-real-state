"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronDown } from "lucide-react";
import type {
  CurrencyCode,
  MetalData,
  NepalUnit,
} from "../../constants/gold/metals";
import {
  changeInCurrency,
  formatChange,
  formatChangePercent,
  formatPrice,
  formatSpread,
  getBidAsk,
  NEPAL_UNITS,
  priceInCurrency,
  pricePerNepalUnit,
} from "../../constants/gold/metals";

type MetricId = "spot" | NepalUnit["id"] | "bid" | "ask" | "spread";

interface HeroPricePanelProps {
  metal: MetalData;
  currency: CurrencyCode;
}

export function HeroPricePanel({ metal, currency }: HeroPricePanelProps) {
  const isUp = metal.change >= 0;
  const { bid, ask } = getBidAsk(metal, currency);
  const spread = formatSpread(bid, ask, currency);
  const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;
  const showNepalUnits = metal.unit === "oz";
  const hasOrderBook = bid != null && ask != null && spread != null;

  const options: { id: MetricId; label: string }[] = [
    { id: "spot", label: `per ${metal.unit}` },
    ...(showNepalUnits
      ? NEPAL_UNITS.map((u) => ({
          id: u.id as MetricId,
          label: `${u.label} ${u.nepali}`,
        }))
      : []),
    ...(hasOrderBook
      ? ([
          { id: "bid", label: "Bid" },
          { id: "ask", label: "Ask" },
          { id: "spread", label: "Spread" },
        ] as const)
      : []),
  ];

  const defaultMetric: MetricId = showNepalUnits ? "tola" : "spot";
  const [metric, setMetric] = useState<MetricId>(defaultMetric);
  const selected =
    options.find((o) => o.id === metric)?.id ??
    options.find((o) => o.id === defaultMetric)?.id ??
    options[0]?.id ??
    "spot";

  function metricValue(id: MetricId): string {
    if (id === "spot") {
      return formatPrice(priceInCurrency(metal, currency), currency);
    }
    if (id === "bid" && bid != null) return formatPrice(bid, currency);
    if (id === "ask" && ask != null) return formatPrice(ask, currency);
    if (id === "spread" && spread) return spread;
    const unit = NEPAL_UNITS.find((u) => u.id === id);
    if (unit) {
      return formatPrice(pricePerNepalUnit(metal, unit, currency), currency);
    }
    return "—";
  }

  const showTrend =
    selected === "spot" || NEPAL_UNITS.some((u) => u.id === selected);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2 sm:gap-3">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: metal.accentColor }}
            aria-hidden="true"
          />
          <h2
            className="text-lg font-medium tracking-tight text-white/60"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {metal.name}
            <span className="ml-2 text-sm font-normal text-white/30">
              {metal.symbol}
            </span>
          </h2>
          <div className="relative">
            <label htmlFor="hero-metric" className="sr-only">
              Price metric
            </label>
            <select
              id="hero-metric"
              value={selected}
              onChange={(e) => setMetric(e.target.value as MetricId)}
              className="appearance-none rounded-md border border-white/[0.08] bg-white/[0.04] py-1 pl-2.5 pr-7 text-sm font-normal text-white/50 outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/35"
              aria-hidden="true"
            />
          </div>
        </div>

        <div
          className="text-4xl font-semibold tracking-tight text-[#E8E6E1] tabular-nums sm:text-5xl lg:text-[clamp(2.25rem,4vw,3.75rem)]"
          style={{ fontFamily: "var(--font-mono)" }}
          aria-live="polite"
        >
          {metricValue(selected)}
        </div>

        {showTrend ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium tabular-nums ${
                isUp
                  ? "bg-[#34D399]/10 text-[#34D399]"
                  : "bg-[#F87171]/10 text-[#F87171]"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <TrendIcon size={14} aria-hidden="true" />
              {formatChange(changeInCurrency(metal, currency))} (
              {formatChangePercent(metal.changePercent)})
            </span>
            <span
              className="text-xs text-white/30"
              style={{ fontFamily: "var(--font-body)" }}
            >
              today
            </span>
          </div>
        ) : !hasOrderBook && !showNepalUnits ? (
          <p
            className="mt-4 text-xs text-white/25"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Spot price only — no order book available for {metal.name}.
          </p>
        ) : null}
      </div>

      <p
        className="text-sm leading-relaxed text-white/50"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {metal.description}
      </p>
    </div>
  );
}
