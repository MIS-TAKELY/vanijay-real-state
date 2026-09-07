import type { Metadata } from "next";
import { METAL_SEO_DATA } from "../../../constants/gold/seo-data";
import { MetalPageTemplate } from "../../../components/gold/MetalPageTemplate";
import { MetalJsonLd } from "../../../components/gold/MetalJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const seo = METAL_SEO_DATA.bitcoin;
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      images: [{ url: "/og-home.png", width: 1200, height: 630, alt: seo.title }],
      url: "/bitcoin",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: ["/og-home.png"],
    },
    alternates: { canonical: "/bitcoin" },
    robots: { index: true, follow: true },
  };
}

export default function BitcoinPage() {
  return (
    <>
      <MetalJsonLd metalId="bitcoin" />
      <MetalPageTemplate metalId="bitcoin" />
    </>
  );
}