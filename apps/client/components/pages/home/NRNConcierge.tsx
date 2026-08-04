import { Button, Icon } from "@repo/ui";

export function NRNConcierge() {
  return (
    <section className="py-xl bg-surface-container-highest relative z-10">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="relative bg-surface border border-outline-variant rounded-2xl p-lg md:p-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-lg shadow-sm overflow-hidden">
          {/* Accent corner */}
          <div
            className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/5 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-xs rounded-full border border-outline-variant bg-surface-container px-3 py-1 mb-sm">
              <Icon
                name="public"
                className="text-primary text-data-table"
                filled
              />
              <span className="font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">
                For Non-Resident Nepalis
              </span>
            </span>
            <h2 className="font-headline-md text-headline-md text-primary mb-sm">
              NRN Concierge Service
            </h2>
            <p className="font-body-md text-on-surface-variant">
              We provide legal representation and archival due diligence for
              Non-Resident Nepalis. Secure your legacy from anywhere in the
              world without the need for physical travel.
            </p>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-md w-full md:w-auto md:shrink-0">
            <Button variant="default" size="lg">
              Request Information
            </Button>
            <Button variant="outline" size="lg">
              Download Brochure
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
