import type { Metadata } from "next";
import { EligibilityAndDocs } from "components/real-state/pages/nrn-concierge/EligibilityAndDocs";
import {
  Faq,
  NRN_FAQ_ITEMS,
} from "components/real-state/pages/nrn-concierge/Faq";
import { Hero } from "components/real-state/pages/nrn-concierge/Hero";
import { ProcessAndBooking } from "components/real-state/pages/nrn-concierge/ProcessAndBooking";
import { RemoteWindow } from "components/real-state/pages/nrn-concierge/RemoteWindow";
import { VerifiedStamp } from "components/real-state/pages/nrn-concierge/VerifiedStamp";
import { buildHreflang, ogLocaleFor } from "lib/i18n";
import { SITE_URL } from "lib/site";

const PAGE_URL = `${SITE_URL}/nrn-concierge`;

export const metadata: Metadata = {
  title: "NRN Concierge Service | Buy Land in Nepal from Abroad",
  description:
    "Secure remote land purchase in Nepal as a Non-Resident Nepali. Our NRN concierge handles Power of Attorney, title verification & escrow — no travel required.",
  keywords: [
    "NRN concierge",
    "buy land in Nepal from abroad",
    "Non-Resident Nepali",
    "NRN land acquisition",
    "remote property purchase Nepal",
    "Power of Attorney Nepal",
    "FCNO",
    "NCRA",
  ],
  alternates: {
    canonical: "/nrn-concierge",
    languages: buildHreflang("/nrn-concierge"),
  },
  openGraph: {
    title: "NRN Concierge Service | Buy Land in Nepal from Abroad",
    description:
      "Secure remote land purchase in Nepal as a Non-Resident Nepali. Power of Attorney, title verification & escrow handled end-to-end — no travel required.",
    url: PAGE_URL,
    siteName: "MALPOTH",
    type: "website",
    ...ogLocaleFor(),
  },
  twitter: {
    card: "summary_large_image",
    title: "NRN Concierge Service | Buy Land in Nepal from Abroad",
    description:
      "Secure remote land purchase in Nepal as a Non-Resident Nepali. POA, title verification & escrow — no travel required.",
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

/**
 * Structured data for the NRN Concierge service page.
 * Uses Service + BreadcrumbList (both ACTIVE per Schema.org / Google, Feb 2026).
 * Avoids deprecated HowTo and restricted FAQ types.
 * Server-rendered so JSON-LD is present in the initial HTML.
 */
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "NRN Concierge Service",
  serviceType: "Non-Resident Nepali land acquisition and concierge",
  description:
    "End-to-end remote land purchase service for Non-Resident Nepalis (NRN). Handles Power of Attorney filing, cadastral title verification, escrow settlement, and video walkthroughs of verified plots — no travel to Nepal required.",
  url: PAGE_URL,
  areaServed: { "@type": "Country", name: "Nepal" },
  audience: {
    "@type": "Audience",
    audienceType: "Non-Resident Nepalis (NRN Citizens & FCNO)",
  },
  provider: {
    "@type": "Organization",
    name: "MALPOTH",
    url: SITE_URL,
    description:
      "Nepal's verified land and property archive. Professionalizing real estate through rigorous field verification and legal transparency.",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "NRN Concierge Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Eligibility Assessment",
          description:
            "Verify NRN or FCNO status and eligibility to acquire land under Nepali law.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Power of Attorney Filing",
          description:
            "Coordinate POA execution at the nearest Nepali embassy or consulate.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Cadastral Title Verification",
          description:
            "Cross-reference Lalpurja against Land Revenue Office master ledger and field-verify boundaries.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Escrow Settlement",
          description:
            "Secure escrow and title transfer completion with legal representation.",
        },
      },
    ],
  },
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
    {
      "@type": "ListItem",
      position: 2,
      name: "NRN Concierge",
      item: PAGE_URL,
    },
  ],
};

/**
 * FAQPage schema — mirrors the visible FAQ rendered by <Faq />. Google no
 * longer shows FAQ rich results for most sites, but the markup remains valid
 * and is directly extractable by AI answer engines (the primary audience for
 * "can NRN buy land in Nepal" style queries).
 */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: NRN_FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function NRNConciergePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main>
        <Hero />
        <EligibilityAndDocs />
        <ProcessAndBooking />
        <VerifiedStamp />
        <RemoteWindow />
        <Faq />
      </main>
    </>
  );
}
