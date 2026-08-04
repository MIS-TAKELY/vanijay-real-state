import { Icon } from "@repo/ui";
import { cn } from "@repo/ui";
import {
  DEFAULT_DOCUMENT_TYPE_META,
  DOCUMENT_TYPE_META,
  type DocumentType,
} from "./constants";

interface DocumentTypeIconProps {
  type: DocumentType;
  className?: string;
}

/**
 * Document type icon (DESIGN.md §5.3): Lalpurja → `article`, Citizenship →
 * `badge`, Tax clearance → `receipt_long`, Naksa → `map`. Rendered in a
 * rounded `secondary-container` square.
 */
export function DocumentTypeIcon({ type, className }: DocumentTypeIconProps) {
  const meta = DOCUMENT_TYPE_META[type] ?? DEFAULT_DOCUMENT_TYPE_META;

  return (
    <span
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-primary",
        className,
      )}
    >
      <Icon name={meta.icon} className="text-[24px]" />
    </span>
  );
}
