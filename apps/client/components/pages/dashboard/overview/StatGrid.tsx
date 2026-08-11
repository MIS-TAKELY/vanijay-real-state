import type { DashboardStat } from "../constants";
import { StatCard } from "./StatCard";

interface StatGridProps {
  stats?: DashboardStat[];
}

export function StatGrid({ stats }: StatGridProps) {
  const items = stats ?? [];

  if (items.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4 mb-md">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-sm rounded-2xl border border-outline-variant bg-surface p-md"
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
    <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4 mb-md">
      {items.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
