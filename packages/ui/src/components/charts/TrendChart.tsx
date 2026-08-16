"use client";

import { useMemo } from "react";
import { defineChart, lineY } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { fold } from "@tanstack/charts/transform/fold";
import { tooltip } from "@tanstack/charts/tooltip";

export type TrendPoint = { date: string; listings: number; users: number; inquiries: number };

const SERIES_COLORS = {
  listings: "#3456bd",
  users: "oklch(0.404 0.048 155)",
  inquiries: "oklch(0.452 0.164 25)",
} as const;

const SERIES_LABELS: Record<keyof typeof SERIES_COLORS, string> = {
  listings: "New Listings",
  users: "New Users",
  inquiries: "Inquiries",
};

const GRID_COLOR = "oklch(0.882 0.012 85)";
const TICK_COLOR = "oklch(0.476 0.016 85)";

function formatTick(value: string) {
  const y = Number(value.slice(0, 4));
  const m = Number(value.slice(5, 7));
  const d = Number(value.slice(8, 10));
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Multi-series 30-day activity trend rendered with TanStack Charts. */
export function TrendChart({ trend }: { trend: readonly TrendPoint[] }) {
  const definition = useMemo(() => {
    const folded = fold(trend, {
      fields: ["listings", "users", "inquiries"],
      as: { key: "series", value: "value" },
    });
    const maxValue = Math.max(...folded.map((row) => row.value), 1);

    return defineChart({
      marks: [
        lineY(folded, {
          x: "date",
          y: "value",
          z: "series",
          strokeWidth: 2,
        }),
      ],
      x: {
        scale: () => scalePoint<string>().padding(0.15),
        axis: {
          ticks: { count: 8, format: formatTick },
          tickLabels: { thin: true, fontSize: 11 },
        },
      },
      y: {
        scale: () => scaleLinear().domain([0, maxValue]).nice(),
        grid: true,
        axis: {
          label: "Count",
          ticks: { count: 5 },
          tickLabels: { fontSize: 11 },
        },
      },
      color: {
        domain: ["listings", "users", "inquiries"],
        range: [SERIES_COLORS.listings, SERIES_COLORS.users, SERIES_COLORS.inquiries],
      },
      svgAnimation: true,
      tooltip,
      theme: {
        foreground: TICK_COLOR,
        muted: TICK_COLOR,
        grid: GRID_COLOR,
        background: "transparent",
        palette: [SERIES_COLORS.listings, SERIES_COLORS.users, SERIES_COLORS.inquiries],
      },
    });
  }, [trend]);

  return (
    <div>
      <div className="mb-sm flex flex-wrap items-center gap-lg">
        {(["listings", "users", "inquiries"] as const).map((key) => (
          <span
            key={key}
            className="flex items-center gap-xs font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SERIES_COLORS[key] }} />
            {SERIES_LABELS[key]}
          </span>
        ))}
      </div>
      <Chart
        definition={definition}
        height={320}
        initialWidth={720}
        ariaLabel="30-day activity trend across listings, users and inquiries"
      />
    </div>
  );
}
