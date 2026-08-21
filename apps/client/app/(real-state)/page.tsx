import { HomeClientSection } from "components/real-state/pages/home/HomeClientSection";
import { HOME_FAQ_ITEMS } from "components/real-state/pages/home/AboutArchive";
import { CATEGORY_CATALOG } from "constants/category-catalog";
import { buildHreflang, ogLocaleFor } from "lib/i18n";
import { SITE_URL } from "lib/site";
import type { Metadata } from "next";

/* ──────────────────────────────────────────────────────────────────────
 * PAGE METADATA
 * ────────────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Verified Land & Property Listings in Nepal | MALPOTH",
  description:
    "Browse field-verified land, residential, commercial & apartment listings across Nepal. Every plot cross-referenced against cadastral records — zero title disputes. Free search, compare & unit converter tools.",
  keywords: [
    "land for sale Nepal",
    "property listings Nepal",
    "buy land Kathmandu",
    "verified real estate Nepal",
    "residential plot Nepal",
    "commercial property Kathmandu",
    "apartment for sale Lalitpur",
    "Bhaktapur land",
    "Nepal real estate marketplace",
    "cadastral verified property",
    "land ownership Nepal",
    "NRN land purchase Nepal",
  ],
  alternates: {
    canonical: "/",
    languages: buildHreflang("/"),
  },
  openGraph: {
    title: "Verified Land & Property Listings in Nepal | MALPOTH",
    description:
      "Nepal's archive of record for land and property. Field-verified listings cross-referenced against cadastral records — zero title disputes.",
    url: SITE_URL,
    siteName: "MALPOTH",
    type: "website",
    ...ogLocaleFor(),
    images: [
      {
        url: `${SITE_URL}/og-home.png`,
        width: 1200,
        height: 630,
        alt: "MALPOTH — Verified Land & Property Listings in Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified Land & Property Listings in Nepal | MALPOTH",
    description:
      "Nepal's archive of record for land & property. Field-verified, cadastral-cleared, zero title disputes.",
    images: [`${SITE_URL}/og-home.png`],
    creator: "@malpoth",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "application-name": "MALPOTH",
    "msapplication-TileColor": "#1B5E20",
  },
};

/* ──────────────────────────────────────────────────────────────────────
 * JSON-LD STRUCTURED DATA
 * ────────────────────────────────────────────────────────────────────── */

/** BreadcrumbList — Home is the only item, but having it explicitly
 *  declared helps search engines resolve the homepage entity. */
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

/** FAQPage schema — mirrors the visible FAQ in AboutArchive.
 *  Rich results appear directly in Google SERPs. */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

/**
 * WebPage schema — explicit page type for the landing page.
 * Helps search engines classify this as the site's main entry point.
 */
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: "Verified Land & Property Listings in Nepal | MALPOTH",
  description:
    "Browse field-verified land, residential, commercial & apartment listings across Nepal. Every plot cross-referenced against cadastral records — zero title disputes.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${SITE_URL}/og-home.png`,
  },
  datePublished: "2024-01-01T00:00:00+05:45",
  dateModified: new Date().toISOString().split("T")[0],
  breadcrumb: { "@id": `${SITE_URL}/#breadcrumb` },
  inLanguage: "en",
  potentialAction: {
    "@type": "ReadAction",
    target: SITE_URL,
  },
};

/**
 * ItemList schema — the property category tiles.
 * Helps search engines understand the site's content structure
 * and can trigger list-style rich results.
 */
const categoryItemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Property Categories",
  description: "Browse verified property listings by category across Nepal",
  numberOfItems: CATEGORY_CATALOG.length,
  itemListElement: CATEGORY_CATALOG.map((cat, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: cat.title,
    url: `${SITE_URL}/category/${cat.slug}`,
    description: cat.description,
  })),
};

/**
 * Service schema — describes what MALPOTH offers.
 * Helps AI answer engines and search engines understand the site's purpose.
 */
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Real Estate Listing & Verification",
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: {
    "@type": "Country",
    name: "Nepal",
    sameAs: "https://en.wikipedia.org/wiki/Nepal",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Verified Property Listings",
    itemListElement: CATEGORY_CATALOG.map((cat) => ({
      "@type": "OfferCatalog",
      name: cat.title,
      numberOfItems: 0,
      itemListElement: {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: cat.name,
          description: cat.description,
        },
      },
    })),
  },
};

/* ──────────────────────────────────────────────────────────────────────
 * PAGE COMPONENT
 * ────────────────────────────────────────────────────────────────────── */

export default async function HomePage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(categoryItemListSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />

      <main className="flex flex-col">
        {/* Skip-to-content link for accessibility (visually hidden) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-navy focus:font-semibold"
        >
          Skip to main content
        </a>

        <div
          id="main-content"
          className="mx-auto w-full max-w-container-max px-gutter"
          aria-hidden="true"
        >
          <div className="h-px w-full bg-outline-variant/60" />
        </div>
        <HomeClientSection />
      </main>
    </>
  );
}
