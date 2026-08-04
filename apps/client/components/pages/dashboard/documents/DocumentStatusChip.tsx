import { cn } from "@repo/ui";
import {
  DEFAULT_DOC_STATUS_STYLE,
  DOC_STATUS_STYLES,
  type DocumentStatus,
} from "./constants";

interface DocumentStatusChipProps {
  status: DocumentStatus;
  className?: string;
}

/**
 * Document status chip (DESIGN.md §2.2 "Status chips" + §5.3):
 * colored dot + 13px label — Verified (green), Pending (amber),
 * Rejected (vermillion), Expired (red).
 */
export function DocumentStatusChip({
  status,
  className,
}: DocumentStatusChipProps) {
  const style = DOC_STATUS_STYLES[status] ?? DEFAULT_DOC_STATUS_STYLE;

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
