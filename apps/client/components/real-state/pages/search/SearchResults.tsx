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
  residential: "Residential",
  commercial: "Commercial",
  plot: "Plot / Land",
  house: "House",
};

const PRICE_LABELS: Record<string, string> = {
  "under-20l": "Under 20L",
  "20l-50l": "20L – 50L",
  "50l-1cr": "50L – 1Cr",
  "1cr-plus": "1Cr+",
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
  const add = (key: string, label: string) => {
    if (label) chips.push({ key, label });
  };

  if (filters.q) add("q", `“${filters.q}”`);
  if (filters.type && filters.type !== "all")
    add("type", TYPE_LABELS[filters.type] ?? filters.type);
  if (filters.price && filters.price !== "any")
    add("price", PRICE_LABELS[filters.price] ?? filters.price);
  if (filters.district) add("district", filters.district);
  if (filters.minSize) add("minSize", `Min size ${filters.minSize}`);
  if (filters.maxSize) add("maxSize", `Max size ${filters.maxSize}`);
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
      const data = await fetchFeedPageGraphql({
        first: 12,
        after: nextCursor,
        q: new URLSearchParams(window.location.search).get("q"),
        type: new URLSearchParams(window.location.search).get("type"),
        price: new URLSearchParams(window.location.search).get("price"),
        district: new URLSearchParams(window.location.search).get("district"),
        minSize: new URLSearchParams(window.location.search).get("minSize"),
        maxSize: new URLSearchParams(window.location.search).get("maxSize"),
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
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
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
