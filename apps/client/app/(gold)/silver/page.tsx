import type { Metadata } from "next";
import { METAL_SEO_DATA } from "../../../constants/gold/seo-data";
import { MetalPageTemplate } from "../../../components/gold/MetalPageTemplate";
import { MetalJsonLd } from "../../../components/gold/MetalJsonLd";
import { MetalUnitLinks } from "../../../components/gold/MetalUnitLinks";
import { getTodayRates } from "lib/fenegosida";
import { SITE_URL } from "lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const seo = METAL_SEO_DATA.silver;
  const todayRates = await getTodayRates();
  const perTola = todayRates?.silver?.perTola;
  const description =
    perTola && perTola > 0
      ? `Live silver price today: रू ${Math.round(perTola).toLocaleString("en-US")} per tola (NPR). Spot charts, industrial demand insights, and Nepal market rates.`
      : seo.description;

  return {
    title: seo.title,
    description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description,
      type: "website",
      url: "/silver",
      images: [{ url: `${SITE_URL}/og-home.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description,
      images: [`${SITE_URL}/og-home.png`],
    },
    alternates: { canonical: "/silver" },
    robots: { index: true, follow: true },
  };
}

export default async function SilverPage() {
  const todayRates = await getTodayRates();
  const silverRate = todayRates?.silver ?? null;

  return (
    <>
      <MetalJsonLd
        metalId="silver"
        offer={
          silverRate
            ? {
                price: silverRate.perTola,
                priceCurrency: "NPR",
                unitText: "tola",
              }
            : null
        }
      />
      <div className="mx-auto w-full max-w-[1280px] px-4 pt-6 sm:px-6 md:pt-12">
        <MetalUnitLinks metalId="silver" />
      </div>
      <MetalPageTemplate metalId="silver" todayRate={silverRate} />
    </>
  );
}
