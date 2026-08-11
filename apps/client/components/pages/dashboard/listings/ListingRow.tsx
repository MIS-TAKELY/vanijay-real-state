"use client";

import { Checkbox, cn, TableCell, TableRow } from "@repo/ui";
import {
  formatNPR,
  labelEnum,
  TYPE_LABELS,
} from "lib/api/services/properties/types";
import Image from "next/image";
import Link from "next/link";
import type { MyListing } from "./constants";
import { LISTING_TABLE_COLUMNS } from "./constants";
import { ListingMenu } from "./ListingMenu";
import { ListingStatusChip } from "./ListingStatusChip";
import { VerificationStamp } from "./VerificationStamp";

interface ListingRowProps {
  listing: MyListing;
  selected: boolean;
  onToggle: (id: string) => void;
  /** Reload the list after a row action (mark sold / archive / duplicate). */
  onChanged: () => void;
}

const CELL_CLASS = "px-sm py-3";

/** Shared responsive visibility class for a column (kept in sync with the header). */
function columnClassName(key: string): string | undefined {
  return LISTING_TABLE_COLUMNS.find((col) => col.key === key)?.cellClassName;
}

export function ListingRow({
  listing,
  selected,
  onToggle,
  onChanged,
}: ListingRowProps) {
  const publicHref =
    listing.status === "LIVE" ? `/listings/${listing.slug}` : null;

  const thumbContent = listing.thumbnailUrl ? (
    <Image
      src={listing.thumbnailUrl}
      alt=""
      fill
      sizes="48px"
      className="object-cover"
    />
  ) : (
    <div className={cn("h-full w-full bg-gradient-to-br", listing.gradient)} />
  );

  return (
    <TableRow className={cn(selected && "bg-secondary-container/40")}>
      {/* Checkbox */}
      <TableCell className={CELL_CLASS}>
        <Checkbox
          aria-label={`Select ${listing.listingCode}`}
          checked={selected}
          onCheckedChange={() => onToggle(listing.id)}
          className="cursor-pointer"
        />
      </TableCell>

      {/* Cover thumb */}
      <TableCell className={CELL_CLASS} aria-hidden>
        {publicHref ? (
          <Link
            href={publicHref}
            className="block relative h-12 w-12 overflow-hidden rounded-lg bg-gradient-to-br"
          >
            {thumbContent}
          </Link>
        ) : (
          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gradient-to-br">
            {thumbContent}
          </div>
        )}
      </TableCell>

      {/* Code + title */}
      <TableCell className={cn(CELL_CLASS, "min-w-[200px]")}>
        <div className="flex min-w-0 flex-col">
          <span className="mono-stat text-[12px] text-on-surface-variant">
            {listing.listingCode}
          </span>
          {publicHref ? (
            <Link
              href={publicHref}
              className="truncate max-w-[280px] text-sm font-medium text-on-surface hover:text-primary hover:underline"
            >
              {listing.title}
            </Link>
          ) : (
            <span className="truncate max-w-[280px] text-sm font-medium text-on-surface">
              {listing.title}
            </span>
          )}
        </div>
      </TableCell>

      {/* Type chip */}
      <TableCell className={cn(CELL_CLASS, columnClassName("type"))}>
        <span className="inline-flex items-center rounded bg-surface-container px-2 py-0.5 text-[12px] font-medium whitespace-nowrap text-on-surface-variant">
          {labelEnum(listing.propertyType, TYPE_LABELS)}
        </span>
      </TableCell>

      {/* Status chip */}
      <TableCell className={cn(CELL_CLASS, columnClassName("status"))}>
        <ListingStatusChip status={listing.status} />
      </TableCell>

      {/* Verification stamp */}
      <TableCell className={cn(CELL_CLASS, columnClassName("verified"))}>
        <VerificationStamp level={listing.verificationLevel} />
      </TableCell>

      {/* Asking price */}
      <TableCell className={CELL_CLASS}>
        <span className="mono-stat text-label-sm font-semibold whitespace-nowrap text-primary">
          {formatNPR(listing.askingPrice)}
        </span>
      </TableCell>

      {/* Views */}
      <TableCell className={cn(CELL_CLASS, columnClassName("views"))}>
        <span className="mono-stat text-label-sm tabular-nums text-on-surface">
          {listing.views.toLocaleString()}
        </span>
      </TableCell>

      {/* Inquiries */}
      <TableCell className={cn(CELL_CLASS, columnClassName("inquiries"))}>
        {listing.inquiries > 0 ? (
          <span className="mono-stat inline-flex items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-bold leading-none text-on-primary">
            {listing.inquiries}
          </span>
        ) : (
          <span className="mono-stat text-label-sm tabular-nums text-on-surface-variant">
            0
          </span>
        )}
      </TableCell>

      {/* Updated */}
      <TableCell className={cn(CELL_CLASS, columnClassName("updated"))}>
        <span className="mono-stat text-[12px] whitespace-nowrap text-on-surface-variant">
          {listing.updatedAt}
        </span>
      </TableCell>

      {/* Row menu */}
      <TableCell className={CELL_CLASS}>
        <ListingMenu listing={listing} onChanged={onChanged} />
      </TableCell>
    </TableRow>
  );
}
