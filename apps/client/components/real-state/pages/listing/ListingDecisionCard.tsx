"use client";

import { Icon } from "@repo/ui";
import { AddToCartButton } from "components/real-state/common/AddToCartButton";
import { CallSellerButton } from "components/real-state/common/CallSellerButton";
import { SaveToFavoritesButton } from "components/real-state/common/SaveToFavoritesButton";
import {
  formatNPR,
  type ApiPropertyLocation,
} from "lib/api/services/properties/types";
import Link from "next/link";
import { useState } from "react";
import { ListingSidebarMap } from "./ListingSidebarMap";

/** Land area units + sq ft per unit (matches the wizard's conversions). */
const LAND_UNITS: Array<{ key: string; label: string; sqFt: number }> = [
  { key: "aana", label: "Aana", sqFt: 342.25 },
  { key: "ropani", label: "Ropani", sqFt: 342.25 * 16 },
  { key: "paisa", label: "Paisa", sqFt: 342.25 / 4 },
  { key: "daam", label: "Daam", sqFt: 342.25 / 16 },
  { key: "bigha", label: "Bigha", sqFt: 364.5 * 20 },
  { key: "katha", label: "Katha", sqFt: 364.5 },
  { key: "dhur", label: "Dhur", sqFt: 364.5 / 20 },
  { key: "sqft", label: "sq.ft", sqFt: 1 },
  { key: "sqm", label: "sq.m", sqFt: 10.7639 },
];

/** Per-unit rate for a land listing — buyer picks the unit (defaults to Dhur). */
function PricePerUnitSelect({
  price,
  totalSqFt,
}: {
  price: number;
  totalSqFt: number;
}) {
  const [unit, setUnit] = useState("dhur");
  const current = LAND_UNITS.find((u) => u.key === unit) ?? LAND_UNITS[0]!;
  const perUnit = Math.round((price * current.sqFt) / totalSqFt);
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-on-surface-variant">
      <span>{formatNPR(perUnit)} per</span>
      <select
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        aria-label="Price unit"
        className="h-10 cursor-pointer rounded-md border border-outline-variant bg-surface px-2.5 text-[13px] font-medium text-on-surface outline-none transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {LAND_UNITS.map((u) => (
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
  askingPrice: string;
  /** Numeric asking price — used to compute the per-unit rate. */
  price: number;
  /** Land listings show the per-unit selector (buildings are priced per sq.ft). */
  isLand: boolean;
  landTotalSqFt?: number | null;
  location?: ApiPropertyLocation | null;
  verified: boolean;
}

export function ListingDecisionCard({
  propertyId,
  title,
  askingPrice,
  price,
  isLand,
  landTotalSqFt,
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
          {askingPrice}
        </p>
        {isLand && landTotalSqFt != null && landTotalSqFt > 0 && (
          <PricePerUnitSelect price={price} totalSqFt={landTotalSqFt} />
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
