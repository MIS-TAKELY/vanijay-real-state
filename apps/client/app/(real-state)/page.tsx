import {
  CallToActionBanner,
  CategoryStrip,
  HeroBannerCarousel,
  ListingsMarketplace,
  RecentlyAdded,
  RecentlyViewed,
  SearchBar,
} from "components/real-state/pages/home";
import NepalmapWrapper from "components/real-state/pages/home/NepalmapWrapper";
import { AppModeStrip } from "components/shared/AppModeStrip";
import type { Metadata } from "next";

const PAGE_URL = "https://lekhaprati.com";

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
  alternates: { canonical: "/" },
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
      item: PAGE_URL,
    },
  ],
};

export default async function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="flex flex-col">
        <div
          className="mx-auto w-full max-w-container-max px-gutter"
          aria-hidden="true"
        >
          <div className="h-px w-full bg-outline-variant/60" />
        </div>
        {/* <AppModeStrip /> */}
        <CategoryStrip />
        <HeroBannerCarousel />

        {/* <SearchBar /> */}

        <ListingsMarketplace />
        <RecentlyAdded />
        <RecentlyViewed />
        <section className="py-10 md:py-14 relative z-10">
          <div className="">
            <NepalmapWrapper height="clamp(420px, 52vh, 620px)" />
          </div>
        </section>
        {/* <CallToActionBanner /> */}
      </main>
    </>
  );
}
