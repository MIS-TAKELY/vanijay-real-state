import type { Metadata } from "next";
import { EligibilityAndDocs } from "components/pages/nrn-concierge/EligibilityAndDocs";
import { Hero } from "components/pages/nrn-concierge/Hero";
import { ProcessAndBooking } from "components/pages/nrn-concierge/ProcessAndBooking";
import { RemoteWindow } from "components/pages/nrn-concierge/RemoteWindow";
import { VerifiedStamp } from "components/pages/nrn-concierge/VerifiedStamp";

const PAGE_URL = "https://lekhaprati.com/nrn-concierge";

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
  },
  openGraph: {
    title: "NRN Concierge Service | Buy Land in Nepal from Abroad",
    description:
      "Secure remote land purchase in Nepal as a Non-Resident Nepali. Power of Attorney, title verification & escrow handled end-to-end — no travel required.",
    url: PAGE_URL,
    siteName: "Lekhaprati",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NRN Concierge Service | Buy Land in Nepal from Abroad",
    description:
      "Secure remote land purchase in Nepal as a Non-Resident Nepali. POA, title verification & escrow — no travel required.",
  },
  robots: { index: true, follow: true },
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
    name: "Lekhaprati",
    url: "https://lekhaprati.com",
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
          description: "Secure escrow and title transfer completion with legal representation.",
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
      item: "https://lekhaprati.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "NRN Concierge",
      item: PAGE_URL,
    },
  ],
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
      <main>
        <Hero />
        <EligibilityAndDocs />
        <ProcessAndBooking />
        <VerifiedStamp />
        <RemoteWindow />
      </main>
    </>
  );
}
