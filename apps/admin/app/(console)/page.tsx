import { cookies } from "next/headers";
import { Button } from "@repo/ui";
import { PageHeader } from "components/ui/PageHeader";
import { StatCard } from "components/StatCard";
import { AdminOverview, AuditRow } from "lib/api";
import { adminFetch } from "lib/server";
import { OPERATIONS_STATS } from "constants/operations";

export const dynamic = "force-dynamic";

type StatusRow = { status: string; _count: { _all: number } };

async function loadOverview(cookie?: string): Promise<{ ok: boolean; overview?: AdminOverview; audits?: AuditRow[] }> {
  try {
    const [overview, audits] = await Promise.all([
      adminFetch<AdminOverview>(cookie, "/api/v1/admin/overview"),
      adminFetch<AuditRow[]>(cookie, "/api/v1/admin/audit-log?take=8").catch(() => []),
    ]);
    return { ok: true, overview, audits };
  } catch {
    return { ok: false };
  }
}

export default async function DashboardPage() {
  const cookie = (await cookies()).toString();
  const data = await loadOverview(cookie);
  const overview = data.overview;
  const live = data.ok && overview;

  // Compute KPI stat cards from live data (fall back to mock when offline).
  const stats = live
    ? [
        { label: "Live Listings", value: String(overview!.totalProperties), hint: String(overview!.propertiesByStatus.find((s) => s.status === "LIVE")?._count._all ?? 0) + " live now", icon: "list_alt", tone: "primary" as const },
        { label: "Under Verification", value: String(overview!.propertiesByStatus.find((s) => s.status === "UNDER_VERIFICATION")?._count._all ?? 0), hint: "in queue", icon: "verified", tone: "tertiary" as const },
        { label: "Total Users", value: String(overview!.totalUsers), hint: overview!.totalSellers + " sellers", icon: "manage_accounts", tone: "surface" as const },
        { label: "Docs Expiring", value: String(overview!.documentsExpiring), hint: "next 30 days", icon: "article", tone: "amber" as const },
      ]
    : OPERATIONS_STATS;

  const now = new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <PageHeader
        icon="space_dashboard"
        title="Dashboard"
        description="Verification queue, disputes and recent activity for the archive."
        actions={
          <span className="mono-stat text-[11px] text-on-surface-variant">
            {live ? "Live" : "Offline demo"} · last refreshed {now}
          </span>
        }
      />

      <section className="mt-lg">
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </section>

      {live ? (
        <section className="mt-lg grid grid-cols-1 gap-lg xl:grid-cols-3">
          <div className="xl:col-span-2">
            <div className="admin-surface border border-outline-variant rounded-xl p-md">
              <div className="mb-md flex items-center justify-between">
                <h2 className="font-headline-md text-lg font-semibold text-on-surface">Recent admin activity</h2>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-surface-container" asChild>
                  <a href="/audit">View audit log →</a>
                </Button>
              </div>
              <AuditFeed rows={data.audits ?? []} />
            </div>
          </div>
          <StatusBreakdown byStatus={overview!.propertiesByStatus} />
        </section>
      ) : (
        <OfflineNotice />
      )}
    </>
  );
}

function AuditFeed({ rows }: { rows: AuditRow[] }) {
  if (rows.length === 0) {
    return <p className="font-body-md text-body-md text-on-surface-variant">No activity recorded yet.</p>;
  }
  return (
    <div className="flex flex-col divide-y divide-outline-variant/60">
      {rows.map((row) => (
        <div key={row.id} className="flex items-start gap-sm py-sm">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary">
            <span className="font-headline-md text-[11px] font-bold">{(row.actor?.name || "A").charAt(0).toUpperCase()}</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-on-surface">{row.summary || `${row.action} ${row.entity}`}</p>
            <p className="font-label-sm text-[11px] text-on-surface-variant">
              by {row.actor?.name || row.actor?.email} · {new Date(row.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBreakdown({ byStatus }: { byStatus: StatusRow[] }) {
  return (
    <div className="admin-surface border border-outline-variant rounded-xl p-md">
      <h2 className="font-headline-md text-lg font-semibold text-on-surface">Listings by status</h2>
      <div className="mt-md flex flex-col gap-sm">
        {byStatus.map((row) => {
          const pct = Math.max(2, row._count._all);
          return (
            <div key={row.status}>
              <div className="mb-1 flex items-center justify-between font-label-sm text-[12px]">
                <span className="uppercase tracking-wider text-on-surface-variant">{row.status.replaceAll("_", " ")}</span>
                <span className="mono-stat text-on-surface">{row._count._all}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OfflineNotice() {
  return (
    <section className="mt-lg">
      <div className="admin-surface border border-outline-variant rounded-xl p-md">
        <h2 className="font-headline-md text-lg font-semibold text-on-surface">Live data unavailable</h2>
        <p className="mt-xs font-body-md text-body-md text-on-surface-variant">
          The API could not be reached (or your session is not authorized). Showing demo cards. Start the API and sign in to see live archive data.
        </p>
      </div>
    </section>
  );
}
