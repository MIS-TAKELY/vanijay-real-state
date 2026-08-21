"use client";

import { cn, ToggleGroup, ToggleGroupItem } from "@repo/ui";
import { LISTING_FILTER_TABS, type ListingFilter } from "./constants";

interface ListingsFilterTabsProps {
  active: ListingFilter;
  counts: Record<ListingFilter, number>;
  onChange: (filter: ListingFilter) => void;
}

export function ListingsFilterTabs({
  active,
  counts,
  onChange,
}: ListingsFilterTabsProps) {
  return (
    <div className="relative mb-4 w-full min-w-0">
      {/* Fade hint — signals more tabs are scrollable on mobile */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-surface to-transparent sm:hidden" />

      {/* Horizontal scroll track */}
      <div className="no-scrollbar -mx-4 flex w-[calc(100%+2rem)] overflow-x-auto overscroll-x-contain px-4 py-1 touch-pan-x sm:mx-0 sm:w-full sm:px-0">
        <ToggleGroup
          type="single"
          value={active}
          onValueChange={(v) => {
            if (v) onChange(v as ListingFilter);
          }}
          aria-label="Filter listings"
          spacing={2}
          className="flex w-max min-w-full items-center gap-1.5 pr-8 sm:pr-0"
        >
          {LISTING_FILTER_TABS.map((tab) => {
            const count = counts[tab.key] ?? 0;
            const isSelected = active === tab.key;
            return (
              <ToggleGroupItem
                key={tab.key}
                value={tab.key}
                aria-label={tab.label}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                  isSelected
                    ? "border-transparent bg-navy text-white shadow-xs data-[state=on]:bg-navy data-[state=on]:text-white"
                    : "border-outline-variant/60 bg-surface-container/60 text-on-surface-variant hover:bg-surface-container hover:text-on-surface data-[state=off]:bg-surface-container/60 data-[state=off]:text-on-surface-variant",
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "mono-stat text-[11px] sm:text-[12px] font-bold leading-none tabular-nums",
                    isSelected ? "text-white/80" : "text-on-surface-variant/80",
                  )}
                >
                  {count}
                </span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
    </div>
  );
}
