import {
  CategoryStrip,
  HeroBannerCarousel,
  ListingsMarketplace,
  RecentlyAdded,
  RecentlyViewed,
} from "components/real-state/pages/home";
import {
  AboutArchive,
  HOME_FAQ_ITEMS,
} from "components/real-state/pages/home/AboutArchive";
import NepalmapWrapper from "components/real-state/pages/home/NepalmapWrapper";
import { SITE_URL } from "lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verified Land & Property Listings in Nepal | MALPOTH",
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
    title: "Verified Land & Property Listings in Nepal | MALPOTH",
    description:
      "Browse field-verified land, residential, commercial & apartment listings across Nepal. Cadastral-cleared, zero title disputes.",
    url: SITE_URL,
    siteName: "MALPOTH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified Land & Property Listings in Nepal | MALPOTH",
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
      item: SITE_URL,
    },
  ],
};

/** FAQPage schema — mirrors the visible FAQ in AboutArchive. */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default async function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="flex flex-col">
        <div
          className="mx-auto w-full max-w-container-max px-gutter"
          aria-hidden="true"
        >
          <div className="h-px w-full bg-outline-variant/60" />
        </div>
        <CategoryStrip />
        <HeroBannerCarousel />


        <ListingsMarketplace />
        <RecentlyAdded />
        <RecentlyViewed />
        <section className="py-6 md:py-14 relative z-10 w-full">
          <NepalmapWrapper />
        </section>
        <AboutArchive />
      </main>
    </>
  );
}
