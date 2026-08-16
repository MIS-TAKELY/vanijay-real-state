import { cn, Icon } from "@repo/ui";
import { EmptyState } from "components/real-state/layout/dashboard/EmptyState";
import { DEFAULT_STATUS_STYLE, STATUS_STYLES } from "../constants";
import type { DashboardAppointment } from "lib/api/services/dashboard";

interface UpcomingAppointmentsProps {
  appointments?: DashboardAppointment[];
}

export function UpcomingAppointments({
  appointments,
}: UpcomingAppointmentsProps) {
  const items = appointments ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon="event_available"
        title="No upcoming appointments"
        description="Book a field verification to earn the Level 3 stamp."
      />
    );
  }

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-md">
      <h3 className="font-headline-md text-base font-semibold text-on-surface mb-md flex items-center gap-xs">
        <Icon name="event" className="text-[20px] text-on-surface-variant" />
        Upcoming Appointments
      </h3>

      <div className="flex flex-col gap-sm">
        {items.map((appt) => {
          const status = STATUS_STYLES[appt.status] ?? DEFAULT_STATUS_STYLE;
          return (
            <div
              key={appt.id}
              className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-low p-sm hover:bg-surface-container transition-colors"
            >
              {/* date block */}
              <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-outline-variant bg-surface py-1.5">
                <span className="mono-stat text-lg font-bold text-on-surface leading-none">
                  {appt.day}
                </span>
                <span className="font-label-sm text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  {appt.month}
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="mono-stat text-[12px] text-on-surface-variant">
                    {appt.propertyCode}
                  </span>
                  <span className="text-[11px] text-outline-variant">·</span>
                  <span className="text-[11px] text-on-surface-variant truncate">
                    {appt.propertyArea}
                  </span>
                </div>
                <span className="font-body-md text-sm text-on-surface truncate">
                  {appt.type}
                </span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">
                  Officer: {appt.officer}
                </span>
              </div>

              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none",
                  status.chip,
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
