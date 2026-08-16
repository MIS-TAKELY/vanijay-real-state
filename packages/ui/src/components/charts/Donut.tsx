"use client";

import { useMemo } from "react";
import { defineChart } from "@tanstack/charts";
import { pie, polar, radialArc } from "@tanstack/charts/polar";
import { Chart } from "@tanstack/charts/react";
import { CHART_THEME, formatNumber } from "./format";

export interface DonutSlice {
  key: string;
  value: number;
}

/** Generic donut chart with an HTML legend showing counts + share. */
export function Donut({
  data,
  valueFormat = formatNumber,
  height = 210,
  ariaLabel,
}: {
  data: DonutSlice[];
  valueFormat?: (n: number) => string;
  height?: number;
  ariaLabel?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const keys = data.map((d) => d.key);
  const range = data.map((_, i) => CHART_THEME.palette[i % CHART_THEME.palette.length] ?? CHART_THEME.palette[0]);

  const definition = useMemo(() => {
    const slices = pie(data, { value: "value" });
    return defineChart({
      marks: [
        polar({
          inset: 8,
          radiusRatio: 0.86,
          marks: [
            radialArc(slices, {
              innerRadius: ({ radius }) => radius * 0.58,
              cornerRadius: 3,
              color: "key",
              key: "key",
            }),
          ],
        }),
      ],
      color: { domain: keys, range },
      guides: false,
      theme: { background: "transparent" },
    });
  }, [data, keys, range]);

  if (data.length === 0) {
    return <p className="font-body-md text-body-md text-on-surface-variant">No data yet.</p>;
  }

  return (
    <div>
      <Chart definition={definition} height={height} initialWidth={280} ariaLabel={ariaLabel ?? "Donut chart"} />
      <ul className="mt-sm space-y-xs">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <li key={d.key} className="flex items-center justify-between gap-sm font-label-sm text-[12px]">
              <span className="flex min-w-0 items-center gap-xs text-on-surface-variant">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: range[keys.indexOf(d.key)] ?? CHART_THEME.palette[0] }}
                />
                <span className="truncate">{d.key.replace(/_/g, " ")}</span>
              </span>
              <span className="mono-stat shrink-0 text-on-surface">
                {valueFormat(d.value)}
                <span className="ml-2 text-on-surface-variant">{pct}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Build donut slices from Prisma group-by rows. */
export function fromGroupBy<T extends { key: string; _count: { _all: number } }>(rows: T[]): DonutSlice[] {
  return rows.map((r) => ({ key: r.key, value: r._count._all }));
}
