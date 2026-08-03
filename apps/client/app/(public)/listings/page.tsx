import type { Metadata } from "next";
import { PropertyFeed } from "components/pages/listings/PropertyFeed";
import { ResultsHeader } from "components/pages/listings/ResultsHeader";
import { SearchFilters } from "components/pages/listings/SearchFilters";

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
    { "@type": "ListItem", position: 1, name: "Home", item: "https://lekhaprati.com" },
    { "@type": "ListItem", position: 2, name: "Listings", item: PAGE_URL },
  ],
};

export default function DiscoverPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main>
        <SearchFilters />

      

        <ResultsHeader />

        {/* Live property feed — client-side cursor (keyset) pagination. */}
        <PropertyFeed />
      </main>
    </>
  );
}
