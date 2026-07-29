import React from "react";
import { Icon } from "@repo/ui";
import { trustItems } from "constants/varibles-constants";


export function TrustStack() {
  return (
    <section className="bg-surface-container-low border-b border-outline-variant relative z-10">
      <div className="max-w-container-max mx-auto px-gutter py-md">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
          {trustItems.map((item) => (
            <div
              key={item.icon}
              className="py-sm md:py-sm md:px-md flex items-center gap-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name={item.icon} className="text-[20px]" filled />
              </span>
              <span className="font-label-sm text-label-sm text-on-surface leading-snug">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
