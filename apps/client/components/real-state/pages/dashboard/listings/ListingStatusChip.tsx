import { cn } from "@repo/ui";
import {
  DEFAULT_LISTING_STATUS_STYLE,
  LISTING_STATUS_STYLES,
  type ListingStatus,
} from "./constants";

interface ListingStatusChipProps {
  status: ListingStatus;
  className?: string;
}

/**
 * Status chip for a listing row (DESIGN.md §2.2 "Status chips" + §5.2):
 * colored dot + 13px label, color per status semantics.
 */
export function ListingStatusChip({
  status,
  className,
}: ListingStatusChipProps) {
  const style = LISTING_STATUS_STYLES[status] ?? DEFAULT_LISTING_STATUS_STYLE;

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
