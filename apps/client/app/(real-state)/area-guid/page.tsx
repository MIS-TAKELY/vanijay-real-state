import { ArchitectureOfTrust } from "components/real-state/pages/area-guid/ArchitectureOfTrust";
import { DistrictLedgers } from "components/real-state/pages/area-guid/DistrictLedgers";
import { Hero } from "components/real-state/pages/area-guid/Hero";
import { NRNBanner } from "components/real-state/pages/area-guid/NRNBanner";
import { SITE_URL } from "lib/site";
import type { Metadata } from "next";

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
  ],
  alternates: { canonical: "/area-guid" },
  openGraph: {
    title: "Area Guides — Verified Land Records by District | MALPOTH",
    description:
      "A disciplined, archival view of Nepal's real estate — cadastral-cleared records and structured data across all 74 districts.",
    url: `${SITE_URL}/area-guid`,
    siteName: "MALPOTH",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function AreaGuidesPage() {
  return (
    <>
      <Hero />
      <DistrictLedgers />
      <NRNBanner />
      <ArchitectureOfTrust />
    </>
  );
}
