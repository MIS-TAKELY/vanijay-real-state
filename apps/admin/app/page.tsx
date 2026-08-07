import { Button } from "@repo/ui";
import { ActivityFeed } from "components/ActivityFeed";
import { StatCard } from "components/StatCard";
import { VerificationQueueTable } from "components/VerificationQueueTable";
import { OPERATIONS_STATS } from "constants/operations";

/** Force SSR so the "last updated" clock is live on an internal console. */
export const dynamic = "force-dynamic";

export default function OperationsConsolePage() {
  const now = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      {/* Page header */}
      <header className="flex flex-col gap-xs">
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
          Console
        </h1>
        <div className="flex flex-col gap-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Verification queue, disputes and recent activity for the archive.
          </p>
          <span className="mono-stat text-[11px] text-on-surface-variant">
            Last updated {now}
          </span>
        </div>
      </header>

      {/* Key metrics */}
      <section className="mt-lg animate-fade-in-up" style={{ animationDelay: "40ms" }}>
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
          {OPERATIONS_STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </section>

      {/* Verification queue + recent activity */}
      <section className="mt-lg animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        <div className="grid grid-cols-1 gap-lg xl:grid-cols-3">
          <div className="xl:col-span-2">
            <div className="admin-surface border border-outline-variant rounded-xl p-md">
              <div className="mb-md flex items-center justify-between">
                <h2 className="font-headline-md text-lg font-semibold text-on-surface">
                  Verification queue
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-surface-container"
                  asChild
                >
                  <a href="/listings">View all listings →</a>
                </Button>
              </div>
              <VerificationQueueTable />
            </div>
          </div>

          <div>
            <div className="admin-surface border border-outline-variant rounded-xl p-md">
              <h2 className="font-headline-md text-lg font-semibold text-on-surface">
                Recent activity
              </h2>
              <ActivityFeed />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
