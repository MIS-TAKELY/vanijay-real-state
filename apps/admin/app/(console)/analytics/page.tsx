import { cookies } from "next/headers";
import { PageHeader } from "components/ui/PageHeader";
import { adminFetch } from "lib/server";

export const dynamic = "force-dynamic";

type TrendPoint = { date: string; listings: number; users: number; inquiries: number };

export default async function AnalyticsPage() {
  const cookie = (await cookies()).toString();
  let trend: TrendPoint[] = [];
  try {
    trend = await adminFetch<TrendPoint[]>(cookie, "/api/v1/admin/analytics/trend?days=30");
  } catch {
    trend = [];
  }

  return (
    <>
      <PageHeader icon="insights" title="Analytics" description="30-day activity trend across listings, users and inquiries." />
      <section className="mt-lg">
        {trend.length === 0 ? (
          <div className="admin-surface border border-outline-variant rounded-xl p-md">
            <p className="text-on-surface-variant">No analytics data available yet. Start the API and seed data to see trends.</p>
          </div>
        ) : (
          <div className="admin-surface border border-outline-variant rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b border-outline-variant bg-surface-container-low font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
                  <tr><th className="px-md py-3">Date</th><th className="px-md py-3">New Listings</th><th className="px-md py-3">New Users</th><th className="px-md py-3">Inquiries</th></tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {trend.map((p) => (
                    <tr key={p.date} className="hover:bg-surface-container/60">
                      <td className="mono-stat px-md py-3 text-[12px] text-on-surface-variant">{p.date}</td>
                      <td className="mono-stat px-md py-3 text-on-surface">{p.listings}</td>
                      <td className="mono-stat px-md py-3 text-on-surface">{p.users}</td>
                      <td className="mono-stat px-md py-3 text-on-surface">{p.inquiries}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
