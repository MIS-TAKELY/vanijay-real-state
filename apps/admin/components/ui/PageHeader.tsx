import { Icon } from "@repo/ui";
import { cn } from "@repo/ui";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  actions?: React.ReactNode;
  className?: string;
}

/** Consistent page heading used across every admin screen. */
export function PageHeader({
  title,
  description,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-xs", className)}>
      <div className="flex flex-wrap items-center gap-sm">
        {icon ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-primary">
            <Icon name={icon} className="text-[22px]" />
          </span>
        ) : null}
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
          {title}
        </h1>
        {actions ? (
          <div className="ml-auto flex items-center gap-xs">{actions}</div>
        ) : null}
      </div>
      {description ? (
        <p className="font-body-md text-body-md text-on-surface-variant">
          {description}
        </p>
      ) : null}
    </header>
  );
}
