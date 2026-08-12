import { cn } from "@repo/ui";
import {
  DEFAULT_INQUIRY_STATUS_STYLE,
  INQUIRY_STATUS_STYLES,
  type InquiryStatus,
} from "./constants";

interface InquiryStatusChipProps {
  status: InquiryStatus;
  className?: string;
}

export function InquiryStatusChip({
  status,
  className,
}: InquiryStatusChipProps) {
  const style =
    INQUIRY_STATUS_STYLES[status] ?? DEFAULT_INQUIRY_STATUS_STYLE;

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
