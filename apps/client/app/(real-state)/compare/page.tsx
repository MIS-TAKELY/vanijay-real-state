import { buildHreflang, ogLocaleFor } from "lib/i18n";
import { SITE_URL } from "lib/site";
import type { Metadata } from "next";
import ComparePage from "./compare-client";

const PAGE_URL = `${SITE_URL}/compare`;

export const metadata: Metadata = {
  title: "Compare Properties Side by Side | MALPOTH",
  description:
    "Compare verified land and property listings in Nepal side by side — price, area, road access, facing and verification status in one table.",
  keywords: [
    "compare properties Nepal",
    "compare land listings Kathmandu",
    "property comparison tool Nepal",
    "side by side property comparison",
    "Nepal real estate comparison",
  ],
  alternates: {
    canonical: "/compare",
    languages: buildHreflang("/compare"),
  },
  openGraph: {
    title: "Compare Properties Side by Side | MALPOTH",
    description:
      "Put verified listings side by side — price, area, road access and verification status in one table.",
    url: PAGE_URL,
    siteName: "MALPOTH",
    type: "website",
    ...ogLocaleFor(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Properties Side by Side | MALPOTH",
    description:
      "Compare verified land and property listings in Nepal side by side.",
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
      name: "Compare Properties",
      item: PAGE_URL,
    },
  ],
};

/** WebPage schema */
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: "Compare Properties Side by Side | MALPOTH",
  description:
    "Compare verified land and property listings in Nepal side by side — price, area, road access, facing and verification status in one table.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
  inLanguage: "en",
  potentialAction: {
    "@type": "ReadAction",
    target: PAGE_URL,
  },
};

export default function CompareWrapper() {
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
          __html: JSON.stringify(webPageSchema),
        }}
      />
      <ComparePage />
    </>
  );
}
