"use client";

import { ToggleGroup, ToggleGroupItem } from "@repo/ui";
import { INQUIRY_TABS, type InquiryTab } from "./constants";

interface InquiryTabsProps {
  active: InquiryTab;
  counts: Record<InquiryTab, number>;
  onChange: (tab: InquiryTab) => void;
}

/**
 * Inquiry tabs (DESIGN.md §5.5): Received (seller/agent view) /
 * Sent (buyer view) — counts in mono.
 */
export function InquiryTabs({ active, counts, onChange }: InquiryTabsProps) {
  return (
    <ToggleGroup
      type="single"
      value={active}
      onValueChange={(v) => {
        if (v) onChange(v as InquiryTab);
      }}
      aria-label="Inquiry view"
      variant="outline"
      className="flex gap-xs mb-md justify-start"
    >
      {INQUIRY_TABS.map((tab) => {
        const count = counts[tab.key] ?? 0;
        return (
          <ToggleGroupItem
            key={tab.key}
            value={tab.key}
            aria-label={tab.label}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-on-primary data-[state=off]:bg-surface-container data-[state=off]:text-on-surface-variant data-[state=off]:hover:bg-surface-container-high data-[state=off]:hover:text-on-surface"
          >
            {tab.label}
            <span
              className={`mono-stat text-[12px] font-bold leading-none ${
                active === tab.key ? "text-on-primary/80" : "text-on-surface-variant"
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
