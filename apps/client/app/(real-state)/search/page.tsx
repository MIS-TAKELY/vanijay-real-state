import {
  SearchFilters,
  SearchResults,
} from "components/real-state/pages/search";
import { PAGE_SIZE, fetchFeedPageGraphql, type FeedPage } from "lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Verified Properties | MALPOTH",
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
    pr?: string;
    dist?: string;
    minS?: string;
    maxS?: string;
    mun?: string;
    ward?: string;
    bed?: string;
    bath?: string;
    face?: string;
    road?: string;
    cp?: string;
    ng?: string;
    cs?: string;
    ft?: string;
    sub?: string;
    am?: string;
  }>;
}) {
  const params = await searchParams;

  /* Build a filters object with both long and short keys for compatibility.
   * The server-side fetch reads long keys; the URL uses short keys. */
  const filters = {
    q: params.q ?? null,
    type: params.type ?? null,
    price: params.pr ?? null,
    district: params.dist ?? null,
    minSize: params.minS ?? null,
    maxSize: params.maxS ?? null,
    municipality: params.mun ?? null,
    ward: params.ward ?? null,
    facing: params.face ?? null,
    roadType: params.road ?? null,
    bedrooms: params.bed ?? null,
    bathrooms: params.bath ?? null,
    isCornerPlot: params.cp === "true" ? true : undefined,
    isNegotiable: params.ng === "true" ? true : undefined,
    constructionStatus: params.cs ?? null,
    furnishing: params.ft ?? null,
    subCategory: params.sub ?? null,
    amenities: params.am ? params.am.split(",") : null,
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
        filters={params as Record<string, string | null>}
      />
    </main>
  );
}
