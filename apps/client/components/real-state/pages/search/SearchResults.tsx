"use client";

import { Button, Icon } from "@repo/ui";
import {
  fetchFeedPageGraphql,
  toCardPropsFromItem,
  type PropertyItem,
} from "lib/api/services/properties";
import type { ApiProperty } from "lib/api/services/properties/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PropertyCard } from "../../common/PropertyCard";
import { Pagination } from "../home/Pagination";

function toItem(p: ApiProperty): PropertyItem {
  return { ...p, media: p.media ?? [] } as PropertyItem;
}

/** Active URL filters, used to build the removable chip row. */
export type SearchFiltersState = Record<string, string | null>;

const TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  INDUSTRIAL: "Industrial",
  LAND: "Land",
  INSTITUTIONAL_SPECIALIZED: "Special Purpose",
};

const PRICE_LABELS: Record<string, string> = {
  "under-20l": "Under 20L",
  "20l-50l": "20L – 50L",
  "50l-1cr": "50L – 1Cr",
  "1cr-plus": "1Cr+",
};

const FACING_LABELS: Record<string, string> = {
  NORTH: "North",
  SOUTH: "South",
  EAST: "East",
  WEST: "West",
  NORTH_EAST: "North-East",
  NORTH_WEST: "North-West",
  SOUTH_EAST: "South-East",
  SOUTH_WEST: "South-West",
};

const ROAD_LABELS: Record<string, string> = {
  PITCHED: "Pitched",
  GRAVEL: "Gravel",
  SOIL: "Earthen",
  BLOCK_PAVED: "Block paved",
  FOOTPATH: "Footpath",
};

const FURNISHING_LABELS: Record<string, string> = {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi-furnished",
  FULLY_FURNISHED: "Fully furnished",
};

const CS_LABELS: Record<string, string> = {
  UNDER_CONSTRUCTION: "Under Construction",
  READY_TO_MOVE: "Ready to Move",
  RESALE: "Resale",
  NEWLY_BUILT: "Newly Built",
};

/** Short URL key → display info mapping */
const CHIP_CONFIG: Record<
  string,
  { label: string; format?: (v: string) => string }
> = {
  q: { label: "Search", format: (v) => `"${v}"` },
  type: { label: "Type", format: (v) => TYPE_LABELS[v] ?? v },
  pr: { label: "Price", format: (v) => PRICE_LABELS[v] ?? v },
  dist: { label: "District" },
  minS: { label: "Min size" },
  maxS: { label: "Max size" },
  mun: { label: "Municipality" },
  ward: { label: "Ward" },
  bed: { label: "Bedrooms" },
  bath: { label: "Bathrooms" },
  face: { label: "Facing", format: (v) => FACING_LABELS[v] ?? v },
  road: { label: "Road", format: (v) => ROAD_LABELS[v] ?? v },
  cs: { label: "Status", format: (v) => CS_LABELS[v] ?? v },
  ft: { label: "Furnishing", format: (v) => FURNISHING_LABELS[v] ?? v },
  cp: { label: "Corner plot", format: () => "Yes" },
  ng: { label: "Negotiable", format: () => "Yes" },
  sub: { label: "Sub-type" },
  am: { label: "Amenities", format: (v) => v.split(",").join(", ") },
};

/** A removable filter chip derived from the URL params. */
interface FilterChip {
  key: string;
  label: string;
}

export function getActiveFilterChips(
  filters: SearchFiltersState,
): FilterChip[] {
  const chips: FilterChip[] = [];

  for (const [key, cfg] of Object.entries(CHIP_CONFIG)) {
    const raw = filters[key];
    if (!raw) continue;
    // Skip default values
    if (key === "type" && raw === "all") continue;
    if (key === "pr" && raw === "any") continue;
    if (key === "face" && raw === "any") continue;
    if (key === "road" && raw === "any") continue;
    if (key === "cs" && raw === "any") continue;
    if (key === "ft" && raw === "any") continue;
    if (key === "sub" && raw === "all") continue;

    const display = cfg.format ? cfg.format(raw) : raw;
    chips.push({ key, label: `${cfg.label}: ${display}` });
  }

  return chips;
}

