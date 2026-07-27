import React from "react";
import { Icon } from "@repo/ui";

const trustItems = [
  { icon: "description", text: "Every document checked before listing" },
  { icon: "location_on", text: "Field verification, not just paperwork" },
  { icon: "verified_user", text: "You'll always know what's disputed or clear" },
];

export function TrustStack() {
  return (
    <section className="bg-surface-container-low border-b border-outline-variant relative z-10">
      <div className="max-w-container-max mx-auto px-gutter py-md">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
          {trustItems.map((item) => (
            <div
              key={item.icon}
              className="py-sm md:py-xs md:px-md flex items-center gap-sm"
            >
              <Icon name={item.icon} className="text-primary" />
              <span className="font-label-sm text-label-sm text-on-surface">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
