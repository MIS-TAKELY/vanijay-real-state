"use client";

import { cn, Icon } from "@repo/ui";
import { REVIEW_CHECKLIST } from "./constants";

export function StepReview() {
  return (
    <div className="grid grid-cols-1 gap-md lg:grid-cols-3">
      {/* Preview mirror */}
      <div className="lg:col-span-2 flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface">
        <div className="relative h-44 bg-gradient-to-br from-[#A8C0A0] to-[#5A7A55]">
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-surface/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-tertiary">
            <Icon name="verified" className="text-[12px]" /> Verified Archive
          </span>
        </div>
        <div className="flex flex-col gap-sm p-md">
          <span className="mono-stat text-[12px] text-on-surface-variant">
            LOT-442-BHA
          </span>
          <h3 className="font-headline-md text-lg font-medium text-on-surface">
            Bhaisepati Residential Land
          </h3>
          <p className="mono-stat text-lg font-semibold text-primary">
            NPR 2,45,00,000
          </p>
          <p className="text-sm text-on-surface-variant">
            Bhaisepati, Lalitpur
          </p>
          <div className="flex flex-wrap gap-1.5 border-t border-outline-variant pt-sm text-sm text-on-surface-variant">
            {["0-4-0-0 Ropani", "South facing", "20ft Pitched Road"].map(
              (m) => (
                <span
                  key={m}
                  className="rounded bg-surface-container px-2 py-0.5 text-[12px]"
                >
                  {m}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Checklist sidebar */}
      <div className="flex flex-col gap-md">
        <div className="rounded-2xl border border-outline-variant bg-surface p-md">
          <h4 className="mb-sm font-headline-md text-base font-semibold text-on-surface">
            Readiness checklist
          </h4>
          <ul className="flex flex-col gap-sm">
            {REVIEW_CHECKLIST.map((item) => (
              <li key={item.label} className="flex items-center gap-sm text-sm">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    item.state === "ok"
                      ? "bg-primary text-on-primary"
                      : "bg-[#b45309]/10 text-[#b45309]",
                  )}
                >
                  <Icon
                    name={item.state === "ok" ? "check" : "warning"}
                    className="text-[16px]"
                  />
                </span>
                <span className="flex items-center gap-1.5 text-on-surface">
                  <Icon
                    name={item.icon}
                    className="text-[16px] text-on-surface-variant"
                  />
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
