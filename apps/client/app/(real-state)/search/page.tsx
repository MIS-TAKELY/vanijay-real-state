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
      {/* Premium page header — navy title + gold eyebrow */}
      {/* <header className="mx-auto w-full max-w-container-max px-gutter pt-8 md:pt-10">
        <p className="mb-2 flex items-center gap-2.5 font-label-sm text-[11px] uppercase tracking-[0.18em] text-gold-deep font-bold">
          <span className="h-px w-7 bg-gold" aria-hidden />
          The Archive
        </p>
        <h1 className="font-display-lg text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          Search Verified Properties
        </h1>
        <p className="mt-2 max-w-2xl font-body-md text-sm leading-relaxed text-on-surface-variant sm:text-body-md">
          Every listing is field-verified and cross-referenced against cadastral
          records — filter by district, type, price, or size to find your plot.
        </p>
      </header> */}
      {/* <SearchFilters /> */}
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
