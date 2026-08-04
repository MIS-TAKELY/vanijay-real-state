import { Icon } from "@repo/ui";
import { cn } from "@repo/ui";
import {
  DEFAULT_INQUIRY_TYPE_META,
  INQUIRY_TYPE_META,
  type InquiryType,
} from "./constants";

interface InquiryTypeIconProps {
  type: InquiryType;
  className?: string;
}

/**
 * Inquiry type icon (DESIGN.md §5.5): WhatsApp → `chat`, Video → `videocam`,
 * General → `forum`, EMI → `calculate`.
 */
export function InquiryTypeIcon({ type, className }: InquiryTypeIconProps) {
  const meta = INQUIRY_TYPE_META[type] ?? DEFAULT_INQUIRY_TYPE_META;
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant",
        className,
      )}
    >
      <Icon name={meta.icon} className="text-[20px]" />
    </span>
  );
}
