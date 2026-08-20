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
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      <span className="mono-stat text-2xl font-bold text-navy">
        {perUnit != null ? formatNPR(perUnit) : "—"}
      </span>
      <span className="text-sm font-medium text-on-surface-variant">per</span>
      <span className="relative inline-flex min-h-11 items-center">
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          aria-label="Price unit"
          className="h-11 cursor-pointer appearance-none border-0 bg-transparent py-0 pr-6 pl-0 text-sm font-medium text-on-surface shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md"
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
    <div className="sticky top-24 flex flex-col gap-5 rounded-lg border border-outline-variant bg-surface p-6 shadow-sm">
      {/* Price */}
      <div>
        {!isBuilding && hasPricingArea(pricing) && pricing.askingPrice > 0 ? (
          <>
            <PricePerUnit pricing={pricing} />
            <p className="mt-1 text-sm text-on-surface-variant">
              {formatNPR(pricing.askingPrice)}
            </p>
          </>
        ) : (
          <p className="mono-stat text-2xl font-bold text-navy">
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
            className="flex min-h-11 items-center justify-center gap-1.5 border-t border-outline-variant bg-surface-container py-2 text-xs font-semibold text-on-surface transition-[background-color,color] duration-150 hover:bg-navy hover:text-white"
          >
            <Icon name="map" className="text-[14px]" />
            Open in Google Maps
            <Icon name="open_in_new" className="text-[12px]" />
          </Link>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-2">
        <CallSellerButton
          propertyId={propertyId}
          variant="default"
          className="min-h-11 w-full rounded-md bg-navy font-semibold text-white hover:bg-navy-deep hover:text-white"
        />
        <div className="flex gap-2">
          <AddToCartButton
            propertyId={propertyId}
            title={title}
            variant="outline"
            className="min-h-11 w-[40%] rounded-md border-outline-variant font-semibold"
          />
          <SaveToFavoritesButton
            propertyId={propertyId}
            variant="outline"
            className="min-h-11 w-[57%] rounded-md border-outline-variant font-semibold"
          />
        </div>
      </div>
    </div>
  );
}
