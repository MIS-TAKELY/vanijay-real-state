"use client";

import {
  PAGE_SIZE,
  fetchFeedPage,
  toCardProps,
  type ApiProperty,
} from "lib/api";
import { useCallback, useState } from "react";
import { PropertyCard } from "../../common/PropertyCard";
import { Pagination } from "./Pagination";

interface PropertyFeedProps {
  /** Initial (SSR) page of listings fetched by the server component. */
  initialItems: ApiProperty[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  /** Error from the server-side fetch, if any. */
  initialError?: string | null;
}

/**
 * Property feed (Client Component).
 *
 * The first page is fetched on the server (SSR) by the listings route and
 * passed in as `initialItems`, so the first paint shows real listings with no
 * client-side loading state (better SEO / LCP). Only "load more" pagination is
 * handled client-side via cursor (keyset) pagination. The API URL always comes
 * from the single source of truth in `lib/api` via `fetchFeedPage`.
 */
export function PropertyFeed({
  initialItems,
  initialNextCursor,
  initialHasMore,
  initialError = null,
}: PropertyFeedProps) {
  const [items, setItems] = useState<ApiProperty[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor,
  );
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  // Client-side retry of the first page (used when the SSR fetch failed).
  const reloadFirst = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchFeedPage({ first: PAGE_SIZE });
      setItems(page.items);
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load the next cursor page (keyset pagination).
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !nextCursor) return;
    setLoading(true);
    setError(null);
    try {
      const page = await fetchFeedPage({
        first: PAGE_SIZE,
        after: nextCursor,
      });
      setItems((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more listings");
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, nextCursor]);

  // Initial load failed and we have nothing to show yet.
  if (error && items.length === 0) {
    return (
      <section className="mx-auto max-w-container-max px-gutter py-xl text-center">
        <p className="mb-sm text-sm text-on-surface-variant">{error}</p>
        <button
          type="button"
          onClick={() => void reloadFirst()}
          className="inline-flex cursor-pointer items-center justify-center rounded-md border border-outline-variant px-md py-2 text-sm font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary"
        >
          Try again
        </button>
      </section>
    );
  }

  // Client retry in progress with no items yet.
  if (loading && items.length === 0) {
    return <FeedSkeleton />;
  }

  // No listings at all.
  if (!loading && items.length === 0) {
    return (
      <section className="mx-auto max-w-container-max px-gutter py-xl text-center">
        <p className="text-sm text-on-surface-variant">
          No listings available right now.
        </p>
      </section>
    );
  }

  return (
    <>
      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-md px-gutter sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <PropertyCard key={p.id} property={toCardProps(p)} />
        ))}
      </div>

      {error && items.length > 0 && (
        <p className="mx-auto max-w-container-max px-gutter py-sm text-center text-sm text-on-surface-variant">
          {error}
        </p>
      )}

      <Pagination
        hasMore={hasMore}
        loading={loading}
        onLoadMore={() => void loadMore()}
      />

      {!hasMore && !loading && (
        <p className="mx-auto max-w-container-max px-gutter pb-xl text-center text-sm text-on-surface-variant">
          You&apos;ve reached the end of the listings.
        </p>
      )}
    </>
  );
}

function FeedSkeleton() {
  return (
    <div className="mx-auto grid max-w-container-max grid-cols-1 gap-md px-gutter py-md sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div
          key={i}
          className="h-80 animate-pulse rounded-2xl bg-surface-container"
        />
      ))}
    </div>
  );
}
