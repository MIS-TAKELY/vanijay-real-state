import type { Metadata } from "next";
import { METAL_SEO_DATA } from "../../../constants/gold/seo-data";
import { MetalPageTemplate } from "../../../components/gold/MetalPageTemplate";
import { MetalJsonLd } from "../../../components/gold/MetalJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const seo = METAL_SEO_DATA.palladium;
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      url: "/palladium",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
    alternates: { canonical: "/palladium" },
    robots: { index: true, follow: true },
  };
}

export default function PalladiumPage() {
  return (
    <>
      <MetalJsonLd metalId="palladium" />
      <MetalPageTemplate metalId="palladium" />
    </>
  );
}