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
import { cn } from "@repo/ui/lib/utils";
import { AddToCartButton } from "components/real-state/common/AddToCartButton";
import { CallSellerButton } from "components/real-state/common/CallSellerButton";
import { SaveToFavoritesButton } from "components/real-state/common/SaveToFavoritesButton";
import { type ApiPropertyLocation } from "lib/api/services/properties/types";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ListingSidebarMap } from "./ListingSidebarMap";

/** Price-per-unit options: a special "Total" entry (the full asking price)
 *  followed by every per-unit rate from PRICE_UNITS. */
const PRICE_DISPLAY_OPTIONS = [
  { key: "total", label: "Total" },
  ...PRICE_UNITS.map((u) => ({ key: u.key, label: u.label })),
];

function PricePerUnit({ pricing }: { pricing: PriceContext }) {
  const [unit, setUnit] = useState(() => priceUnitKey(pricing));
  const isTotal = unit === "total";
  const perUnit = useMemo(
    () => (isTotal ? null : pricePerUnitFor(pricing, unit)),
    [pricing, unit, isTotal],
  );

  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5">
      <span className="mono-stat text-base font-bold text-gold-deep sm:text-lg">
        {isTotal
          ? formatNPR(pricing.askingPrice)
          : perUnit != null
            ? formatNPR(perUnit)
            : "—"}
      </span>
      {!isTotal && (
        <span className="text-[11px] font-medium text-on-surface-variant">
          per
        </span>
      )}
      <span className="relative inline-flex items-center">
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          aria-label="Price unit"
          className="h-6 max-w-full cursor-pointer appearance-none border-0 bg-transparent py-0 pr-4 pl-0 text-xs font-medium text-on-surface shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md"
        >
          {PRICE_DISPLAY_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon
          name="expand_more"
          className="pointer-events-none absolute right-0 text-[13px] text-on-surface-variant"
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
  /** When false, the embedded map is omitted (e.g. it lives in a separate
   *  location card in the sticky gallery column). Defaults to false. */
  showMap?: boolean;
  className?: string;
}

export function ListingDecisionCard({
  propertyId,
  title,
  pricing,
  location,
  showMap = false,
  className,
}: ListingDecisionCardProps) {
  const hasCoordinates =
    location?.latitude != null && location?.longitude != null;
  const isBuilding = isBuildingType(pricing.subCategory);

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-sm border border-outline-variant bg-surface p-4 shadow-xs",
        className,
      )}
    >
      {/* Price */}
      <div className="min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
          Asking Price
        </span>
        {!isBuilding && hasPricingArea(pricing) && pricing.askingPrice > 0 ? (
          <div className="mt-0.5">
            <PricePerUnit pricing={pricing} />
          </div>
        ) : (
          <p className="mono-stat mt-0.5 break-words text-lg font-bold leading-tight text-gold-deep sm:text-xl">
            {formatNPR(pricing.askingPrice)}
          </p>
        )}
      </div>

      {/* Embedded map — when showMap is explicitly set to true */}
      {showMap && hasCoordinates && (
        <div className="my-2 overflow-hidden rounded-sm border border-outline-variant">
          <ListingSidebarMap
            latitude={location!.latitude!}
            longitude={location!.longitude!}
            title={title}
          />
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${location!.latitude},${location!.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-9 items-center justify-center gap-1.5 border-t border-outline-variant bg-surface-container px-2 py-1 text-[11px] font-semibold text-on-surface transition-[background-color,color] duration-150 hover:bg-navy hover:text-white"
          >
            <Icon name="map" className="shrink-0 text-[13px]" />
            <span className="truncate">Open in Google Maps</span>
            <Icon
              name="open_in_new"
              className="shrink-0 text-[11px]"
            />
          </Link>
        </div>
      )}

      {/* CTAs */}
      <div className="mt-2 flex flex-col gap-1.5">
        <CallSellerButton
          propertyId={propertyId}
          variant="default"
          className="min-h-9 h-9 w-full rounded-sm bg-gold px-2 text-xs font-semibold text-on-gold shadow-xs hover:bg-gold/90"
        />
        <div className="flex min-w-0 gap-1.5">
          <AddToCartButton
            propertyId={propertyId}
            title={title}
            variant="outline"
            className="min-h-8 h-8 flex-1 min-w-0 rounded-sm border-outline-variant px-2 text-xs font-semibold"
          />
          <SaveToFavoritesButton
            propertyId={propertyId}
            variant="outline"
            compact
            className="min-h-8 h-8 flex-1 min-w-0 rounded-sm border-outline-variant px-2 text-xs font-semibold"
          />
        </div>
      </div>
    </div>
  );
}
