"use client";

import { useMemo } from "react";
import { barX, defineChart } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { CHART_THEME, formatCompact, formatNumber } from "./format";

/** Reusable ranked horizontal bar chart (long labels, rank reads top-down). */
export function HorizontalBars({
  data,
  color = CHART_THEME.palette[0],
  height = 240,
  ariaLabel,
  valueFormat = formatNumber,
  showValues = true,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  ariaLabel?: string;
  valueFormat?: (n: number) => string;
  showValues?: boolean;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const definition = useMemo(() => {
    return defineChart({
      marks: [
        barX(data, {
          x: "value",
          y: "label",
          inset: 3,
          radius: 3,
          fill: color,
          fillOpacity: 0.9,
        }),
      ],
      y: {
        scale: () =>
          scaleBand<string>()
            .domain(data.map((d) => d.label))
            .padding(0.25),
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
  }, [data, maxValue, color]);

  if (data.length === 0) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant">
        No data yet.
      </p>
    );
  }

  return (
    <div>
      <Chart
        definition={definition}
        height={height}
        initialWidth={420}
        ariaLabel={ariaLabel ?? "Bar chart"}
      />
      {showValues ? (
        <ul className="mt-sm space-y-xs">
          {data.map((d) => (
            <li
              key={d.label}
              className="flex items-center justify-between gap-sm font-label-sm text-[12px]"
            >
              <span className="truncate text-on-surface-variant">
                {d.label}
              </span>
              <span className="mono-stat shrink-0 text-on-surface">
                {valueFormat(d.value)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
