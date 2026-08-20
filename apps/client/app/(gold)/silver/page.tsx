import type { Metadata } from "next";
import { METAL_SEO_DATA } from "../../../constants/gold/seo-data";
import { MetalPageTemplate } from "../../../components/gold/MetalPageTemplate";
import { getTodayRates } from "lib/fenegosida";

export async function generateMetadata(): Promise<Metadata> {
  const seo = METAL_SEO_DATA.silver;
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      url: "/silver",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
    alternates: { canonical: "/silver" },
    robots: { index: true, follow: true },
  };
}

export default async function SilverPage() {
  const todayRates = await getTodayRates();
  return <MetalPageTemplate metalId="silver" todayRate={todayRates?.silver ?? null} />;
}
