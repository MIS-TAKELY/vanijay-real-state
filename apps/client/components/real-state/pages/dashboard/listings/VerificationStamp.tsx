import { cn } from "@repo/ui";

interface VerificationStampProps {
  /** Verification level enum, e.g. "LEVEL_2_DOC_VERIFIED". */
  level: string;
  className?: string;
}

const STAMP_LABELS: Record<string, string> = {
  UNVERIFIED: "Unverified",
  LEVEL_1_BASIC: "L1",
  LEVEL_2_DOC_VERIFIED: "L2",
  LEVEL_3_FIELD_VERIFIED: "L3",
  REJECTED: "Rejected",
};

/**
 * Mini verification stamp (DESIGN.md §1.5 `.verification-stamp` + §5.2
 * "verification level (stamp mini)"). Compact rotated mark shown per row.
 */
export function VerificationStamp({
  level,
  className,
}: VerificationStampProps) {
  const label = STAMP_LABELS[level] ?? "—";
  const isVerified =
    level === "LEVEL_2_DOC_VERIFIED" || level === "LEVEL_3_FIELD_VERIFIED";
  const isRejected = level === "REJECTED";

  return (
    <span
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded border px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider leading-none",
        isVerified && "border-tertiary/60 text-tertiary bg-tertiary/5",
        isRejected && "border-error/60 text-error bg-error/5",
        !isVerified &&
          !isRejected &&
          "border-outline-variant text-on-surface-variant bg-surface-container",
        className,
      )}
    >
      {label}
    </span>
  );
}
