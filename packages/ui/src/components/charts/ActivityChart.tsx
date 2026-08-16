"use client";

import { useMemo } from "react";
import { areaY, defineChart } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { fold } from "@tanstack/charts/transform/fold";
import { tooltip } from "@tanstack/charts/tooltip";
import { CHART_THEME, formatTickDate } from "./format";

export interface ActivityDay {
  date: string;
  views: number;
  searches: number;
  inquiries: number;
  phoneClicks: number;
}

const FIELDS = ["views", "searches", "inquiries", "phoneClicks"] as const;

const SERIES: { key: (typeof FIELDS)[number]; label: string; color: string }[] = [
  { key: "views", label: "Views", color: CHART_THEME.palette[0] },
  { key: "searches", label: "Searches", color: CHART_THEME.palette[3] },
  { key: "inquiries", label: "Inquiries", color: CHART_THEME.palette[2] },
  { key: "phoneClicks", label: "Phone Clicks", color: CHART_THEME.palette[1] },
];

/** Multi-series area chart of daily buyer engagement (views, searches, inquiries, phone clicks). */
export function ActivityChart({ days }: { days: ActivityDay[] }) {
  const definition = useMemo(() => {
    const folded = fold(days, {
      fields: FIELDS,
      as: { key: "series", value: "value" },
    });
    const maxValue = Math.max(...folded.map((row) => row.value), 1);

    return defineChart({
      marks: [
        areaY(folded, {
          x: "date",
          y: "value",
          z: "series",
          fillOpacity: 0.16,
          strokeWidth: 2,
        }),
      ],
      x: {
        scale: () => scalePoint<string>().padding(0.1),
        axis: {
          ticks: { count: 8, format: formatTickDate },
          tickLabels: { thin: true, fontSize: 10 },
        },
      },
      y: {
        scale: () => scaleLinear().domain([0, maxValue]).nice(),
        grid: true,
        axis: { ticks: { count: 4 }, tickLabels: { fontSize: 10, thin: true } },
      },
      color: {
        domain: SERIES.map((s) => s.key),
        range: SERIES.map((s) => s.color),
      },
      svgAnimation: true,
      tooltip,
      theme: {
        foreground: CHART_THEME.tick,
        muted: CHART_THEME.tick,
        grid: CHART_THEME.grid,
        background: "transparent",
        palette: SERIES.map((s) => s.color),
      },
    });
  }, [days]);

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
      <Chart definition={definition} height={280} initialWidth={760} ariaLabel="Daily buyer engagement trend" />
    </div>
  );
}
