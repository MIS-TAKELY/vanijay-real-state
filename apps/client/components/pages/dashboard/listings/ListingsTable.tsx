"use client";

import {
  Checkbox,
  cn,
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableRow,
} from "@repo/ui";
import { LISTING_TABLE_COLUMNS } from "./constants";
import type { MyListing } from "./constants";
import { ListingRow } from "./ListingRow";

interface ListingsTableProps {
  listings: MyListing[];
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
}

const HEADER_CELL_CLASS =
  "px-sm py-2.5 font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant rounded-md";

export function ListingsTable({
  listings,
  selectedIds,
  onToggleRow,
  onToggleAll,
}: ListingsTableProps) {
  const allSelected =
    listings.length > 0 && listings.every((l) => selectedIds.has(l.id));
  const someSelected = listings.some((l) => selectedIds.has(l.id));

  return (
    <div className="rounded-b-md border border-outline-variant bg-surface">
      <Table className="min-w-[920px]">
        <TableHeader>
          <TableRow className="bg-surface-container-low">
            <TableHead className={cn(HEADER_CELL_CLASS, "w-10")}>
              <Checkbox
                aria-label="Select all listings"
                checked={someSelected && !allSelected ? "indeterminate" : allSelected}
                onCheckedChange={() => onToggleAll()}
                className="cursor-pointer"
              />
            </TableHead>
            {/* Cover thumb spacer */}
            <TableHead className={cn(HEADER_CELL_CLASS, "w-14")} aria-hidden />
            {LISTING_TABLE_COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                className={cn(HEADER_CELL_CLASS, col.cellClassName)}
              >
                {col.label}
              </TableHead>
            ))}
            {/* Row menu spacer */}
            <TableHead className={cn(HEADER_CELL_CLASS, "w-10")} aria-hidden />
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              selected={selectedIds.has(listing.id)}
              onToggle={onToggleRow}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
