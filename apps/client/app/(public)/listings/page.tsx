import type { Metadata } from "next";
import { Pagination } from "components/pages/listings/Pagination";
import { PropertyCard } from "components/pages/listings/PropertyCard";
import { ResultsHeader } from "components/pages/listings/ResultsHeader";
import { SearchFilters } from "components/pages/listings/SearchFilters";

const PAGE_URL = "https://lekhaprati.com/listings";

const PROPERTIES = [
  {
    id: "8821-KTM",
    title: "Budhanilkantha Residential",
    price: "NPR 45,500,000",
    location: "Plot #42, Ward 03, Kathmandu",
    meta: ["0-8-2-1 RAPD", "Road Access: 20ft"],
    type: "residential",
    gradient: "from-[#A8C0A0] via-[#7A9A70] to-[#5A7A55]",
  },
  {
    id: "1042-LAL",
    title: "Jhamsikhel Commercial",
    price: "NPR 128,000,000",
    location: "Sector B, Ward 02, Lalitpur",
    meta: ["1-2-0-0 RAPD", "Road Access: 32ft"],
    type: "commercial",
    gradient: "from-[#C8C0B0] via-[#A89880] to-[#887860]",
  },
  {
    id: "5590-LAL",
    title: "Sanepa Luxury Apartment",
    price: "NPR 32,000,000",
    location: "The Zenith, Unit 4B, Sanepa",
    meta: ["1,850 Sq Ft", "3 BHK"],
    type: "apartment",
    gradient: "from-[#90A8C0] via-[#6A88A8] to-[#4A6888]",
  },
  {
    id: "2219-BKT",
    title: "Bhaktapur Heritage Plot",
    price: "NPR 18,500,000",
    location: "Siddhapokhari, Ward 01, Bhaktapur",
    meta: ["0-5-1-0 RAPD", "Road Access: 12ft"],
    type: "plot",
    gradient: "from-[#B0C8A0] via-[#88A870] to-[#688850]",
  },
];

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
  alternates: {
    canonical: "/listings",
  },
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

/**
 * Structured data for the listings directory page.
 * Uses ItemList (ACTIVE) + BreadcrumbList (ACTIVE) per Schema.org / Google, Feb 2026.
 * Server-rendered so JSON-LD is present in the initial HTML.
 */
const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Verified Land & Property Listings in Nepal",
  description:
    "Field-verified land, residential, commercial, and apartment listings across Nepal, cross-referenced against cadastral records.",
  url: PAGE_URL,
  numberOfItems: PROPERTIES.length,
  itemListElement: PROPERTIES.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${PAGE_URL}/${p.id}`,
    name: p.title,
  })),
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
    {
      "@type": "ListItem",
      position: 2,
      name: "Listings",
      item: PAGE_URL,
    },
  ],
};

export default function DiscoverPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main>
        <SearchFilters />

        {/* Page heading + intro — SEO content / E-E-A-T */}
        <section className="mx-auto max-w-container-max px-gutter pt-xl">
          <p className="font-label-sm text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface-variant mb-xs">
            The Verified Archive
          </p>
          <h1 className="font-display-lg text-[36px] md:text-[44px] font-semibold leading-[1.1] tracking-[-0.6px] text-primary mb-sm">
            Verified Land &amp; Property Listings in Nepal
          </h1>
          <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Every listing in our registry has been field-verified by certified
            surveyors and cross-referenced against the Land Revenue Office
            master ledger. Filter by property type, price, district, or land
            size to find cadastral-cleared plots and buildings with zero title
            disputes.
          </p>
        </section>

        <ResultsHeader />

        {/* Property grid */}
        <div className="mx-auto grid max-w-container-max grid-cols-1 gap-md px-gutter sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTIES.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>

        <Pagination />
      </main>
    </>
  );
}
