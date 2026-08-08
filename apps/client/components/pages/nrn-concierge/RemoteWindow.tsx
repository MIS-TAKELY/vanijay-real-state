import { Icon } from "@repo/ui";

export function RemoteWindow() {
  return (
    <section className="border-t border-outline-variant bg-surface">
      <div className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-xl px-gutter py-xl lg:grid-cols-2">
        <div>
          <p className="font-label-sm text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface-variant mb-xs">
            Step 03 — Remote Verification
          </p>
          <h2 className="font-headline-md text-data-price font-semibold leading-tight tracking-[-0.4px] text-primary mb-sm">
            Your Remote Window to Nepal
          </h2>
          <p className="mb-lg max-w-[440px] font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            We provide high-resolution drone footage and cadastral overlays so
            you can see your future land from any continent with absolute
            clarity. Every plot is documented with field-verified video before
            it enters our archive.
          </p>
          <ul className="space-y-sm">
            <li className="flex items-center gap-sm text-sm font-medium text-on-surface">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name="videocam" filled className="text-body-lg" />
              </span>
              4K drone overlays with boundary marking
            </li>
            <li className="flex items-center gap-sm text-sm font-medium text-on-surface">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name="description" filled className="text-body-lg" />
              </span>
              Historical title logs &amp; transaction history
            </li>
            <li className="flex items-center gap-sm text-sm font-medium text-on-surface">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name="map" filled className="text-body-lg" />
              </span>
              Cadastral map cross-reference with Naksha
            </li>
          </ul>
        </div>

        {/* Monitor mockup (decorative) */}
        <div className="relative" aria-hidden>
          <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container shadow-lg">
            <div className="relative aspect-[16/10] bg-gradient-to-br from-surface-container-high to-surface-container-low">
              <div className="absolute inset-4 rounded bg-surface p-3 shadow-inner">
                <div className="mb-2 flex items-center justify-between">
                  <span className="mono-stat text-[10px] font-semibold tracking-wide text-primary">
                    KATHMANDU VALLEY — CADASTRAL
                  </span>
                  <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-on-primary">
                    LIVE
                  </span>
                </div>
                <div className="h-[70%] rounded bg-gradient-to-br from-secondary-fixed to-primary-fixed opacity-90" />
                <div className="mt-2 flex gap-2">
                  <div className="h-1.5 w-12 rounded bg-primary/30" />
                  <div className="h-1.5 w-8 rounded bg-primary/20" />
                </div>
              </div>
            </div>
            <div className="mx-auto h-3 w-24 bg-outline-variant" />
            <div className="mx-auto h-1.5 w-32 rounded-b bg-outline" />
          </div>
        </div>
      </div>
    </section>
  );
}
