"use client";

import { Icon } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import type { ApiPropertyLocation } from "lib/api/services/properties/types";
import Link from "next/link";
import { ListingSidebarMap } from "./ListingSidebarMap";

interface ListingLocationCardProps {
  location?: ApiPropertyLocation | null;
  title: string;
  /** Compact flag (e.g. inside the sticky gallery column) — tighter padding. */
  compact?: boolean;
  /** Fixed height for the map preview in px. Defaults to 105. */
  mapHeight?: number;
  className?: string;
}

/**
 * Location card shown beside the price/CTA card below the gallery.
 * Renders a compact interactive map preview, the formatted address, and
 * a Google Maps link.
 */
export function ListingLocationCard({
  location,
  title,
  compact = true,
  mapHeight = 105,
  className,
}: ListingLocationCardProps) {
  if (!location) return null;

  const hasCoords =
    location.latitude != null && location.longitude != null;

  const addressParts = [
    location.areaName,
    location.municipality,
    location.district,
  ].filter(Boolean);
  const address =
    addressParts.length > 0
      ? `${addressParts.join(", ")}${
          location.wardNumber ? `, Ward ${location.wardNumber}` : ""
        }`
      : location.addressText ?? null;

  return (
    <section
      className={cn(
        "flex h-full flex-col justify-between rounded-sm border border-outline-variant bg-surface p-4 shadow-xs",
        className,
      )}
      aria-label="Property location"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-navy">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
              aria-hidden="true"
            />
            Location
          </h2>
          {hasCoords && (
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-gold-deep transition-colors hover:underline"
            >
              <span>Google Maps</span>
              <Icon name="open_in_new" className="text-[11px]" aria-hidden />
            </Link>
          )}
        </div>

        {hasCoords ? (
          <div
            className="relative w-full overflow-hidden rounded-sm border border-outline-variant isolate [contain:paint]"
            style={{ height: mapHeight }}
          >
            <ListingSidebarMap
              latitude={location.latitude!}
              longitude={location.longitude!}
              title={title}
              height={mapHeight}
            />
          </div>
        ) : location.addressText ? (
          <p className="text-xs text-on-surface-variant line-clamp-3">
            {location.addressText}
          </p>
        ) : null}

        {address && (
          <p className="flex items-center gap-1.5 text-[11px] leading-tight text-on-surface-variant">
            <Icon
              name="location_on"
              className="shrink-0 text-[12px] text-on-surface-variant/80"
              aria-hidden
            />
            <span className="truncate">{address}</span>
          </p>
        )}
      </div>
    </section>
  );
}
