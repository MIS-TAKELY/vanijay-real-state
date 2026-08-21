"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaSeries,
  ColorType,
  CrosshairMode,
  createChart,
  type AreaData,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type Time,
} from "lightweight-charts";
import { HISTORY_RANGES, type HistoryRange } from "constants/gold/live";
import type { CurrencyCode, MetalData } from "../../constants/gold/metals";
import {
  convertCurrency,
  formatChange,
  formatChangePercent,
  formatPrice,
} from "../../constants/gold/metals";
import { useGoldHistory } from "../../hooks/use-gold-history";

interface PriceHistoryChartProps {
  metal: MetalData;
  currency: CurrencyCode;
}

const MONO_FONT = "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace";

/** "yyyy-mm-dd" → "Mar 4, 2026" (parsed as UTC midnight). */
function formatDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Today's business day as "yyyy-mm-dd" (UTC) for live point appends. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PriceHistoryChart({ metal, currency }: PriceHistoryChartProps) {
  const [range, setRange] = useState<HistoryRange>("1Y");
  const { points, loading, error, isRealData } = useGoldHistory(metal, range);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [hover, setHover] = useState<{ time: string; value: number } | null>(
    null,
  );

  // Live NPR rate derived from the feed (history is USD-only upstream).
  const usdRate = useMemo(() => {
    if (currency === "USD") return 1;
    if (currency === "NPR" && metal.usdPrice > 0) {
      return metal.price / metal.usdPrice;
    }
    return null;
  }, [currency, metal.price, metal.usdPrice]);

  const toDisplay = useMemo(
    () => (usd: number) =>
      usdRate !== null ? usd * usdRate : convertCurrency(usd, currency),
    [usdRate, currency],
  );

  const lineColor = metal.accentColor || "#C9A84C";

  // Series data in the display currency.
  const data = useMemo<AreaData<Time>[]>(
    () =>
      points.map((p) => ({
        time: p.time as Time,
        value: Number(toDisplay(p.price).toFixed(2)),
      })),
    [points, toDisplay],
  );

  // Range change stats (first → last point).
  const stats = useMemo(() => {
    if (data.length < 2) return null;
    const first = data[0]?.value ?? 0;
    const last = data[data.length - 1]?.value ?? 0;
    if (first <= 0) return null;
    const change = last - first;
    return { first, last, change, pct: (change / first) * 100 };
  }, [data]);

  // Create the chart once.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(23,26,31,0.45)",
        fontFamily: MONO_FONT,
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(16,48,80,0.05)" },
        horzLines: { color: "rgba(16,48,80,0.07)" },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          color: "rgba(16,48,80,0.25)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#103050",
        },
        horzLine: {
          color: "rgba(16,48,80,0.25)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#103050",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(16,48,80,0.12)",
        scaleMargins: { top: 0.12, bottom: 0.08 },
      },
      timeScale: {
        borderColor: "rgba(16,48,80,0.12)",
        timeVisible: false,
        rightOffset: 2,
      },
      handleScroll: { vertTouchDrag: false },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: `${lineColor}40`,
      bottomColor: `${lineColor}05`,
      lineWidth: 2,
      priceLineColor: `${lineColor}80`,
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // Recreate when the accent color changes (different metal).
  }, [lineColor]);

  // Feed (converted) data into the series; fit on new data.
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || data.length === 0) return;
    series.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  // Append/update today's point with the live price on every feed tick.
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || data.length === 0 || metal.usdPrice <= 0) return;
    const liveValue = Number(toDisplay(metal.usdPrice).toFixed(2));
    const lastTime = data[data.length - 1]?.time;
    const today = todayIso() as Time;
    if (lastTime !== undefined && today < lastTime) return; // stale clock
    series.update({ time: today, value: liveValue });
  }, [data, metal.usdPrice, toDisplay]);

  // Crosshair legend.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const handler = (param: MouseEventParams) => {
      const series = seriesRef.current;
      if (!param.time || !series || !param.seriesData) {
        setHover(null);
        return;
      }
      const point = param.seriesData.get(series) as
        | AreaData<Time>
        | undefined;
      if (point?.value == null) {
        setHover(null);
        return;
      }
      setHover({ time: String(param.time), value: point.value });
    };
    chart.subscribeCrosshairMove(handler);
    return () => chart.unsubscribeCrosshairMove(handler);
  }, []);

  const isUp = (stats?.change ?? 0) >= 0;
  const headline = hover
    ? { label: formatDay(hover.time), value: formatPrice(hover.value, currency) }
    : stats
      ? {
          label: "Last",
          value: formatPrice(stats.last, currency),
        }
      : null;

  return (
    <section aria-label={`${metal.name} price history chart`}>
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h2
            className="text-2xl font-medium tracking-tight text-on-surface md:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Price History
            <span className="ml-3 text-base font-normal text-on-surface-variant">
              {metal.name} ({metal.symbol}) · {currency}
            </span>
          </h2>
          {headline && (
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className="text-xs uppercase tracking-wider text-on-surface-variant"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {headline.label}
              </span>
              <span
                className="text-lg font-semibold tabular-nums text-on-surface"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {headline.value}
              </span>
              {stats && !hover && (
                <span
                  className={`text-sm font-medium tabular-nums ${
                    isUp ? "text-emerald-600" : "text-red-600"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatChange(stats.change)} (
                  {formatChangePercent(stats.pct)}) over {range}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Timeframe toggle */}
        <div
          className="flex shrink-0 flex-nowrap gap-0.5 self-start overflow-x-auto rounded-full border border-outline-variant bg-surface p-0.5 shadow-sm sm:flex-wrap sm:overflow-x-visible sm:self-auto"
          role="group"
          aria-label="Chart timeframe"
        >
          {HISTORY_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                range === r
                  ? "bg-gold text-on-gold shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
        <div ref={containerRef} className="h-[280px] w-full sm:h-[340px] md:h-[440px]" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/70">
            <span
              className="animate-pulse text-xs uppercase tracking-wider text-on-surface-variant"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Loading {range} history…
            </span>
          </div>
        )}
      </div>

      <p
        className="mt-3 text-xs text-on-surface-variant/70"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {isRealData ? (
          <>
            Daily average prices from gold-api.com, converted to {currency}
            {currency === "NPR" ? " at the live exchange rate" : ""}.
          </>
        ) : (
          <>
            Simulated data shown — live history unavailable
            {error ? ` (${error})` : ""}. Anchored at the current{" "}
            {metal.name} price.
          </>
        )}
      </p>
    </section>
  );
}