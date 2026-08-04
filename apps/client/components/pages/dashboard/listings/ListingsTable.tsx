"use client";

import { cn } from "@repo/ui";
import type { MyListing } from "./constants";
import { ListingRow } from "./ListingRow";

interface ListingsTableProps {
  listings: MyListing[];
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
}

const COLUMN_HEADERS = [
  "Listing",
  "Type",
  "Status",
  "Verified",
  "Asking Price",
  "Views",
  "Inquiries",
  "Updated",
] as const;

export function ListingsTable({
  listings,
  selectedIds,
  onToggleRow,
  onToggleAll,
}: ListingsTableProps) {
  const allSelected = listings.length > 0 && listings.every((l) => selectedIds.has(l.id));
  const someSelected = listings.some((l) => selectedIds.has(l.id));

  return (
    <div className="overflow-x-auto rounded-2xl border border-outline-variant bg-surface">
      <div className="min-w-[920px]">
        {/* Header */}
        <div className="grid grid-cols-[auto_56px_minmax(180px,2fr)_1fr_1fr_auto_1fr_1fr_1fr_1fr_auto] items-center gap-sm border-b border-outline-variant bg-surface-container-low px-sm py-2.5">
          <input
            type="checkbox"
            aria-label="Select all listings"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected;
            }}
            onChange={onToggleAll}
            className="h-4 w-4 cursor-pointer accent-primary"
          />
          <span />
          {COLUMN_HEADERS.map((h, i) => (
            <span
              key={h}
              className={cn(
                "font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant",
                // hide responsive columns to match row visibility
                i === 0 && "",
                h === "Type" && "hidden lg:block",
                h === "Status" && "hidden md:block",
                h === "Verified" && "hidden lg:block",
                h === "Views" && "hidden sm:block",
                h === "Inquiries" && "hidden sm:block",
                h === "Updated" && "hidden md:block",
              )}
            >
              {h}
            </span>
          ))}
          <span />
        </div>

        {/* Rows */}
        <div>
          {listings.map((listing) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              selected={selectedIds.has(listing.id)}
              onToggle={onToggleRow}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
