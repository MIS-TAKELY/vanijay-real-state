"use client";

import { HorizontalBars } from "./HorizontalBars";
import { CHART_THEME } from "./format";

export interface SearchInsights {
  topQueries: { query: string; count: number }[];
}

/** Top search queries (ranked horizontal bars). */
export function SearchQueriesChart({ data }: { data?: SearchInsights }) {
  const queries = (data?.topQueries ?? []).slice(0, 8).map((q) => ({ label: q.query || "(empty)", value: q.count }));
  return (
    <HorizontalBars
      data={queries}
      color={CHART_THEME.palette[3]}
      height={Math.max(180, queries.length * 34)}
      ariaLabel="Top search queries"
    />
  );
}
