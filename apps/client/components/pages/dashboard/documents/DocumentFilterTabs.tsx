"use client";

import { cn } from "@repo/ui";
import { DOC_FILTER_TABS, type DocumentFilter } from "./constants";

interface DocumentFilterTabsProps {
  active: DocumentFilter;
  counts: Record<DocumentFilter, number>;
  onChange: (filter: DocumentFilter) => void;
}

export function DocumentFilterTabs({
  active,
  counts,
  onChange,
}: DocumentFilterTabsProps) {
  return (
    <div className="flex gap-xs overflow-x-auto no-scrollbar mb-md">
      {DOC_FILTER_TABS.map((tab) => {
        const isActive = active === tab.key;
        const count = counts[tab.key] ?? 0;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
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
