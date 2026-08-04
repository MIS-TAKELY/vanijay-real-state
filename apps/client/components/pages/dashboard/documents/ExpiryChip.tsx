import { Icon } from "@repo/ui";
import { cn } from "@repo/ui";
import { EXPIRY_SOON_DAYS } from "./constants";

interface ExpiryChipProps {
  /** Days until expiry; null = no expiry (non-expiring doc types). */
  daysUntilExpiry: number | null;
  className?: string;
}

/**
 * Expiry row chip (DESIGN.md §5.3): amber countdown chip if <90 days
 * ("Expires in 24 days" [Renew]); red "Expired" if past; omitted when null.
 */
export function ExpiryChip({ daysUntilExpiry, className }: ExpiryChipProps) {
  if (daysUntilExpiry === null) return null;

  const expired = daysUntilExpiry < 0;
  const expiringSoon = !expired && daysUntilExpiry <= EXPIRY_SOON_DAYS;

  if (!expired && !expiringSoon) {
  return (
      <span
        className={cn(
          "mono-stat text-[12px] text-on-surface-variant",
          className,
        )}
      >
        Valid · {daysUntilExpiry}d left
      </span>
    );
  }

  if (expired) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-[12px] font-medium text-error leading-none",
          className,
        )}
      >
        <Icon name="error" filled className="text-[14px]" />
        Expired
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[#b45309]/10 px-2 py-0.5 text-[12px] font-medium text-[#b45309] leading-none",
        className,
      )}
    >
      <Icon name="schedule" filled className="text-[14px]" />
      Expires in {daysUntilExpiry}d
      <button
        type="button"
        className="inline-flex items-center gap-0.5 rounded-full bg-[#b45309] px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-[#92400e] transition-colors cursor-pointer"
      >
        <Icon name="refresh" className="text-[12px]" />
        Renew
      </button>
    </span>
  );
}
