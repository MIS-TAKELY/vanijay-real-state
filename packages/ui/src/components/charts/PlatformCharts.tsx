"use client";

import { useMemo } from "react";
import { defineChart, lineY } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { fold } from "@tanstack/charts/transform/fold";
import { tooltip } from "@tanstack/charts/tooltip";
import { CHART_THEME, formatCompact, formatTickDate } from "./format";
import { Donut } from "./Donut";
import { HorizontalBars } from "./HorizontalBars";

export interface PlatformHealth {
  sharesByPlatform: { platform: string; count: number }[];
  appointmentsByStatus: { status: string; count: number }[];
  qaActivity: { date: string; questions: number; answers: number }[];
}

const QA_SERIES = [
  { key: "questions", label: "Questions", color: CHART_THEME.palette[6] },
  { key: "answers", label: "Answers", color: CHART_THEME.palette[5] },
] as const;

function QaTrend({ days }: { days: PlatformHealth["qaActivity"] }) {
  const definition = useMemo(() => {
    const folded = fold(days, {
      fields: ["questions", "answers"],
      as: { key: "series", value: "value" },
    });
    const maxValue = Math.max(...folded.map((r) => r.value), 1);
    return defineChart({
      marks: [
        lineY(folded, { x: "date", y: "value", z: "series", strokeWidth: 2 }),
      ],
      x: {
        scale: () => scalePoint<string>().padding(0.1),
        axis: {
          ticks: { count: 5, format: formatTickDate },
          tickLabels: { thin: true, fontSize: 9 },
        },
      },
      y: {
        scale: () => scaleLinear().domain([0, maxValue]).nice(),
        grid: true,
        axis: {
          ticks: { count: 3, format: (v: number) => formatCompact(v) },
          tickLabels: { fontSize: 9, thin: true },
        },
      },
      color: {
        domain: ["questions", "answers"],
        range: [QA_SERIES[0].color, QA_SERIES[1].color],
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
  }, [days]);

  return (
    <Chart
      definition={definition}
      height={170}
      initialWidth={380}
      ariaLabel="Daily Q&A activity"
    />
  );
}

/** Platform health: share channels, appointment pipeline and community Q&A activity. */
export function PlatformCharts({ data }: { data?: PlatformHealth }) {
  if (!data) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant">
        No platform data yet.
      </p>
    );
  }

  const shares = data.sharesByPlatform.map((s) => ({
    key: s.platform,
    value: s.count,
  }));
  const appointments = data.appointmentsByStatus.map((a) => ({
    label: a.status.replace(/_/g, " "),
    value: a.count,
  }));

  return (
    <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
      <div>
        <p className="mb-sm font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
          Shares by platform
        </p>
        <Donut data={shares} height={180} ariaLabel="Shares by platform" />
      </div>
      <div>
        <p className="mb-sm font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
          Appointments by status
        </p>
        <HorizontalBars
          data={appointments}
          color={CHART_THEME.palette[4]}
          height={Math.max(140, appointments.length * 30)}
          showValues={false}
          ariaLabel="Officer appointments by status"
        />
      </div>
      <div>
        <p className="mb-sm font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
          Community Q&A activity
          <span className="ml-2 normal-case tracking-normal text-on-surface-variant">
            <span
              className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
              style={{ backgroundColor: QA_SERIES[0].color }}
            />
            Q
            <span
              className="mx-1 inline-block h-2 w-2 rounded-full align-middle"
              style={{ backgroundColor: QA_SERIES[1].color }}
            />
            A
          </span>
        </p>
        <QaTrend days={data.qaActivity} />
      </div>
    </div>
  );
}
