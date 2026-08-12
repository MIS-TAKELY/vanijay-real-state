"use client";

import { Button } from "@repo/ui";

interface PaginationProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

/**
 * Cursor-driven pagination control.
 *
 * Keyset pagination has no notion of "page 7" — you can only advance by passing
 * the previous response's `nextCursor` back as `after`. So instead of fake
 * page numbers we render a single "Load more" button driven by `hasMore`.
 * The parent (`PropertyFeed`) renders the end-of-list marker itself.
 */
export function Pagination({ hasMore, loading, onLoadMore }: PaginationProps) {
  if (!hasMore) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mx-auto flex max-w-container-max items-center justify-center px-gutter py-xl"
    >
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={loading}
        aria-busy={loading}
        className="rounded-md border-outline-variant bg-surface px-md py-2.5 font-semibold text-on-surface hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Loading…" : "Load more listings"}
      </Button>
    </nav>
  );
}
