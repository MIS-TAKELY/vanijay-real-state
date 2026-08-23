import type { Metadata } from "next";
import { METAL_SEO_DATA } from "../../../constants/gold/seo-data";
import { MetalPageTemplate } from "../../../components/gold/MetalPageTemplate";
import { MetalJsonLd } from "../../../components/gold/MetalJsonLd";
import { MetalUnitLinks } from "../../../components/gold/MetalUnitLinks";
import { getTodayRates } from "lib/fenegosida";

export async function generateMetadata(): Promise<Metadata> {
  const seo = METAL_SEO_DATA.gold;
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      url: "/gold",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
    alternates: { canonical: "/gold" },
    robots: { index: true, follow: true },
  };
}

export default async function GoldPage() {
  const todayRates = await getTodayRates();
  return (
    <>
      <MetalJsonLd metalId="gold" />
      <div className="mx-auto w-full max-w-[1280px] px-4 pt-6 sm:px-6 md:pt-12">
        <MetalUnitLinks metalId="gold" />
      </div>
      <MetalPageTemplate metalId="gold" todayRate={todayRates?.gold ?? null} />
    </>
  );
}
