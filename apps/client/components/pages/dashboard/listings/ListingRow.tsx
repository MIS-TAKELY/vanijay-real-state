"use client";

import { Checkbox, cn } from "@repo/ui";
import {
  formatNPR,
  labelEnum,
  TYPE_LABELS,
} from "lib/api/services/properties/types";
import type { MyListing } from "./constants";
import { ListingMenu } from "./ListingMenu";
import { ListingStatusChip } from "./ListingStatusChip";
import { VerificationStamp } from "./VerificationStamp";

interface ListingRowProps {
  listing: MyListing;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function ListingRow({ listing, selected, onToggle }: ListingRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[auto_56px_minmax(180px,2fr)_1fr_1fr_auto_1fr_1fr_1fr_1fr_auto] items-center gap-sm px-sm py-3 border-b border-outline-variant last:border-b-0 transition-colors hover:bg-surface-container-high",
        selected && "bg-secondary-container/40",
      )}
    >
      {/* Checkbox */}
      <Checkbox
        aria-label={`Select ${listing.listingCode}`}
        checked={selected}
        onCheckedChange={() => onToggle(listing.id)}
        className="cursor-pointer"
      />

      {/* Cover thumb */}
      <div
        className={cn(
          "h-12 w-12 rounded-lg bg-gradient-to-br",
          listing.gradient,
        )}
        aria-hidden
      />

      {/* Code + title */}
      <div className="flex min-w-0 flex-col">
        <span className="mono-stat text-[12px] text-on-surface-variant">
          {listing.listingCode}
        </span>
        <span className="truncate text-sm font-medium text-on-surface">
          {listing.title}
        </span>
      </div>

      {/* Type chip */}
      <span className="hidden lg:inline-flex items-center rounded bg-surface-container px-2 py-0.5 text-[12px] font-medium text-on-surface-variant whitespace-nowrap">
        {labelEnum(listing.propertyType, TYPE_LABELS)}
      </span>

      {/* Status chip */}
      <span className="hidden md:inline-flex">
        <ListingStatusChip status={listing.status} />
      </span>

      {/* Verification stamp */}
      <span className="hidden lg:inline-flex">
        <VerificationStamp level={listing.verificationLevel} />
      </span>

      {/* Asking price */}
      <span className="mono-stat text-label-sm font-semibold text-primary whitespace-nowrap">
        {formatNPR(listing.askingPrice)}
      </span>

      {/* Views */}
      <span className="mono-stat hidden sm:inline-block text-label-sm text-on-surface tabular-nums">
        {listing.views.toLocaleString()}
      </span>

      {/* Inquiries */}
      <span className="hidden sm:inline-flex">
        {listing.inquiries > 0 ? (
          <span className="mono-stat inline-flex items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-bold leading-none text-on-primary">
            {listing.inquiries}
          </span>
        ) : (
          <span className="mono-stat text-label-sm text-on-surface-variant tabular-nums">
            0
          </span>
        )}
      </span>

      {/* Updated + menu */}
      <span className="mono-stat hidden md:inline-block text-[12px] text-on-surface-variant whitespace-nowrap">
        {listing.updatedAt}
      </span>
      <ListingMenu />
    </div>
  );
}
