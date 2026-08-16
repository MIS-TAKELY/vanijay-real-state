"use client";

import { ToggleGroup, ToggleGroupItem } from "@repo/ui";
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
    <ToggleGroup
      type="single"
      value={active}
      onValueChange={(v) => {
        if (v) onChange(v as ListingFilter);
      }}
      aria-label="Filter listings"
      variant="outline"
      className="flex gap-xs overflow-x-auto no-scrollbar mb-md justify-start"
    >
      {LISTING_FILTER_TABS.map((tab) => {
        const count = counts[tab.key] ?? 0;
        return (
          <ToggleGroupItem
            key={tab.key}
            value={tab.key}
            aria-label={tab.label}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-on-primary data-[state=off]:bg-surface-container data-[state=off]:text-on-surface-variant data-[state=off]:hover:bg-surface-container-high data-[state=off]:hover:text-on-surface"
          >
            {tab.label}
            <span
              className={`mono-stat text-[12px] font-bold leading-none ${
                active === tab.key
                  ? "text-on-primary/80"
                  : "text-on-surface-variant"
              }`}
            >
              {count}
            </span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
