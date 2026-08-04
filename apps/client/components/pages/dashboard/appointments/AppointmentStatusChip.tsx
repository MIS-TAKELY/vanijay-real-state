import { cn } from "@repo/ui";
import {
  APPOINTMENT_STATUS_STYLES,
  DEFAULT_APPT_STATUS_STYLE,
  type AppointmentStatus,
} from "./constants";

interface AppointmentStatusChipProps {
  status: AppointmentStatus;
  className?: string;
}

export function AppointmentStatusChip({
  status,
  className,
}: AppointmentStatusChipProps) {
  const style =
    APPOINTMENT_STATUS_STYLES[status] ?? DEFAULT_APPT_STATUS_STYLE;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium leading-none whitespace-nowrap",
        style.chip,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
