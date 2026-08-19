import type { DashboardStat } from "../constants";
import { StatCard } from "./StatCard";

interface StatGridProps {
  stats?: DashboardStat[];
}

export function StatGrid({ stats }: StatGridProps) {
  const items = stats ?? [];

  if (items.length === 0) {
    return (
      <div className="mb-md flex gap-md overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-x-visible lg:pb-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex min-w-[200px] flex-shrink-0 flex-col gap-sm rounded-2xl border border-outline-variant bg-surface p-md lg:min-w-0"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-surface-container" />
              <div className="h-8 w-8 rounded-lg bg-surface-container" />
            </div>
            <div className="h-8 w-16 rounded bg-surface-container" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-md flex gap-md overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-x-visible lg:pb-0">
      {items.map((stat) => (
        <div key={stat.label} className="min-w-[200px] flex-shrink-0 lg:min-w-0">
          <StatCard stat={stat} />
        </div>
      ))}
    </div>
  );
}
