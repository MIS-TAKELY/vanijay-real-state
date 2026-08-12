import { cn, Icon } from "@repo/ui";
import { EmptyState } from "components/real-state/layout/dashboard/EmptyState";
import { ACTIVITY_STYLES, DEFAULT_STATUS_STYLE } from "../constants";
import type { DashboardActivityItem } from "lib/api/services/dashboard";

interface ActivityFeedProps {
  activity?: DashboardActivityItem[];
}

export function ActivityFeed({ activity }: ActivityFeedProps) {
  const items = activity ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon="timeline"
        title="No recent activity"
        description="Inquiries, document updates and appointments will appear here."
      />
    );
  }

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-md">
      <h3 className="font-headline-md text-base font-semibold text-on-surface mb-md flex items-center gap-xs">
        <Icon name="history" className="text-[20px] text-on-surface-variant" />
        Recent Activity
      </h3>

      <ol className="relative flex flex-col gap-md pl-sm">
        {/* vertical rail */}
        <span
          aria-hidden
          className="absolute left-1.75 top-1 bottom-1 w-px bg-outline-variant"
        />

        {items.map((item) => {
          const style = ACTIVITY_STYLES[item.type] ?? DEFAULT_STATUS_STYLE;
          return (
            <li key={item.id} className="relative flex gap-sm pl-md">
              {/* dot */}
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-1.5 h-3 w-3 rounded-full ring-4 ring-surface",
                  style.dot,
                )}
              />
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <Icon
                    name={style.icon}
                    className="text-data-table text-on-surface-variant"
                  />
                  <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    {style.label}
                  </span>
                </div>
                <p className="font-body-md text-sm text-on-surface leading-snug">
                  {item.message}
                </p>
                <div className="flex items-center gap-2">
                  <span className="mono-stat text-[11px] text-on-surface-variant">
                    {item.timestamp}
                  </span>
                  <span className="text-[11px] text-outline-variant">·</span>
                  <span className="text-[11px] text-on-surface-variant">
                    {item.relative}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
