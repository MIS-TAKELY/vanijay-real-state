import type { Metadata } from "next";
import { METAL_SEO_DATA } from "../../../constants/gold/seo-data";
import { MetalPageTemplate } from "../../../components/gold/MetalPageTemplate";
import { MetalJsonLd } from "../../../components/gold/MetalJsonLd";
import { MetalUnitLinks } from "../../../components/gold/MetalUnitLinks";
import { getTodayRates } from "lib/fenegosida";
import { SITE_URL } from "lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const seo = METAL_SEO_DATA.gold;
  const todayRates = await getTodayRates();
  const perTola = todayRates?.gold?.perTola;
  const description =
    perTola && perTola > 0
      ? `Live gold price today: रू ${Math.round(perTola).toLocaleString("en-US")} per tola (NPR). Spot charts, bid/ask, and Nepal market rates — updated every 60 seconds.`
      : seo.description;

  return {
    title: seo.title,
    description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description,
      type: "website",
      url: "/gold",
      images: [{ url: `${SITE_URL}/og-home.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description,
      images: [`${SITE_URL}/og-home.png`],
    },
    alternates: { canonical: "/gold" },
    robots: { index: true, follow: true },
  };
}

export default async function GoldPage() {
  const todayRates = await getTodayRates();
  const goldRate = todayRates?.gold ?? null;

  return (
    <>
      <MetalJsonLd
        metalId="gold"
        offer={
          goldRate
            ? {
                price: goldRate.perTola,
                priceCurrency: "NPR",
                unitText: "tola",
              }
            : null
        }
      />
      <div className="mx-auto w-full max-w-[1280px] px-4 pt-6 sm:px-6 md:pt-12">
        <MetalUnitLinks metalId="gold" />
      </div>
      <MetalPageTemplate metalId="gold" todayRate={goldRate} />
    </>
  );
}
