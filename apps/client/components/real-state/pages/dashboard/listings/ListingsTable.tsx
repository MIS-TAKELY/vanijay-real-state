"use client";

import {
  Checkbox,
  cn,
  Icon,
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableRow,
} from "@repo/ui";
import Image from "next/image";
import Link from "next/link";
import { LISTING_TABLE_COLUMNS } from "./constants";
import type { MyListing } from "./constants";
import { ListingRow } from "./ListingRow";
import { ListingMenu } from "./ListingMenu";
import { ListingStatusChip } from "./ListingStatusChip";
import { formatNPR, labelEnum, TYPE_LABELS } from "lib/api/services/properties/types";

interface ListingsTableProps {
  listings: MyListing[];
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  /** Reload the list after a row action (mark sold / archive / duplicate). */
  onChanged: () => void;
}

const HEADER_CELL_CLASS =
  "px-sm py-2.5 font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant rounded-md";

/** Mobile card for a single listing — shown on screens < md. */
function ListingMobileCard({
  listing,
  selected,
  onToggle,
  onChanged,
}: {
  listing: MyListing;
  selected: boolean;
  onToggle: (id: string) => void;
  onChanged: () => void;
}) {
  const publicHref = listing.status === "LIVE" ? `/${listing.slug}` : null;

  const thumbContent = listing.thumbnailUrl ? (
    <Image
      src={listing.thumbnailUrl}
      alt=""
      fill
      sizes="80px"
      className="object-cover"
    />
  ) : (
    <div className={cn("h-full w-full bg-gradient-to-br", listing.gradient)} />
  );

  return (
    <div className="flex items-start gap-sm border-b border-outline-variant px-sm py-3 last:border-b-0">
      <Checkbox
        aria-label={`Select ${listing.listingCode}`}
        checked={selected}
        onCheckedChange={() => onToggle(listing.id)}
        className="mt-1 cursor-pointer shrink-0"
      />
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br">
        {publicHref ? (
          <Link href={publicHref} className="block h-full w-full">
            {thumbContent}
          </Link>
        ) : (
          thumbContent
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="mono-stat text-[11px] text-on-surface-variant">
            {listing.listingCode}
          </span>
          <ListingStatusChip status={listing.status} />
        </div>
        {publicHref ? (
          <Link
            href={publicHref}
            className="truncate text-sm font-medium text-on-surface hover:text-primary"
          >
            {listing.title}
          </Link>
        ) : (
          <span className="truncate text-sm font-medium text-on-surface">
            {listing.title}
          </span>
        )}
        <div className="flex items-center gap-2">
          <span className="mono-stat text-sm font-semibold text-gold-deep">
            {formatNPR(listing.askingPrice)}
          </span>
          <span className="text-[11px] text-on-surface-variant">
            {labelEnum(listing.subCategory, TYPE_LABELS)}
          </span>
        </div>
      </div>
      <ListingMenu listing={listing} onChanged={onChanged} />
    </div>
  );
}

export function ListingsTable({
  listings,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onChanged,
}: ListingsTableProps) {
  const allSelected =
    listings.length > 0 && listings.every((l) => selectedIds.has(l.id));
  const someSelected = listings.some((l) => selectedIds.has(l.id));

  return (
    <div className="rounded-b-md border border-outline-variant bg-surface">
      {/* Mobile card view — visible < md */}
      <div className="md:hidden">
        {listings.map((listing) => (
          <ListingMobileCard
            key={listing.id}
            listing={listing}
            selected={selectedIds.has(listing.id)}
            onToggle={onToggleRow}
            onChanged={onChanged}
          />
        ))}
      </div>

      {/* Desktop table — visible md+ */}
      <Table className="hidden md:table min-w-[920px]">
        <TableHeader>
          <TableRow className="bg-surface-container-low">
            <TableHead className={cn(HEADER_CELL_CLASS, "w-10")}>
              <Checkbox
                aria-label="Select all listings"
                checked={
                  someSelected && !allSelected ? "indeterminate" : allSelected
                }
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
              onChanged={onChanged}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
