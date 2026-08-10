import { PropertyFeed } from "components/pages/listings/PropertyFeed";
import { ResultsHeader } from "components/pages/listings/ResultsHeader";
import { SearchFilters } from "components/pages/listings/SearchFilters";
import { ListingsMarketplace } from "components/pages/listings/ListingsMarketplace";
import { PAGE_SIZE, fetchFeedPageGraphql, type FeedPage } from "lib/api";
import type { Metadata } from "next";
import { CallToActionBanner, CategoryStrip, FeaturedListings, HeroBannerCarousel, RecentlyViewed } from "components/pages/home";

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

export default async function DiscoverPage() {
  let initial: FeedPage = { items: [], nextCursor: null, hasMore: false };
  let initialError: string | null = null;

  try {
    initial = await fetchFeedPageGraphql({ first: PAGE_SIZE });
  } catch (e) {
    initialError = e instanceof Error ? e.message : "Failed to load listings";
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main>

        <HeroBannerCarousel />

         <CategoryStrip />
        
        <SearchFilters />

        {/* <ResultsHeader /> */}

        <PropertyFeed
          initialItems={initial.items}
          initialNextCursor={initial.nextCursor}
          initialHasMore={initial.hasMore}
          initialError={initialError}
        />

        <ListingsMarketplace />
        <RecentlyViewed />
         <FeaturedListings />
         <CallToActionBanner />
      </main>
    </>
  );
}

