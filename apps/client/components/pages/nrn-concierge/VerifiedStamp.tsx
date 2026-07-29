import { Icon } from "@repo/ui";

export function VerifiedStamp() {
  return (
    <section className="bg-surface-container-low border-y border-outline-variant">
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        <div className="flex flex-col items-center text-center gap-lg md:flex-row md:items-center md:gap-xl md:text-left">
          {/* Stamp */}
          <div
            className="flex h-24 w-24 shrink-0 rotate-3 flex-col items-center justify-center rounded-lg border-2 border-tertiary bg-surface text-center shadow-sm transition-transform duration-300 hover:rotate-0"
            aria-hidden
          >
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-tertiary">
              Verified
            </span>
            <span className="mt-0.5 text-[9px] font-semibold tracking-[0.8px] text-tertiary">
              Lekhaprati
            </span>
            <Icon name="verified" filled className="mt-1 text-[20px] text-tertiary" />
          </div>

          {/* E-E-A-T content */}
          <div >
            <h2 className="font-headline-md text-headline-md text-primary mb-sm">
              The Lekhaprati Verification Standard
            </h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              Every plot processed through our NRN concierge carries the
              Lekhaprati archival stamp — your assurance that the title has been
              cross-referenced against the Land Revenue Office master ledger,
              field-verified by certified surveyors, and cleared of inheritance
              disputes, banking liens, and Guthi (trust) land encroachments.
            </p>
            <p className="mt-sm text-sm text-on-surface-variant">
              <span className="mono-stat text-on-surface font-semibold">
                Stamp Ref:
              </span>{" "}
              LKP/VER-ARCHIVAL &middot; Indexed into the public-trust archive.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
