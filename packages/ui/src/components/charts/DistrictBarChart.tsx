"use client";

import { HorizontalBars } from "./HorizontalBars";
import { CHART_THEME } from "./format";

export interface DistrictDemand {
  district: string;
  views: number;
}

/** Geographic demand: property views aggregated by district. */
export function DistrictBarChart({ data }: { data?: DistrictDemand[] }) {
  const rows = (data ?? []).map((d) => ({ label: d.district, value: d.views }));
  return (
    <HorizontalBars
      data={rows}
      color={CHART_THEME.palette[4]}
      height={Math.max(180, rows.length * 34)}
      ariaLabel="Property views by district"
    />
  );
}
