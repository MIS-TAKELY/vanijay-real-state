import { Icon } from "@repo/ui";
import type { ReactNode } from "react";

interface EmptyStateProps {
  /** Material Symbols icon name, shown at 48px. */
  icon?: string;
  title: string;
  description?: string;
  /** Optional primary action rendered in the lower-right. */
  action?: ReactNode;
  className?: string;
}

/**
 * Reusable empty state per DESIGN.md §2.7 — `blueprint-grid` background
 * panel, 48px outline icon, Fraunces headline, body copy, one action.
 */
export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`blueprint-grid flex flex-col items-center justify-center text-center rounded-2xl border border-outline-variant bg-surface px-md py-xl ${className ?? ""}`}
    >
      <Icon
        name={icon}
        className="text-[48px] text-on-surface-variant mb-md"
      />
      <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-xs">
        {title}
      </h3>
      {description ? (
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-md">
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}