/** `/search` URL with a single param removed — used by chip removal links. */
function chipRemovalHref(filters: SearchFiltersState, key: string): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (k !== key && v) params.set(k, v);
  }
  return params.toString() ? `/search?${params.toString()}` : "/search";
}

interface SearchResultsProps {
  initialItems: ApiProperty[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  initialError: string | null;
  query: string;
  /** Active URL filters (used for the removable chip row). */
  filters?: SearchFiltersState;
}

/**
 * Filtered results grid for the `/search` page. The server renders the first
 * page; this component hydrates from it and drives cursor-based "load more".
 */
export function SearchResults({
  initialItems,
  initialNextCursor,
  initialHasMore,
  initialError,
  query,
  filters = {},
}: SearchResultsProps) {
  const [results, setResults] = useState<ApiProperty[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor,
  );
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const chips = getActiveFilterChips(filters);

  // Reset when the server hands us a new first page (URL params changed).
  useEffect(() => {
    setResults(initialItems);
    setNextCursor(initialNextCursor);
    setHasMore(initialHasMore);
    setLoadingMore(false);
  }, [initialItems, initialNextCursor, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const sp = new URLSearchParams(window.location.search);
      const data = await fetchFeedPageGraphql({
        first: 12,
        after: nextCursor,
        q: sp.get("q"),
        type: sp.get("type"),
        price: sp.get("pr"),
        district: sp.get("dist"),
        minSize: sp.get("minS"),
        maxSize: sp.get("maxS"),
        municipality: sp.get("mun"),
        ward: sp.get("ward"),
        facing: sp.get("face"),
        roadType: sp.get("road"),
        bedrooms: sp.get("bed"),
        bathrooms: sp.get("bath"),
        isCornerPlot: sp.get("cp") === "true" ? true : undefined,
        isNegotiable: sp.get("ng") === "true" ? true : undefined,
        constructionStatus: sp.get("cs"),
        furnishing: sp.get("ft"),
        subCategory: sp.get("sub"),
        amenities: sp.get("am")?.split(",") ?? undefined,
      });
      setResults((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      // Keep the current results; the button stays available for a retry.
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor]);

  return (
    <section className="relative z-10 py-6 md:py-10">
      <div className="mx-auto max-w-container-max px-gutter">
        {initialError && (
          <p
            role="alert"
            className="mb-6 rounded-md border border-outline-variant bg-surface-container p-4 text-sm text-on-surface-variant"
          >
            {initialError}
          </p>
        )}

        {results.length === 0 && !initialError ? (
          <div className="blueprint-grid rounded-2xl border border-outline-variant bg-surface px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-gold/40 bg-navy text-gold shadow-sm">
              <Icon name="search" className="text-[24px]" />
            </div>
            <p className="mx-auto mb-2 flex w-fit items-center gap-2.5 font-label-sm text-[11px] uppercase tracking-[0.18em] text-gold-deep font-bold">
              <span className="h-px w-6 bg-gold" aria-hidden />
              No matches
            </p>
            <p className="font-headline-md text-xl font-semibold text-navy">
              No properties match your search
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">
              Try adjusting your keywords, price range, or location filters — or
              browse every verified listing in the archive.
            </p>
            {chips.length > 0 && (
              <div className="mt-6">
                <Button
                  asChild
                  className="rounded-md bg-gold font-semibold text-on-gold hover:bg-gold/90"
                >
                  <Link href="/search">Browse all properties</Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-end justify-between">
              <p className="flex items-center gap-2.5 font-label-sm text-[11px] uppercase tracking-[0.18em] text-gold-deep font-bold">
                <span className="h-px w-7 bg-gold" aria-hidden />
                <span>
                  {results.length} verified listing{results.length === 1 ? "" : "s"}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={toCardPropsFromItem(toItem(p))}
                />
              ))}
            </div>
            <Pagination
              hasMore={hasMore}
              loading={loadingMore}
              onLoadMore={loadMore}
            />
          </>
        )}
      </div>
    </section>
  );
}
