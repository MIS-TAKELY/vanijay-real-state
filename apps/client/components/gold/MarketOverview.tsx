"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type {
  CurrencyCode,
  MetalData,
  MetalId,
} from "../../constants/gold/metals";
import {
  formatChangePercent,
  formatPrice,
  priceInCurrency,
} from "../../constants/gold/metals";

interface MarketOverviewProps {
  metals: MetalData[];
  activeId: MetalId;
  currency: CurrencyCode;
}

/** Metals with a dedicated page. The rest link to the compare page. */
const ROUTABLE_METALS: MetalId[] = ["gold", "silver", "diamond", "copper", "steel"];

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const svgPath = useMemo(() => {
    if (data.length === 0) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 72;
    const h = 24;

    return data
      .map((val, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((val - min) / range) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data]);

  return (
    <svg viewBox="0 0 72 24" className="h-6 w-[72px]" aria-hidden="true">
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

export function MarketOverview({
  metals,
  activeId,
  currency,
}: MarketOverviewProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<MetalId[]>([]);
  const topMover = useMemo(() => {
    const sorted = [...metals].sort((a, b) => b.changePercent - a.changePercent);
    return sorted[0] ?? null;
  }, [metals]);

  const toggle = (id: MetalId) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 4
          ? prev
          : [...prev, id],
    );
  };

  const compare = () => {
    if (selected.length < 2) return;
    router.push(`/metals/compare?ids=${selected.join(",")}`);
  };

  return (
    <aside
      aria-labelledby="market-overview-heading"
      className="flex min-w-0 flex-col rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3
          id="market-overview-heading"
          className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-gold-deep"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <span className="h-px w-6 bg-gold/60" aria-hidden="true" />
          Market Overview
        </h3>
        <span
          className="rounded-full border border-emerald-600/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Live
        </span>
      </div>

      <ul className="flex min-w-0 flex-col gap-1">
        {metals.map((metal) => {
          const isUp = metal.change >= 0;
          const isActive = metal.id === activeId;
          const isSelected = selected.includes(metal.id);
          const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;
          const href = ROUTABLE_METALS.includes(metal.id)
            ? `/${metal.id}`
            : "/metals/compare";

          return (
            <li
              key={metal.id}
              className={[
                "flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-0.5 transition-colors",
                isSelected
                  ? "bg-gold-soft/40 ring-1 ring-inset ring-gold/30"
                  : isActive
                    ? "bg-surface-container"
                    : "hover:bg-surface-container/60",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(metal.id)}
                aria-label={`Select ${metal.name} to compare`}
                className="size-4 shrink-0 cursor-pointer rounded border-outline bg-white accent-gold"
              />
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg py-2"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: metal.accentColor }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate text-sm font-medium text-on-surface"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {metal.name}
                  </span>
                  <span
                    className="block text-[10px] text-on-surface-variant/70"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {metal.symbol}
                  </span>
                </span>

                <span className="hidden sm:block">
                  <MiniSparkline
                    data={metal.sparkline}
                    color={isUp ? "#16a34a" : "#dc2626"}
                  />
                </span>

                <span
                  className="shrink-0 text-right text-sm font-medium tabular-nums text-on-surface"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatPrice(priceInCurrency(metal, currency), currency)}
                </span>

                <span
                  className={`inline-flex w-[4.5rem] shrink-0 items-center justify-end gap-0.5 text-xs font-medium tabular-nums ${
                    isUp ? "text-emerald-600" : "text-red-600"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <TrendIcon size={12} aria-hidden="true" />
                  {formatChangePercent(metal.changePercent)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 border-t border-outline-variant pt-3">
        {topMover && (
          <p
            className="mb-3 text-xs leading-relaxed text-on-surface-variant"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span
              className="font-semibold"
              style={{ color: topMover.accentColor }}
            >
              {topMover.name}
            </span>{" "}
            is today&apos;s top mover{" "}
            <span className="font-semibold text-emerald-600">
              +{formatChangePercent(topMover.changePercent)}
            </span>
            , leading the market across all tracked assets.
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <Link
            href="/metals/compare"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-deep transition-colors hover:text-gold"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Compare all metals
            <ArrowRight size={13} aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={compare}
            disabled={selected.length < 2}
            aria-disabled={selected.length < 2}
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              selected.length >= 2
                ? "cursor-pointer bg-gold text-on-gold shadow-sm hover:bg-gold/90"
                : "cursor-not-allowed bg-surface-container text-on-surface-variant/60",
            ].join(" ")}
            style={{ fontFamily: "var(--font-body)" }}
          >
            Compare
            {selected.length > 0 && (
              <span className="rounded-full bg-black/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                {selected.length}
              </span>
            )}
          </button>
        </div>

        {selected.length === 1 && (
          <p className="mt-2 text-[11px] text-on-surface-variant/70">
            Select at least two metals to compare.
          </p>
        )}
      </div>
    </aside>
  );
}