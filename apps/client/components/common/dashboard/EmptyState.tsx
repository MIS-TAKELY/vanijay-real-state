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
      <Icon
        name={icon}
        className="text-display-lg text-on-surface-variant mb-md"
      />
      <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-xs">
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
