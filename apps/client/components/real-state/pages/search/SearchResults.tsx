"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Icon } from "@repo/ui";
import Link from "next/link";
import { PropertyCard } from "../../common/PropertyCard";
import {
  fetchFeedPageGraphql,
  toCardPropsFromItem,
  type PropertyItem,
} from "lib/api/services/properties";
import type { ApiProperty } from "lib/api/services/properties/types";
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
        {/* Header — headline + ledger-style result count */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-label-sm mb-1 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
              Search results
            </p>
            <h1 className="font-headline-md text-headline-md text-primary">
              {query.trim()
                ? `Properties matching “${query.trim()}”`
                : "Browse all properties"}
            </h1>
          </div>
          {results.length > 0 && (
            <p className="mono-stat text-sm text-on-surface-variant">
              <span className="font-semibold text-on-surface">
                {results.length}
              </span>{" "}
              {results.length === 1 ? "property" : "properties"}
            </p>
          )}
        </div>

        {/* Active filters — removable chips */}
        {chips.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <Link
                key={chip.key}
                href={chipRemovalHref(filters, chip.key)}
                scroll={false}
                aria-label={`Remove filter ${chip.label}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:border-primary/50 hover:text-primary"
              >
                {chip.label}
                <Icon
                  name="close"
                  className="text-[14px] opacity-60 transition-opacity group-hover:opacity-100"
                />
              </Link>
            ))}
            <Link
              href="/search"
              scroll={false}
              className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
              Clear all
            </Link>
          </div>
        )}

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
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-surface-container">
              <Icon name="search" className="text-[24px] text-on-surface-variant" />
            </div>
            <p className="font-headline-md text-xl font-semibold text-on-surface">
              No properties match your search
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">
              Try adjusting your keywords, price range, or location filters —
              or browse every verified listing in the archive.
            </p>
            {chips.length > 0 && (
              <div className="mt-6">
                <Button asChild className="rounded-md bg-primary font-semibold">
                  <Link href="/search">Browse all properties</Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
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
