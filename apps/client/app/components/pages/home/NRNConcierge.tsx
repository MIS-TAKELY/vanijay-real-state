import React from "react";
import { Button } from "@repo/ui";

export function NRNConcierge() {
  return (
    <section className="py-xl bg-surface-container-highest relative z-10">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="bg-surface border border-outline-variant p-lg flex flex-col md:flex-row items-center justify-between gap-lg shadow-sm">
          <div className="max-w-2xl">
            <h2 className="font-headline-md text-headline-md text-primary mb-sm">
              NRN Concierge Service
            </h2>
            <p className="font-body-md text-on-surface-variant">
              We provide legal representation and archival due diligence for
              Non-Resident Nepalis. Secure your legacy from anywhere in the
              world without the need for physical travel.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-md w-full md:w-auto">
            <Button variant="default">
              Request Information
            </Button>
            <Button variant="outline">
              Download Brochure
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
