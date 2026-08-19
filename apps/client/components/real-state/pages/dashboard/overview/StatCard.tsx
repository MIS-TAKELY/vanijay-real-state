import { cn, Icon, Stat } from "@repo/ui";
import type { DashboardStat } from "../constants";

interface StatCardProps {
  stat: DashboardStat;
}

export function StatCard({ stat }: StatCardProps) {
  const positive = stat.deltaPositive ?? false;

  return (
    <div className="flex flex-col gap-sm rounded-2xl border border-outline-variant border-t-2 border-t-gold/40 bg-surface p-md shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
          {stat.label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg  text-gold shadow-sm">
          <Icon name={stat.icon} className="text-body-lg" />
        </span>
      </div>

      <Stat value={stat.value} label="" className="gap-0" />

      {stat.delta ? (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "mono-stat inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none",
              positive
                ? "bg-primary/10 text-primary"
                : "bg-tertiary/10 text-tertiary",
            )}
          >
            <Icon
              name={positive ? "trending_up" : "trending_down"}
              className="text-[14px]"
            />
            {stat.delta}
          </span>
          {stat.window ? (
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              {stat.window}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
