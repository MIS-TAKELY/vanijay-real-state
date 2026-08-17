import type { ReactNode } from "react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function DashboardHeader({
  title,
  description,
  action,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-sm sm:flex-row sm:items-end sm:justify-between mb-md">
      <div className="flex flex-col gap-xs">
        <span className="h-px w-10 bg-gold" aria-hidden />
        <h1 className="font-headline-md text-headline-md text-navy font-bold tracking-tight leading-tight">
          {title}
        </h1>
        {description ? (
          <p className="font-body-md text-body-md text-on-surface-variant">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
