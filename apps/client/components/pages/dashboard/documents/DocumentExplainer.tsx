import { Icon } from "@repo/ui";

export function DocumentExplainer() {
  return (
    <div className="flex items-start gap-sm rounded-xl border border-outline-variant bg-surface-container-low px-md py-sm mb-md">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-primary">
        <Icon name="info" className="text-[20px]" />
      </span>
      <div className="flex flex-col">
        <p className="text-sm font-medium text-on-surface">
          Your vault documents can be reused across listings.
        </p>
        <p className="text-label-sm text-on-surface-variant">
          Tax clearances expire annually — we&apos;ll remind you before they do.
        </p>
      </div>
    </div>
  );
}
