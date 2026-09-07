import type { Metadata } from "next";
import { Suspense } from "react";
import { MetalComparison } from "../../../../components/gold/MetalComparison";
import { SITE_URL } from "lib/site";

export const metadata: Metadata = {
  title: "Compare Gold, Silver & Metals — Live NPR Rates",
  description:
    "Compare gold, silver, platinum, palladium, copper, diamond, and steel prices side by side. Real-time NPR rates, performance metrics, and correlation analysis.",
  alternates: { canonical: "/metals/compare" },
  openGraph: {
    title: "Compare Gold, Silver & Metals — Live NPR Rates",
    description:
      "Side-by-side precious metals comparison with live NPR rates and performance metrics.",
    url: `${SITE_URL}/metals/compare`,
    siteName: "MALPOTH",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-home.png`,
        width: 1200,
        height: 630,
        alt: "MALPOTH metals comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Gold, Silver & Metals — Live NPR Rates",
    description:
      "Side-by-side precious metals comparison with live NPR rates.",
    images: [`${SITE_URL}/og-home.png`],
  },
  robots: { index: true, follow: true },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Metals",
      item: `${SITE_URL}/gold`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Compare",
      item: `${SITE_URL}/metals/compare`,
    },
  ],
};

export default function ComparePage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mb-8">
        <p
          className="mb-2 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-gold-deep"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <span className="h-px w-6 bg-gold/60" aria-hidden="true" />
          Side-by-side analysis
        </p>
        <h1
          className="text-3xl font-semibold tracking-tight text-on-surface"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Metal Comparison Tool
        </h1>
      </div>

      <Suspense
        fallback={
          <div
            className="rounded-2xl border border-outline-variant bg-surface p-8 text-center text-sm text-on-surface-variant shadow-sm"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Loading comparison…
          </div>
        }
      >
        <MetalComparison />
      </Suspense>
    </div>
  );
}
