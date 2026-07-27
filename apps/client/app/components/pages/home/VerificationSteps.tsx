import React from "react";
import { Icon } from "@repo/ui";

const steps = [
  {
    number: "01",
    title: "Document Audit",
    description:
      "Deep audit of ownership history, tax clearances, and cadastral maps from Land Revenue Offices.",
    icon: null,
  },
  {
    number: "02",
    title: "Field Verification",
    description:
      "Physical visit by our certified surveyors to confirm boundaries, topography, and absence of physical disputes.",
    icon: null,
  },
  {
    number: null,
    title: "Archival Stamp",
    description:
      "The property is awarded the 'Verified' status and indexed into our public-trust archival platform.",
    icon: "check_circle",
  },
];

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
      <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-3 gap-lg">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div
              className={`w-16 h-16 flex items-center justify-center border mb-md ${
                step.icon
                  ? "bg-primary border-primary shadow-md"
                  : "bg-surface-container border-outline"
              }`}
            >
              {step.icon ? (
                <Icon name={step.icon} className="text-white text-3xl" />
              ) : (
                <span className="mono-stat text-2xl text-primary font-bold">
                  {step.number}
                </span>
              )}
            </div>
            <h3 className="font-label-sm font-bold text-on-surface mb-xs uppercase tracking-widest text-[11px]">
              {step.title}
            </h3>
            <p className="font-body-md text-on-surface-variant">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
