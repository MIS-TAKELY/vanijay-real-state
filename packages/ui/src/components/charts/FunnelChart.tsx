"use client";

import { useMemo } from "react";
import { barX, defineChart } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { CHART_THEME, formatCompact, formatNumber } from "./format";

export interface FunnelStep {
  step: string;
  value: number;
}

/** Buyer engagement funnel: Views → Favorites → Cart → Inquiries → Phone clicks. */
export function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const maxValue = Math.max(...steps.map((s) => s.value), 1);

  const definition = useMemo(() => {
    return defineChart({
      marks: [
        barX(steps, {
          x: "value",
          y: "step",
          inset: 3,
          radius: 4,
          fill: CHART_THEME.palette[0],
          fillOpacity: 0.9,
        }),
      ],
      y: {
        scale: () =>
          scaleBand<string>()
            .domain(steps.map((s) => s.step))
            .padding(0.28),
      },
      x: {
        scale: () => scaleLinear().domain([0, maxValue]).nice(),
        grid: true,
        axis: {
          ticks: { count: 4, format: (v: number) => formatCompact(v) },
          tickLabels: { fontSize: 10, thin: true },
        },
      },
      svgAnimation: true,
      tooltip,
      theme: {
        foreground: CHART_THEME.tick,
        muted: CHART_THEME.tick,
        grid: CHART_THEME.grid,
        background: "transparent",
      },
    });
  }, [steps, maxValue]);

  const top = steps[0]?.value ?? 0;
  return (
    <div>
      <Chart
        definition={definition}
        height={230}
        initialWidth={460}
        ariaLabel="Buyer engagement funnel"
      />
      <ul className="mt-sm space-y-xs">
        {steps.map((s, i) => {
          const pctOfViews = top > 0 ? Math.round((s.value / top) * 100) : 0;
          const prev = steps[i - 1];
          const stepConv =
            prev && prev.value > 0
              ? Math.round((s.value / prev.value) * 100)
              : null;
          return (
            <li
              key={s.step}
              className="flex items-center justify-between gap-sm font-label-sm text-[12px]"
            >
              <span className="text-on-surface-variant">{s.step}</span>
              <span className="mono-stat text-on-surface">
                {formatNumber(s.value)}
                <span className="ml-2 text-on-surface-variant">
                  {pctOfViews}% of views
                </span>
                {stepConv !== null ? (
                  <span className="ml-2 text-tertiary">{stepConv}% step</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
