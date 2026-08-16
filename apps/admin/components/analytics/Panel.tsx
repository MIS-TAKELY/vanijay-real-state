import type { ReactNode } from "react";

/** Consistent card wrapper for analytics sections. */
export function Panel({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={"admin-surface flex flex-col border border-outline-variant rounded-xl p-md " + (className ?? "")}>
      <div className="mb-md">
        <h2 className="font-headline-md text-lg font-semibold text-on-surface">{title}</h2>
        {subtitle ? <p className="font-label-sm text-[11px] text-on-surface-variant">{subtitle}</p> : null}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** Muted empty-state note used when an analytics section has no data. */
export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="font-body-md text-body-md text-on-surface-variant">{children}</p>;
}
