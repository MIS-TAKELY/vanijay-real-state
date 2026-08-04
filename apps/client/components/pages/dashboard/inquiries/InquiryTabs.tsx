"use client";

import { cn } from "@repo/ui";
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
    <div className="flex gap-xs mb-md">
      {INQUIRY_TABS.map((tab) => {
        const isActive = active === tab.key;
        const count = counts[tab.key] ?? 0;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              isActive
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "mono-stat text-[12px] font-bold leading-none",
                isActive ? "text-on-primary/80" : "text-on-surface-variant",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
