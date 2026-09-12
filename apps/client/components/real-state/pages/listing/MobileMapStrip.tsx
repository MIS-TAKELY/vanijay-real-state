"use client";

import { Icon } from "@repo/ui";
import Link from "next/link";
import { ListingSidebarMap } from "./ListingSidebarMap";

interface MobileMapStripProps {
  latitude: number;
  longitude: number;
  title: string;
  /** Human-readable location label shown on the pill overlay. */
  locationLabel?: string | null;
}

/**
 * Mobile-only compact map strip rendered between the gallery and the listing
 * title. It shows a slim (~88 px) interactive satellite map with a frosted-
 * glass pill that shows the location name and links to Google Maps.
 *
 * Hidden on sm+ — the desktop sidebar already has a full ListingLocationCard.
 */
export function MobileMapStrip({
  latitude,
  longitude,
  title,
  locationLabel,
}: MobileMapStripProps) {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="relative overflow-hidden rounded-sm sm:hidden" style={{ height: 88 }}>
      {/* Interactive map */}
      <div className="absolute inset-0 z-0">
        <ListingSidebarMap
          latitude={latitude}
          longitude={longitude}
          title={title}
          height={88}
        />
      </div>

      {/* Bottom frosted-glass pill — location label + open maps CTA */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 px-2.5 pb-2">
        {locationLabel && (
          <span className="inline-flex max-w-[65%] items-center gap-1 truncate rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <Icon
              name="location_on"
              className="shrink-0 text-[13px] text-gold"
              aria-hidden
            />
            <span className="truncate">{locationLabel}</span>
          </span>
        )}

        <Link
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in Google Maps"
          className="pointer-events-auto ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-navy shadow-sm backdrop-blur-md transition-opacity active:opacity-70"
        >
          <Icon name="open_in_new" className="text-[12px]" aria-hidden />
          Maps
        </Link>
      </div>
    </div>
  );
}
