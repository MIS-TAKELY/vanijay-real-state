import type { Metadata } from "next";
import {
  Calculator,
  CategoryGrid,
  CTA,
  Hero,
  HowItWorks,
  RateCatalog,
} from "components/kabadi/pages/home";
import { fetchKabadiCategories, type KabadiCategoryData } from "lib/kabadi/api";

export const metadata: Metadata = {
  title: "Kabadi | Sell Your Scrap, Get Paid in Cash",
  description:
    "Check today's kabadi rates in Kathmandu — paper, plastic, metals, e-waste and appliances priced per kg or per piece. Estimate your payout and book a doorstep pickup for cash on the spot.",
  keywords: [
    "kabadi price Nepal",
    "scrap price Kathmandu",
    "sell scrap online",
    "kawadi rates",
    "copper price per kg Nepal",
    "newspaper rate Nepal",
    "e-waste recycling Nepal",
    "scrap pickup Kathmandu",
  ],
  alternates: { canonical: "/scrape" },
  openGraph: {
    title: "Kabadi — Turn your scrap into cash",
    description:
      "Transparent kabadi rates across the Kathmandu Valley, an instant payout calculator, and same-day doorstep pickup with cash on the spot.",
    url: "/scrape",
    siteName: "Kabadi",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Kabadi",
  url: "/scrape",
  description:
    "Nepal's transparent kabadi (scrap) price guide and doorstep pickup service for paper, plastic, metals, e-waste and appliances.",
  inLanguage: "en",
};

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Kabadi buy rates",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Copper wire — Rs 1,400 per kg",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Newspaper — Rs 35 per kg",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "PET bottles — Rs 20 per kg",
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Old smartphone — Rs 150 per piece",
    },
  ],
};

export default async function KabadiHomePage() {
  let categories: KabadiCategoryData[] = [];
  try {
    categories = await fetchKabadiCategories();
  } catch {
    // Fallback to empty array if API is down
    categories = [];
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Hero />
      <CategoryGrid categories={categories} />
      <Calculator />
      <RateCatalog categories={categories} />
      <HowItWorks />
      <CTA />
    </>
  );
}
