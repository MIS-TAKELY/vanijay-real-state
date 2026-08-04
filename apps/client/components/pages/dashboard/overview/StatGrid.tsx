import { DASHBOARD_STATS } from "../constants";
import { StatCard } from "./StatCard";
export function StatGrid() {
  return (
    <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4 mb-md">
      {DASHBOARD_STATS.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
