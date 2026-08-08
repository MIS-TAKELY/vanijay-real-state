import { Icon } from "@repo/ui";
import { steps } from "constants/varibles-constants";

export function VerificationSteps() {
  return (
    <section className="py-xl bg-surface border-y border-outline-variant relative z-10">
      <div className="max-w-container-max mx-auto px-gutter text-center mb-xl">
        <h2 className="font-headline-md text-display-lg text-primary mb-sm">
          The Verification Standard
        </h2>
        <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">
          Our 3-stage archival process ensures that every plot listed on
          Lekhaprati is legally sound and ready for transfer.
        </p>
      </div>
      <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-3 gap-lg relative">
        {/* Connecting line on desktop */}
        <div
          className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-outline-variant"
          aria-hidden="true"
        />
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center relative"
          >
            <div
              className={`relative w-16 h-16 flex items-center justify-center rounded-2xl border-2 mb-md ${
                step.icon
                  ? "bg-primary border-primary text-on-primary shadow-lg"
                  : "bg-surface border-outline-variant text-primary"
              }`}
            >
              {step.icon ? (
                <Icon name={step.icon} className="text-data-price" filled />
              ) : (
                <span className="mono-stat text-2xl font-bold leading-none">
                  {step.number}
                </span>
              )}
            </div>
            <h3 className="font-label-sm font-bold text-on-surface mb-xs uppercase tracking-widest text-[11px]">
              {step.title}
            </h3>
            <p className="font-body-md text-on-surface-variant ">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
