"use client";

import { Button, Icon } from "@repo/ui";

interface ListingsBulkBarProps {
  selectedCount: number;
  onArchive: () => void;
  onReverify: () => void;
  onClear: () => void;
}


export function ListingsBulkBar({
  selectedCount,
  onArchive,
  onReverify,
  onClear,
}: ListingsBulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between rounded-xl border border-primary/30 bg-secondary-container/60 px-md py-sm mb-md">
      <div className="flex items-center gap-sm">
        <span className="mono-stat inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-[12px] font-bold text-on-primary leading-none">
          {selectedCount}
        </span>
        <span className="text-sm font-medium text-on-surface">
          {selectedCount === 1 ? "listing selected" : "listings selected"}
        </span>
      </div>

      <div className="flex items-center gap-xs">
        <Button
          type="button"
          variant="outline"
          onClick={onReverify}
          className="inline-flex items-center gap-1 rounded-md border-outline-variant px-3 py-1.5 text-sm font-medium text-on-surface hover:border-primary hover:text-primary cursor-pointer"
        >
          <Icon name="verified" className="text-data-table" />
          Request re-verification
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onArchive}
          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
        >
          <Icon name="archive" className="text-data-table" />
          Archive
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container cursor-pointer"
          aria-label="Clear selection"
        >
          <Icon name="close" className="text-body-lg" />
        </Button>
      </div>
    </div>
  );
}
