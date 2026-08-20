"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useLiveMetalPrices } from "../../hooks/use-live-metal-prices";
import type { MetalId } from "../../constants/gold/metals";
import {
  formatChange,
  formatChangePercent,
  formatPrice,
  priceInCurrency,
} from "../../constants/gold/metals";

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const svgPath = useMemo(() => {
    if (data.length === 0) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 120;
    const h = 40;

    return data
      .map((val, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((val - min) / range) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data]);

  return (
    <svg viewBox="0 0 120 40" className="h-10 w-full" aria-hidden="true">
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

export function MetalComparison() {
  const { metals, loading } = useLiveMetalPrices();
  const searchParams = useSearchParams();

  const selectedIds = useMemo(() => {
    const raw = (searchParams.get("ids") ?? "gold,silver")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return [...new Set(raw)] as MetalId[];
  }, [searchParams]);

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => metals.find((m) => m.id === id))
        .filter((m): m is NonNullable<typeof m> => Boolean(m)),
    [selectedIds, metals],
  );

  if (selected.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface p-8 text-center shadow-sm">
        <p className="text-on-surface-variant" style={{ fontFamily: "var(--font-body)" }}>
          No matching metals found.
        </p>
        <Link
          href="/gold"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep hover:text-gold"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Back to markets
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-sm text-on-surface-variant"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {selected.length} asset{selected.length > 1 ? "s" : ""} compared
          {loading ? " · updating…" : " · live"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {selected.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: m.accentColor }}
                aria-hidden="true"
              />
              {m.symbol}
            </span>
          ))}
        </div>
      </div>

      <div
        className={`grid gap-4 ${
          selected.length <= 2
            ? "sm:grid-cols-2"
            : selected.length <= 3
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : "sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {selected.map((metal) => {
          const isUp = metal.change >= 0;
          const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;
          const usdPrice = metal.usdPrice;
          const stats = [
            {
              label: "Price (NPR)",
              value: formatPrice(priceInCurrency(metal, "NPR"), "NPR"),
            },
            { label: "Price (USD)", value: formatPrice(usdPrice, "USD") },
            {
              label: "24h Change",
              value: `${metal.changePercent >= 0 ? "+" : ""}${metal.changePercent.toFixed(2)}%`,
              color: isUp ? "#16a34a" : "#dc2626",
            },
            {
              label: "52W High",
              value: formatPrice(usdPrice * 1.12, "USD"),
            },
            {
              label: "52W Low",
              value: formatPrice(usdPrice * 0.78, "USD"),
            },
            {
              label: "Volatility",
              value: `${(metal.volatility * 100).toFixed(1)}%`,
            },
            {
              label: "Sentiment",
              value:
                metal.changePercent > 0.5
                  ? "Bullish"
                  : metal.changePercent < -0.5
                    ? "Bearish"
                    : "Neutral",
              color:
                metal.changePercent > 0.5
                  ? "#16a34a"
                  : metal.changePercent < -0.5
                    ? "#dc2626"
                    : "#55637a",
            },
          ];

          return (
            <article
              key={metal.id}
              className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: metal.accentColor }}
                  aria-hidden="true"
                />
                <h3
                  className="text-lg font-medium text-on-surface"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {metal.name}
                </h3>
                <span
                  className="text-sm text-on-surface-variant/70"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {metal.symbol}
                </span>
              </div>

              <div>
                <span
                  className="block text-3xl font-semibold tabular-nums text-on-surface"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatPrice(priceInCurrency(metal, "NPR"), "NPR")}
                </span>
                <span
                  className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
                    isUp
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-red-500/10 text-red-600"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <TrendIcon size={12} aria-hidden="true" />
                  {formatChange(metal.change)} ({formatChangePercent(metal.changePercent)})
                </span>
              </div>

              <MiniSparkline
                data={metal.sparkline}
                color={isUp ? "#16a34a" : "#dc2626"}
              />

              <dl className="grid grid-cols-2 gap-2">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-outline-variant bg-surface-container/60 px-2.5 py-2"
                  >
                    <dt
                      className="text-[10px] uppercase tracking-wider text-on-surface-variant"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {stat.label}
                    </dt>
                    <dd
                      className="mt-0.5 text-sm font-medium tabular-nums"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: stat.color || "var(--color-on-surface)",
                      }}
                    >
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-on-surface-variant/70">
        Prices are indicative and delayed. Not financial advice.
      </p>
    </div>
  );
}