"use client";

import {
  Icon,
  PRICE_UNITS,
  formatNPR,
  hasPricingArea,
  isBuildingType,
  pricePerUnitFor,
  priceUnitKey,
  priceUnitRates,
  type PriceContext,
} from "@repo/ui";
import { AddToCartButton } from "components/real-state/common/AddToCartButton";
import { CallSellerButton } from "components/real-state/common/CallSellerButton";
import { SaveToFavoritesButton } from "components/real-state/common/SaveToFavoritesButton";
import { type ApiPropertyLocation } from "lib/api/services/properties/types";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ListingSidebarMap } from "./ListingSidebarMap";

/**
 * Per-unit rate for a listing — building types show the auto-calculated
 * per-sq.ft / per-sq.m rates (same as the listing wizard's review), land
 * types let the buyer pick the unit (defaulting to the unit system's market
 * rate). Everything runs through the shared `PriceContext` conversion
 * (`pricePerUnitFor` + `PRICE_UNITS`), so this always agrees with the
 * listing process.
 */
function PricePerUnit({ pricing }: { pricing: PriceContext }) {
  const isBuilding = isBuildingType(pricing.subCategory);
  const [unit, setUnit] = useState(() => priceUnitKey(pricing));
  const rateLabel = useMemo(() => {
    const rates: Record<string, string> = {};
    for (const [key, rate] of Object.entries(priceUnitRates(pricing))) {
      rates[key] = rate != null ? formatNPR(rate) : "—";
    }
    return rates;
  }, [pricing]);
  const perUnit = useMemo(
    () => pricePerUnitFor(pricing, unit),
    [pricing, unit],
  );

  if (isBuilding) {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-on-surface-variant">
        <span>
          <span className="font-medium">{rateLabel.sqft}</span> / sq.ft
        </span>
        <span>
          <span className="font-medium">{rateLabel.sqm}</span> / sq.m
        </span>
      </div>
    );
  }

  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-on-surface-variant">
      <span>{perUnit != null ? formatNPR(perUnit) : "—"} per</span>
      <select
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        aria-label="Price unit"
        className="h-10 cursor-pointer rounded-md border border-outline-variant bg-surface px-2.5 text-[13px] font-medium text-on-surface outline-none transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {PRICE_UNITS.map((u) => (
          <option key={u.key} value={u.key}>
            {u.label}
          </option>
        ))}
      </select>
    </p>
  );
}

interface ListingDecisionCardProps {
  propertyId: string;
  title: string;
  /** Shared pricing inputs — built from the API property via
   *  `priceContextFromApiProperty` so per-unit rates match the listing wizard. */
  pricing: PriceContext;
  location?: ApiPropertyLocation | null;
  verified: boolean;
}

export function ListingDecisionCard({
  propertyId,
  title,
  pricing,
  location,
  verified,
}: ListingDecisionCardProps) {
  const hasCoordinates =
    location?.latitude != null && location?.longitude != null;

  return (
    <div className="sticky top-24 flex flex-col gap-5 rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm">
      {/* Price */}
      <div>
        <p className="mono-stat text-2xl font-bold text-gold-deep">
          {formatNPR(pricing.askingPrice)}
        </p>
        {hasPricingArea(pricing) && pricing.askingPrice > 0 && (
          <PricePerUnit pricing={pricing} />
        )}
      </div>

      {/* Embedded map — location is the product */}
      {hasCoordinates && (
        <div className="overflow-hidden rounded-lg border border-outline-variant">
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
          className="min-h-11 w-full rounded-md bg-gold font-semibold text-on-gold hover:bg-gold/90"
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

      {/* Verification notice */}
      {!verified && (
        <p className="rounded-md bg-surface-container p-3 text-xs leading-5 text-on-surface-variant">
          This listing has not completed verification yet. Independently confirm
          ownership documents (Lalpurja) before any payment.
        </p>
      )}
    </div>
  );
}
