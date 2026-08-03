import { PropertyFeed } from "components/pages/listings/PropertyFeed";
import { ResultsHeader } from "components/pages/listings/ResultsHeader";
import { SearchFilters } from "components/pages/listings/SearchFilters";
import { PAGE_SIZE, fetchFeedPage, type FeedPage } from "lib/api";
import type { Metadata } from "next";

const PAGE_URL = "https://lekhaprati.com/listings";

export const metadata: Metadata = {
  title: "Verified Land & Property Listings in Nepal | Lekhaprati",
  description:
    "Browse field-verified land, residential, commercial & apartment listings across Nepal. Every plot cross-referenced against cadastral records — zero title disputes.",
  keywords: [
    "land for sale Nepal",
    "property listings Nepal",
    "buy land Kathmandu",
    "verified real estate Nepal",
    "residential plot Nepal",
    "commercial property Kathmandu",
    "apartment for sale Lalitpur",
    "Bhaktapur land",
  ],
  alternates: { canonical: "/listings" },
  openGraph: {
    title: "Verified Land & Property Listings in Nepal | Lekhaprati",
    description:
      "Browse field-verified land, residential, commercial & apartment listings across Nepal. Cadastral-cleared, zero title disputes.",
    url: PAGE_URL,
    siteName: "Lekhaprati",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified Land & Property Listings in Nepal | Lekhaprati",
    description:
      "Browse field-verified land & property listings across Nepal. Cadastral-cleared, zero title disputes.",
  },
  robots: { index: true, follow: true },
};

// Breadcrumb structured data (static, server-rendered so JSON-LD is in the
// initial HTML). The per-listing ItemList JSON-LD was removed with the mock
// data — to emit a real ItemList, generate it server-side from the feed (which
// requires making /properties/feed publicly readable, or server-side auth).
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://lekhaprati.com",
    },
    { "@type": "ListItem", position: 2, name: "Listings", item: PAGE_URL },
  ],
};

/**
 * Listings page (Server Component, SSR).
 *
 * The first feed page is fetched on the server and passed to `<PropertyFeed>`
 * as initial data, so the first paint shows real listings with no client-side
 * loading state (better SEO / LCP). "Load more" pagination stays client-side
 * (cursor/keyset).
 *
 * The route is dynamic because the feed is currently auth-scoped —
 * `fetchFeedPageServer` forwards the incoming request cookies so SSR works for
 * logged-in users. If `/properties/feed` is made public, drop the cookie
 * forwarding and switch the fetch to `next: { revalidate: 60 }` to enable ISR
 * (static + time-based revalidation).
 */
export default async function DiscoverPage() {
  let initial: FeedPage = { items: [], nextCursor: null, hasMore: false };
  let initialError: string | null = null;

  try {
    initial = await fetchFeedPage({ first: PAGE_SIZE });
  } catch (e) {
    initialError =
      e instanceof Error ? e.message : "Failed to load listings";
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main>
        <SearchFilters />

        <ResultsHeader />

        {/* First page server-rendered (SSR); "load more" is client-side. */}
        <PropertyFeed
          initialItems={initial.items}
          initialNextCursor={initial.nextCursor}
          initialHasMore={initial.hasMore}
          initialError={initialError}
        />
      </main>
    </>
  );
}
