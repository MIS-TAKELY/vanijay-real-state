import { Badge } from "@repo/ui";
import type { ListingStatus, VerificationLevel } from "constants/operations";
import { cn } from "@repo/ui";

/**
 * Status chip — color is semantic per DESIGN.md §1.2:
 * green = live/verified, vermillion = flagged/stamp, red = disputed/error,
 * amber = pending, surface = neutral (draft).
 */
const STATUS_VARIANT: Record<ListingStatus, string> = {
  DRAFT: "bg-surface-container text-on-surface-variant",
  UNDER_VERIFICATION: "bg-amber text-on-amber",
  LIVE: "bg-primary text-on-primary",
  FLAGGED: "bg-tertiary text-on-tertiary",
  DISPUTED: "bg-error text-on-error",
  SOLD: "bg-secondary text-on-secondary",
};

export function StatusChip({ status }: { status: ListingStatus }) {
  return (
    <Badge
      className={cn(
        "font-label-sm mono-stat text-[11px] font-bold uppercase tracking-widest",
        STATUS_VARIANT[status],
      )}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

/**
 * Mini verification stamp — the archive's trust mark rendered compact in tables.
 * Uses the L3/L2/L1 palette so the stamp always encodes verification level
 * (vermillion = field-verified, green-grey = desk-verified, grey = basic).
 * The full rotated .verification-stamp class is the page signature element;
 * this keeps stable geometry inside tight table cells.
 */
export function Stamp({ level }: { level: VerificationLevel }) {
  const palette: Record<VerificationLevel, string> = {
    L1: "border-outline-variant text-on-surface-variant",
    L2: "border-secondary text-secondary",
    L3: "border-tertiary text-tertiary",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded border-2 bg-tertiary/5 px-1.5 py-0.5 font-label-sm font-bold uppercase tracking-widest text-[9px] leading-none",
        palette[level],
      )}
      aria-label={`Verification level ${level}`}
    >
      {level}
    </span>
  );
}
