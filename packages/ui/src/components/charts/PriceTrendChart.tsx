"use client";

import { useMemo } from "react";
import { defineChart, lineY } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { fold } from "@tanstack/charts/transform/fold";
import { tooltip } from "@tanstack/charts/tooltip";
import { CHART_THEME, formatCompact, formatMonth } from "./format";

export interface MarketPoint {
  month: string;
  avgAsking: number;
  avgSold: number;
}

const SERIES = [
  { key: "avgAsking", label: "Avg Asking Price", color: CHART_THEME.palette[0] },
  { key: "avgSold", label: "Avg Sold Price", color: CHART_THEME.palette[2] },
] as const;

/** Monthly market trend: average asking price vs actual sold price (comps). */
export function PriceTrendChart({ points }: { points: MarketPoint[] }) {
  const definition = useMemo(() => {
    const rows = points.map((p) => ({ month: p.month, avgAsking: p.avgAsking, avgSold: p.avgSold }));
    const folded = fold(rows, {
      fields: ["avgAsking", "avgSold"],
      as: { key: "series", value: "value" },
    });
    const maxValue = Math.max(...folded.map((r) => r.value), 1);

    return defineChart({
      marks: [
        lineY(folded, {
          x: "month",
          y: "value",
          z: "series",
          strokeWidth: 2,
        }),
      ],
      x: {
        scale: () => scalePoint<string>().padding(0.2),
        axis: {
          ticks: { count: 8, format: formatMonth },
          tickLabels: { thin: true, fontSize: 10 },
        },
      },
      y: {
        scale: () => scaleLinear().domain([0, maxValue]).nice(),
        grid: true,
        axis: {
          ticks: { count: 5, format: (v: number) => formatCompact(v) },
          tickLabels: { fontSize: 10, thin: true },
        },
      },
      color: {
        domain: [SERIES[0].key, SERIES[1].key],
        range: [SERIES[0].color, SERIES[1].color],
      },
      svgAnimation: true,
      tooltip,
      theme: {
        foreground: CHART_THEME.tick,
        muted: CHART_THEME.tick,
        grid: CHART_THEME.grid,
        background: "transparent",
        palette: [SERIES[0].color, SERIES[1].color],
      },
    });
  }, [points]);

  if (points.length === 0) {
    return <p className="font-body-md text-body-md text-on-surface-variant">No price data yet. Seed sold records to see comps.</p>;
  }

  return (
    <div>
      <div className="mb-sm flex flex-wrap items-center gap-lg">
        {SERIES.map((s) => (
          <span
            key={s.key}
            className="flex items-center gap-xs font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <Chart definition={definition} height={280} initialWidth={640} ariaLabel="Monthly asking vs sold price trend" />
    </div>
  );
}
