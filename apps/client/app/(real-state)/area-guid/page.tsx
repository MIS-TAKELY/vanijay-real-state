import { ArchitectureOfTrust } from "components/real-state/pages/area-guid/ArchitectureOfTrust";
import { DistrictLedgers } from "components/real-state/pages/area-guid/DistrictLedgers";
import { Hero } from "components/real-state/pages/area-guid/Hero";
import { NRNBanner } from "components/real-state/pages/area-guid/NRNBanner";
import { DISTRICT_CATALOG } from "constants/district-catalog";
import { buildHreflang, ogLocaleFor } from "lib/i18n";
import { SITE_URL } from "lib/site";
import type { Metadata } from "next";
import Link from "next/link";

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

/** Province display order for the district directory. */
const PROVINCE_ORDER = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
] as const;

/**
 * Server-rendered directory of every district area guide — the hub's
 * complete spoke-link inventory. Keeps all 77 district pages reachable
 * within one hop of the hub (no orphans) for crawlers and users alike.
 */
function DistrictDirectory() {
  return (
    <section className="border-b border-outline-variant">
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        <h2 className="font-headline-md text-xl font-semibold tracking-tight text-navy sm:text-2xl">
          Browse Land Records by District
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
          Jump straight to any district&apos;s verified land &amp; property
          records — live listing counts, price ranges and coverage across all{" "}
          {DISTRICT_CATALOG.length} districts of Nepal.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {PROVINCE_ORDER.map((province) => {
            const districts = DISTRICT_CATALOG.filter(
              (d) => d.province === province,
            );
            if (districts.length === 0) return null;
            return (
              <div key={province}>
                <h3 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                  <span className="h-px w-4 bg-gold/60" aria-hidden="true" />
                  {province} Province
                  <span className="text-on-surface-variant/60">
                    ({districts.length})
                  </span>
                </h3>
                <ul className="flex flex-wrap gap-1.5">
                  {districts.map((d) => (
                    <li key={d.slug}>
                      <Link
                        href={`/area-guid/${d.slug}`}
                        className="inline-block rounded-md border border-outline-variant px-2.5 py-1 text-[13px] text-on-surface-variant transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                      >
                        {d.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

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
        <DistrictDirectory />
        <NRNBanner />
        <ArchitectureOfTrust />
      </main>
    </>
  );
}
