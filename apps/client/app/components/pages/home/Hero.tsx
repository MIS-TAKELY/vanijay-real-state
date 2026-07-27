import React from "react";
import { Button, Stat, Icon } from "@repo/ui";

const propertyTypes = ["Land", "House", "Commercial"];

const stats = [
  { value: "12,482", label: "Verified Listings" },
  { value: "74", label: "Districts Covered" },
  { value: "0%", label: "Title Discrepancies" },
];

export function Hero() {
  return (
    <section className="relative min-h-[600px] flex flex-col justify-center overflow-hidden border-b border-outline-variant py-xl">
      <div className="max-w-container-max mx-auto px-gutter w-full relative z-10">
        <div className="max-w-3xl">
          <h1 className="font-display-lg text-display-lg text-primary mb-md leading-[1.1]">
            Every plot, verified before it&apos;s listed.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg leading-relaxed max-w-2xl">
            The archive of record for legitimate land ownership. We
            cross-reference every listing against cadastral surveys and field
            reports to eliminate the risk of legal disputes.
          </p>

          {/* Search Module */}
          <div className="bg-surface p-base border border-outline-variant shadow-lg max-w-2xl focus-within:ring-2 focus-within:ring-primary/20">
            <div className="flex flex-col md:flex-row gap-xs">
              <div className="flex bg-surface-container p-xs gap-xs">
                {propertyTypes.map((type, i) => (
                  <button
                    key={type}
                    className={`px-md py-xs font-label-sm text-label-sm transition-colors ${
                      i === 0
                        ? "bg-primary text-white"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="flex-1 flex border-l border-outline-variant px-sm items-center">
                <Icon name="search" className="text-outline mr-sm" />
                <input
                  className="w-full bg-transparent border-none focus:ring-0 text-body-md font-body-md py-md"
                  placeholder="Search by district, municipality, or plot ID..."
                  type="text"
                />
              </div>
              <Button variant="default">
                Search Archive
              </Button>
            </div>
          </div>

          {/* Trust Strip */}
          <div className="mt-lg flex flex-wrap gap-lg border-t border-outline-variant pt-lg md:divide-x divide-outline-variant">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col md:pr-md">
                <Stat value={stat.value} label={stat.label} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
