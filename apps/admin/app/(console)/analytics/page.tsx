import { cookies } from "next/headers";
import { PageHeader } from "components/ui/PageHeader";
import { adminFetch } from "lib/server";
import {
  ActivityChart,
  DistrictBarChart,
  Donut,
  FunnelChart,
  InquiryCharts,
  PlatformCharts,
  PriceTrendChart,
  SearchQueriesChart,
  TrendChart,
} from "@repo/ui";
import { Panel } from "components/analytics/Panel";
import { KpiCards } from "components/analytics/KpiCards";
import { TopListingsTable } from "components/analytics/TopListingsTable";
import type {
  ActivityDay,
  AnalyticsOverviewData,
  FunnelStep,
  GeographyData,
  LeadsData,
  ListingPerformanceData,
  MarketPoint,
  PlatformHealthData,
  SearchInsightsData,
} from "lib/api";

export const dynamic = "force-dynamic";

const DAYS = 30;

export default async function AnalyticsPage() {
  const cookie = (await cookies()).toString();
  const call = async <T,>(path: string): Promise<T | undefined> => {
    try {
      return await adminFetch<T>(cookie, path);
    } catch {
      return undefined;
    }
  };

  const [overview, funnel, activity, listings, market, searches, leads, geography, platform] = await Promise.all([
    call<AnalyticsOverviewData>("/api/v1/admin/analytics/overview"),
    call<FunnelStep[]>(`/api/v1/admin/analytics/funnel?days=${DAYS}`),
    call<ActivityDay[]>(`/api/v1/admin/analytics/activity?days=${DAYS}`),
    call<ListingPerformanceData>(`/api/v1/admin/analytics/listings?days=${DAYS}`),
    call<MarketPoint[]>("/api/v1/admin/analytics/market?days=365"),
    call<SearchInsightsData>(`/api/v1/admin/analytics/searches?days=${DAYS}`),
    call<LeadsData>(`/api/v1/admin/analytics/leads?days=${DAYS}`),
    call<GeographyData[]>(`/api/v1/admin/analytics/geography?days=${DAYS}`),
    call<PlatformHealthData>(`/api/v1/admin/analytics/platform?days=${DAYS}`),
  ]);

  // Growth trend (listings/users/inquiries) feeds the existing TrendChart.
  const growth = (activity ?? []).map((a) => ({
    date: a.date,
    listings: a.listings,
    users: a.users,
    inquiries: a.inquiries,
  }));

  const byType = (listings?.byType ?? []).map((r) => ({ key: r.propertyType.replace(/_/g, " "), value: r._count._all }));
  const byStatus = (listings?.byStatus ?? []).map((r) => ({ key: r.status.replace(/_/g, " "), value: r._count._all }));

  return (
    <>
      <PageHeader
        icon="insights"
        title="Analytics"
        description="Marketplace performance — engagement, leads, pricing and platform health."
      />
      <section className="mt-lg space-y-lg">
        <KpiCards data={overview} />

        <div className="grid grid-cols-1 gap-lg xl:grid-cols-3">
          <Panel title="Buyer engagement funnel" subtitle="How far buyers get before contacting a seller">
            <FunnelChart steps={funnel ?? []} />
          </Panel>
          <div className="xl:col-span-2">
            <Panel title="Engagement activity" subtitle={`Daily views, searches, inquiries and phone clicks (last ${DAYS} days)`}>
              <ActivityChart days={activity ?? []} />
            </Panel>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-lg xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Panel title="Top listings" subtitle={`Ranked by views in the last ${DAYS} days`}>
              <TopListingsTable listings={listings?.top ?? []} />
            </Panel>
          </div>
          <div className="flex flex-col gap-lg">
            <Panel title="Listings by type" subtitle="Inventory mix">
              <Donut data={byType} ariaLabel="Listings by property type" />
            </Panel>
            <Panel title="Listings by status" subtitle="Inventory pipeline">
              <Donut data={byStatus} ariaLabel="Listings by status" />
            </Panel>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-lg xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Panel title="Market price trends" subtitle="Monthly average asking price vs actual sold price (comps)">
              <PriceTrendChart points={market ?? []} />
            </Panel>
          </div>
          <Panel title="Marketplace growth" subtitle="New listings, users and inquiries per day">
            {growth.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">No growth data available yet.</p>
            ) : (
              <TrendChart trend={growth} />
            )}
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-lg xl:grid-cols-3">
          <Panel title="Search insights" subtitle="What buyers are searching for">
            <SearchQueriesChart data={searches} />
          </Panel>
          <Panel title="Lead quality" subtitle="Inquiry mix and verified leads">
            <InquiryCharts data={leads} />
          </Panel>
          <Panel title="Demand by district" subtitle="Property views by district">
            <DistrictBarChart data={geography} />
          </Panel>
        </div>

        <Panel title="Platform health" subtitle="Shares, officer appointments and community Q&A">
          <PlatformCharts data={platform} />
        </Panel>
      </section>
    </>
  );
}
