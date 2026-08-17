import { Icon } from "@repo/ui";
import Link from "next/link";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #103050 1px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
        aria-hidden
      />
      <div className="mx-auto max-w-container-max px-gutter py-xl relative z-10">
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-lg md:p-xl shadow-sm text-center max-w-2xl mx-auto">
          <div className="mb-md flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary">
              <Icon name="inventory" filled className="text-data-price" />
            </span>
          </div>
          <h2 className="font-headline-md text-headline-md text-primary mb-sm">
            Start Your Search with Confidence
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed mx-auto mb-lg">
            Every listing in our archive has been field-verified,
            cadastral-cleared, and indexed with a permanent Archival ID. Browse
            with total peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
            <Link
              href="/"
              className="inline-flex cursor-pointer items-center justify-center gap-xs rounded-md bg-primary px-6 py-3 text-label-sm font-semibold tracking-[0.4px] text-on-primary transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Browse Verified Listings
              <Icon name="arrow_forward" className="text-body-lg" />
            </Link>
            <Link
              href="/area-guid"
              className="inline-flex cursor-pointer items-center justify-center gap-xs rounded-md border border-outline-variant px-6 py-3 text-label-sm font-semibold tracking-[0.4px] text-on-surface transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Explore Area Guides
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
