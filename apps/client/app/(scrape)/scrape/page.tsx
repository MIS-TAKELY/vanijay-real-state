import type { Metadata } from "next";
import { Hero } from "components/scrape/pages/home/Hero";
import { GlobalLandscape } from "components/scrape/pages/home/GlobalLandscape";
import { NepalFocus } from "components/scrape/pages/home/NepalFocus";
import { Challenges } from "components/scrape/pages/home/Challenges";
import { Playbook } from "components/scrape/pages/home/Playbook";
import { CTA } from "components/scrape/pages/home/CTA";

export const metadata: Metadata = {
  title: "Scrape Intelligence | Global Tools Decoded for Nepal — Lekhaprati",
  description:
    "An analysis of the world's web-scraping platforms — open-source crawlers, browser automation, proxy APIs and AI-native extractors — mapped against Nepal's real data sources: Hamrobazaar, Daraz, Merojob and more.",
  keywords: [
    "web scraping Nepal",
    "Nepal data extraction",
    "Hamrobazaar scraping",
    "Daraz Nepal scraping",
    "Merojob scraping",
    "scraping tools comparison",
    "Crawlee",
    "Playwright",
    "Bright Data",
    "Nepal real estate data",
  ],
  alternates: {
    canonical: "/scrape",
  },
  openGraph: {
    title: "The Scraping Landscape, Decoded for Nepal",
    description:
      "15 global scraping platforms profiled and mapped against 9 Nepali data sources across real estate, e-commerce and jobs.",
    url: "/scrape",
    siteName: "Lekhaprati",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Scrape Intelligence — Global Tools Decoded for Nepal",
  description:
    "Analysis of global web-scraping platforms mapped against Nepal's real estate, e-commerce and job-portal data sources.",
  url: "/scrape",
  isPartOf: { "@type": "WebSite", name: "Lekhaprati" },
  about: {
    "@type": "Thing",
    name: "Web scraping in Nepal",
    description:
      "A comparison of web scraping tools and an overview of Nepali data sources including Hamrobazaar, Daraz Nepal, Merojob, Nepal Homes, Gharghaderi, Gharbazar, SastoDeal, Thulo.com and JobsNepal.",
  },
};

export default function ScrapeHomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Hero />
      <GlobalLandscape />
      <NepalFocus />
      <Challenges />
      <Playbook />
      <CTA />
    </>
  );
}
