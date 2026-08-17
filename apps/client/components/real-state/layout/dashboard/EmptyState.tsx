import { Icon } from "@repo/ui";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

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
      <div className="mb-md flex size-14 items-center justify-center rounded-full border border-gold/40 bg-navy text-gold shadow-sm">
        <Icon name={icon} className="text-[28px]" />
      </div>
      <h3 className="font-headline-md text-headline-md text-navy font-bold tracking-tight mb-xs">
        {title}
      </h3>
      {description ? (
        <p className="font-body-md text-body-md text-on-surface-variant mb-md">
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}
