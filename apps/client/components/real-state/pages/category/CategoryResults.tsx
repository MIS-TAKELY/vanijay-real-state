"use client";

import { Button, Icon } from "@repo/ui";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchFeedPageGraphql,
  toCardPropsFromItem,
  type PropertyItem,
} from "lib/api/services/properties";
import type { FeedPage } from "lib/api/services/properties/types";
import type { CategoryEntry } from "constants/category-catalog";
import { PropertyCard } from "../../common/PropertyCard";
import { Pagination } from "../home/Pagination";

function toItem(p: FeedPage["items"][number]): PropertyItem {
  return { ...p, media: p.media ?? [] } as PropertyItem;
}

interface CategoryResultsProps {
  category: CategoryEntry;
  activeTypeKey?: string;
  activeSubTypeLabel?: string;
  queryType: string;
  initialItems: FeedPage["items"];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  initialError: string | null;
}


export function CategoryResults({
  category,
  activeTypeKey,
  activeSubTypeLabel,
  queryType,
  initialItems,
  initialNextCursor,
  initialHasMore,
  initialError,
}: CategoryResultsProps) {
  const [results, setResults] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor,
  );
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  useEffect(() => {
    setResults(initialItems);
    setNextCursor(initialNextCursor);
    setHasMore(initialHasMore);
    setLoadingMore(false);
    setError(initialError);
  }, [initialItems, initialNextCursor, initialHasMore, initialError]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const data = await fetchFeedPageGraphql({
        first: 12,
        after: nextCursor,
        type: queryType,
      });
      if (data && Array.isArray(data.items)) {
        setResults((prev) => [...prev, ...data.items]);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch {
      // Keep current results; the button stays available for a retry.
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor, queryType]);

  return (
    <section className="relative z-10 py-8 md:py-12">
      <div className="mx-auto max-w-container-max px-gutter">
        {error && (
          <p
            role="alert"
            className="mb-6 rounded-md border border-outline-variant bg-surface-container p-4 text-sm text-on-surface-variant"
          >
            {error}
          </p>
        )}

        {results.length === 0 ? (
          <div className="blueprint-grid rounded-2xl border border-outline-variant bg-surface px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-gold/40 bg-navy text-gold shadow-sm">
              <Icon name="verified" className="text-[24px]" />
            </div>
            <p className="mx-auto mb-2 flex w-fit items-center gap-2.5 font-label-sm text-[11px] uppercase tracking-[0.18em] text-gold-deep font-bold">
              <span className="h-px w-6 bg-gold" aria-hidden />
              Empty register
            </p>
            <p className="font-headline-md text-xl font-semibold text-navy">
              {activeSubTypeLabel
                ? `No ${activeSubTypeLabel.toLowerCase()} listings yet`
                : `No ${category.name.toLowerCase()} listings yet`}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">
              {activeSubTypeLabel
                ? `There are currently no verified ${activeSubTypeLabel.toLowerCase()} listings. Try exploring other types in this category or browse all properties.`
                : "New properties in this category are field-verified and published as they clear, or browse every verified listing in the archive."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {activeTypeKey && (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-md border-outline-variant font-semibold text-navy hover:bg-surface-container"
                >
                  <Link href={`/category/${category.slug}`} scroll={false}>
                    All {category.name} properties
                  </Link>
                </Button>
              )}
              <Button
                asChild
                className="rounded-md bg-gold font-semibold text-on-gold hover:bg-gold/90"
              >
                <Link href="/search">Browse all properties</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="flex items-center gap-2.5 font-label-sm text-[11px] uppercase tracking-[0.18em] text-gold-deep font-bold">
                  <span className="h-px w-7 bg-gold" aria-hidden />
                  <span>
                    {results.length} {activeSubTypeLabel ? `${activeSubTypeLabel} ` : ""}listing
                    {results.length === 1 ? "" : "s"} available
                  </span>
                </p>
                {activeSubTypeLabel && (
                  <Link
                    href={`/category/${category.slug}`}
                    scroll={false}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-surface px-2.5 py-0.5 font-label-sm text-xs font-medium text-navy hover:border-gold hover:bg-surface-container transition-colors"
                  >
                    <span>{activeSubTypeLabel}</span>
                    <Icon name="close" className="text-[14px] text-gold-deep" />
                  </Link>
                )}
              </div>
              <Button
                asChild
                variant="ghost"
                className="hidden text-xs font-semibold text-on-surface-variant hover:text-navy sm:inline-flex"
              >
                <Link href={`/search?type=${encodeURIComponent(queryType)}`} className="gap-1">
                  Refine in search
                  <Icon name="arrow_outward" className="text-sm" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={toCardPropsFromItem(toItem(p))}
                />
              ))}
            </div>
            {!hasMore ? (
              <p className="mx-auto mt-6 w-fit font-data-table text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                End of register — {results.length} properties
              </p>
            ) : null}
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