"use client";

import {
  Icon,
  PRICE_UNITS,
  formatNPR,
  hasPricingArea,
  isBuildingType,
  pricePerUnitFor,
  priceUnitKey,
  type PriceContext,
} from "@repo/ui";
import { AddToCartButton } from "components/real-state/common/AddToCartButton";
import { CallSellerButton } from "components/real-state/common/CallSellerButton";
import { SaveToFavoritesButton } from "components/real-state/common/SaveToFavoritesButton";
import { type ApiPropertyLocation } from "lib/api/services/properties/types";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ListingSidebarMap } from "./ListingSidebarMap";

function PricePerUnit({ pricing }: { pricing: PriceContext }) {
  const [unit, setUnit] = useState(() => priceUnitKey(pricing));
  const perUnit = useMemo(
    () => pricePerUnitFor(pricing, unit),
    [pricing, unit],
  );

  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      <span className="mono-stat text-lg font-bold text-gold-deep sm:text-xl lg:text-2xl">
        {perUnit != null ? formatNPR(perUnit) : "—"}
      </span>
      <span className="text-xs font-medium text-on-surface-variant sm:text-sm">
        per
      </span>
      <span className="relative inline-flex min-h-11 items-center">
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          aria-label="Price unit"
          className="h-11 max-w-full cursor-pointer appearance-none border-0 bg-transparent py-0 pr-6 pl-0 text-xs font-medium text-on-surface shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md sm:text-sm"
        >
          {PRICE_UNITS.map((u) => (
            <option key={u.key} value={u.key}>
              {u.label}
            </option>
          ))}
        </select>
        <Icon
          name="expand_more"
          className="pointer-events-none absolute right-0 text-[16px] text-on-surface-variant"
          aria-hidden
        />
      </span>
    </div>
  );
}

interface ListingDecisionCardProps {
  propertyId: string;
  title: string;
  pricing: PriceContext;
  location?: ApiPropertyLocation | null;
}

export function ListingDecisionCard({
  propertyId,
  title,
  pricing,
  location,
}: ListingDecisionCardProps) {
  const hasCoordinates =
    location?.latitude != null && location?.longitude != null;
  const isBuilding = isBuildingType(pricing.subCategory);

  return (
    <div className="sticky top-24 flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface p-3 shadow-sm sm:gap-4 sm:p-4 lg:gap-5 lg:p-6">
      {/* Price */}
      <div className="min-w-0">
        {!isBuilding && hasPricingArea(pricing) && pricing.askingPrice > 0 ? (
          <>
            <PricePerUnit pricing={pricing} />
            <p className="mt-1 truncate text-xs text-on-surface-variant sm:text-sm">
              {formatNPR(pricing.askingPrice)}
            </p>
          </>
        ) : (
          <p className="mono-stat break-words text-lg font-bold leading-tight text-gold-deep sm:text-xl lg:text-2xl">
            {formatNPR(pricing.askingPrice)}
          </p>
        )}
      </div>

      {/* Embedded map — location is the product */}
      {hasCoordinates && (
        <div className="overflow-hidden rounded-xl border border-outline-variant">
          <ListingSidebarMap
            latitude={location!.latitude!}
            longitude={location!.longitude!}
            title={title}
          />
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${location!.latitude},${location!.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center gap-1.5 border-t border-outline-variant bg-surface-container px-2 py-2 text-[11px] font-semibold text-on-surface transition-[background-color,color] duration-150 hover:bg-navy hover:text-white sm:text-xs"
          >
            <Icon name="map" className="shrink-0 text-[14px]" />
            <span className="truncate">
              <span className="sm:hidden">Maps</span>
              <span className="hidden sm:inline">Open in Google Maps</span>
            </span>
            <Icon
              name="open_in_new"
              className="hidden shrink-0 text-[12px] sm:inline"
            />
          </Link>
        </div>
      )}

      {/* CTAs — icon-only secondary actions while the card column is narrow */}
      <div className="flex flex-col gap-2">
        <CallSellerButton
          propertyId={propertyId}
          variant="default"
          className="min-h-11 w-full rounded-md bg-gold px-2 text-sm font-semibold text-on-gold hover:bg-gold/90"
        />
        <div className="flex gap-2">
          <AddToCartButton
            propertyId={propertyId}
            title={title}
            variant="outline"
            iconOnly
            className="min-h-11 min-w-11 shrink-0 rounded-md border border-outline-variant sm:hidden"
          />
          <SaveToFavoritesButton
            propertyId={propertyId}
            variant="outline"
            iconOnly
            className="min-h-11 min-w-11 flex-1 rounded-md border border-outline-variant sm:hidden"
          />
          <AddToCartButton
            propertyId={propertyId}
            title={title}
            variant="outline"
            className="hidden min-h-11 w-[38%] shrink-0 rounded-md border-outline-variant font-semibold sm:inline-flex"
          />
          <SaveToFavoritesButton
            propertyId={propertyId}
            variant="outline"
            className="hidden min-h-11 flex-1 rounded-md border-outline-variant font-semibold sm:inline-flex"
          />
        </div>
      </div>
    </div>
  );
}
