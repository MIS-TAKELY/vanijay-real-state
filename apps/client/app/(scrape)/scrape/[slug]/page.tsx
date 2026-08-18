import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "lib/site";
import {
  fetchKabadiCategories,
  fetchKabadiCategoryBySlug,
  type KabadiCategoryData,
} from "lib/kabadi/api";
import { CategoryDetailClient } from "./CategoryDetailClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Generate static paths for all published categories */
export async function generateStaticParams() {
  try {
    const cats = await fetchKabadiCategories();
    return cats.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

/** Dynamic SEO metadata per category */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchKabadiCategoryBySlug(slug);
  if (!category) {
    return {
      title: "Category Not Found | Kabadi",
      robots: { index: false },
    };
  }

  const title =
    category.seoTitle ||
    `${category.name} Kabadi Rates in Kathmandu | Sell Scrap`;
  const description =
    category.seoDescription ||
    `Sell ${category.name.toLowerCase()} for the best rates in Kathmandu Valley. ${category.blurb || ""}`;
  const keywords = category.seoKeywords
    ? category.seoKeywords.split(",").map((k) => k.trim())
    : [
        `${category.name.toLowerCase()} kabadi rate Nepal`,
        `sell ${category.name.toLowerCase()} Kathmandu`,
        "scrap price Nepal",
      ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/scrape/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/scrape/${slug}`,
      siteName: "Kabadi by MALPOTH",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

/** JSON-LD structured data for breadcrumbs */
function breadcrumbSchema(slug: string, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Sell Scrap",
        item: `${SITE_URL}/scrape`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name,
        item: `${SITE_URL}/scrape/${slug}`,
      },
    ],
  };
}

/** JSON-LD ItemList schema for the category's items */
function itemListSchema(category: KabadiCategoryData) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} buy rates in Kathmandu`,
    description:
      category.seoDescription || `Current buy rates for ${category.name} items`,
    numberOfItems: category.items.length,
    itemListElement: category.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: item.name,
        description: item.note || `${item.name} — ${category.name}`,
        offers: {
          "@type": "Offer",
          price: Number(item.rate),
          priceCurrency: "NPR",
          availability: "https://schema.org/InStock",
          priceValidUntil: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString().slice(0, 10),
        },
      },
    })),
  };
}

/** JSON-LD FAQPage schema if the category has FAQ items */
function faqSchema(category: KabadiCategoryData) {
  if (!category.faq || category.faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: category.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

export default async function KabadiCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await fetchKabadiCategoryBySlug(slug);

  if (!category) notFound();

  // Fetch sibling categories for navigation
  let allCategories: KabadiCategoryData[] = [];
  try {
    allCategories = await fetchKabadiCategories();
  } catch {
    // ignore
  }

  const faq = faqSchema(category);

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(slug, category.name)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema(category)),
        }}
      />
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
      )}

      <CategoryDetailClient
        category={category}
        allCategories={allCategories}
      />
    </>
  );
}
