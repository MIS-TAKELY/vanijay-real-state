"use client";

import { formatNumber } from "@repo/ui";
import { StatCard } from "components/StatCard";
import type { StatCardData } from "constants/operations";
import type { AnalyticsOverviewData } from "lib/api";

const KPI_META: Record<
  keyof AnalyticsOverviewData,
  {
    label: string;
    icon: string;
    tone: StatCardData["tone"];
    format?: (n: number) => string;
  }
> = {
  views: { label: "Property Views", icon: "visibility", tone: "primary" },
  uniqueViewers: { label: "Unique Viewers", icon: "groups", tone: "surface" },
  searches: { label: "Searches", icon: "search", tone: "surface" },
  inquiries: { label: "Inquiries", icon: "forum", tone: "tertiary" },
  phoneClicks: { label: "Phone Clicks", icon: "call", tone: "amber" },
  favorites: { label: "Favorites Added", icon: "favorite", tone: "secondary" },
  cartAdds: { label: "Cart Adds", icon: "shopping_cart", tone: "surface" },
  shares: { label: "Shares", icon: "share", tone: "surface" },
  newListings: { label: "New Listings", icon: "list_alt", tone: "primary" },
  newUsers: { label: "New Users", icon: "person_add", tone: "secondary" },
};

/** KPI row for the analytics dashboard: 30d totals with % change vs previous 30d. */
export function KpiCards({ data }: { data?: AnalyticsOverviewData }) {
  if (!data) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant">
        No analytics data available yet. Start the API and seed data to see
        KPIs.
      </p>
    );
  }

  const cards: StatCardData[] = (
    Object.keys(KPI_META) as (keyof AnalyticsOverviewData)[]
  ).map((key) => {
    const meta = KPI_META[key];
    const kpi = data[key];
    const value = meta.format
      ? meta.format(kpi.value)
      : formatNumber(kpi.value);
    const hint =
      kpi.delta === 0
        ? "no change vs prev 30d"
        : `${kpi.delta > 0 ? "↑" : "↓"} ${Math.abs(kpi.delta)}% vs prev 30d`;
    return { label: meta.label, value, hint, icon: meta.icon, tone: meta.tone };
  });

  return (
    <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {cards.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
