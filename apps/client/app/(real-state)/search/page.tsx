import {
  SearchFilters,
  SearchResults,
} from "components/real-state/pages/search";
import { PAGE_SIZE, fetchFeedPageGraphql, type FeedPage } from "lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Verified Properties | Lekhaprati",
  description:
    "Search field-verified land, residential, commercial & apartment listings across Nepal by location, price, type, and size.",
  alternates: { canonical: "/search" },
  robots: { index: true, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    price?: string;
    district?: string;
    minSize?: string;
    maxSize?: string;
  }>;
}) {
  const params = await searchParams;
  const filters = {
    q: params.q ?? null,
    type: params.type ?? null,
    price: params.price ?? null,
    district: params.district ?? null,
    minSize: params.minSize ?? null,
    maxSize: params.maxSize ?? null,
  };

  let initial: FeedPage = { items: [], nextCursor: null, hasMore: false };
  let initialError: string | null = null;

  try {
    initial = await fetchFeedPageGraphql({ first: PAGE_SIZE, ...filters });
  } catch (e) {
    initialError = e instanceof Error ? e.message : "Failed to load listings";
  }

  return (
    <main className="flex flex-col">
      <SearchFilters />
      <SearchResults
        initialItems={initial.items}
        initialNextCursor={initial.nextCursor}
        initialHasMore={initial.hasMore}
        initialError={initialError}
        query={params.q ?? ""}
        filters={filters}
      />
    </main>
  );
}
