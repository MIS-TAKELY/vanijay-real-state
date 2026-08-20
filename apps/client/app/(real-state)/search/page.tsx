import {
  SearchFilters,
  SearchResults,
} from "components/real-state/pages/search";
import { PAGE_SIZE, fetchFeedPageGraphql, type FeedPage } from "lib/api";
import {
  formatLocation,
  formatNPR,
  type ApiProperty,
} from "lib/api/services/properties/types";
import { SITE_URL } from "lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Verified Properties | MALPOTH",
  description:
    "Search field-verified land, residential, commercial & apartment listings across Nepal by location, price, type, and size.",
  alternates: { canonical: "/search" },
  robots: { index: true, follow: true },
};

/**
 * CollectionPage + ItemList schema for the search results page. Enumerates
 * the server-rendered result set so AI engines can extract listings, prices
 * and locations directly from the initial HTML.
 */
const searchSchema = (items: ApiProperty[], query: string) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/search#collection`,
      url: `${SITE_URL}/search`,
      name: query
        ? `Search results for "${query}" on MALPOTH`
        : "Search verified properties on MALPOTH",
      description:
        "Search field-verified land, residential, commercial & apartment listings across Nepal by location, price, type, and size.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "ItemList",
      name: query
        ? `MALPOTH search results for "${query}"`
        : "MALPOTH verified property listings",
      numberOfItems: items.length,
      itemListElement: items.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/${p.slug}`,
        name: p.title,
        item: {
          "@type": "RealEstateListing",
          name: p.title,
          url: `${SITE_URL}/${p.slug}`,
          description: `${p.title} — ${formatLocation(p.location)} — asking price ${formatNPR(p.askingPrice)}.`,
          offers: {
            "@type": "Offer",
            price: p.askingPrice,
            priceCurrency: "NPR",
          },
        },
      })),
    },
  ],
});

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(searchSchema(initial.items, params.q ?? "")),
        }}
      />
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
