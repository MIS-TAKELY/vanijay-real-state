import { ArchitectureOfTrust } from "components/real-state/pages/area-guid/ArchitectureOfTrust";
import { DistrictLedgers } from "components/real-state/pages/area-guid/DistrictLedgers";
import { Hero } from "components/real-state/pages/area-guid/Hero";
import { NRNBanner } from "components/real-state/pages/area-guid/NRNBanner";
import { buildHreflang, ogLocaleFor } from "lib/i18n";
import { SITE_URL } from "lib/site";
import type { Metadata } from "next";

const PAGE_URL = `${SITE_URL}/area-guid`;

export const metadata: Metadata = {
  title: "Area Guides — Verified Land Records by District | MALPOTH",
  description:
    "Explore cadastral-cleared land records across Nepal's 74 districts. Structured, archival-grade data on verified plots, road access and ownership history.",
  keywords: [
    "Nepal land records by district",
    "area guide Nepal real estate",
    "cadastral records Nepal",
    "verified land Kathmandu Lalitpur Bhaktapur",
    "district land prices Nepal",
    "Nepal property area guide",
    "land ownership records Nepal",
  ],
  alternates: {
    canonical: "/area-guid",
    languages: buildHreflang("/area-guid"),
  },
  openGraph: {
    title: "Area Guides — Verified Land Records by District | MALPOTH",
    description:
      "A disciplined, archival view of Nepal's real estate — cadastral-cleared records and structured data across all 74 districts.",
    url: PAGE_URL,
    siteName: "MALPOTH",
    type: "website",
    ...ogLocaleFor(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Area Guides — Verified Land Records by District | MALPOTH",
    description:
      "Cadastral-cleared land records across Nepal's 74 districts. Verified plots, road access and ownership history.",
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
};

/** BreadcrumbList schema */
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Area Guides",
      item: PAGE_URL,
    },
  ],
};

/** CollectionPage schema — tells search engines this is a district index */
const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${PAGE_URL}#collection`,
  url: PAGE_URL,
  name: "Area Guides — Verified Land Records by District | MALPOTH",
  description:
    "Explore cadastral-cleared land records across Nepal's 74 districts. Structured, archival-grade data on verified plots, road access and ownership history.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en",
  dateModified: new Date().toISOString().split("T")[0],
};

/** WebPage schema */
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: "Area Guides — Verified Land Records by District | MALPOTH",
  description:
    "Explore cadastral-cleared land records across Nepal's 74 districts.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  mainEntity: { "@id": `${PAGE_URL}#collection` },
  breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
  inLanguage: "en",
  dateModified: new Date().toISOString().split("T")[0],
};

export default function AreaGuidesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema),
        }}
      />
      <main>
        <Hero />
        <DistrictLedgers />
        <NRNBanner />
        <ArchitectureOfTrust />
      </main>
    </>
  );
}
