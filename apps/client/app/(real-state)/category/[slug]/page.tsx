import {
  CategoryHero,
  CategoryIndex,
  CategoryResults,
} from "components/real-state/pages/category";
import { getCategoryBySlug } from "constants/category-catalog";
import { buildHreflang, ogLocaleFor } from "lib/i18n";
import { PAGE_SIZE } from "lib/api/core/config";
import {
  fetchFeedPageGraphql,
  type FeedPage,
} from "lib/api/services/properties";
import {
  formatLocation,
  formatNPR,
  type ApiProperty,
} from "lib/api/services/properties/types";
import { SITE_URL } from "lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) {
    return {
      title: "Category not found | MALPOTH",
      robots: { index: false },
    };
  }

  return {
    title: `${category.title} | MALPOTH`,
    description: category.description,
    keywords: category.keywords,
    alternates: {
      canonical: `/category/${category.slug}`,
      languages: buildHreflang(`/category/${category.slug}`),
    },
    openGraph: {
      title: category.title,
      description: category.description,
      url: `${SITE_URL}/category/${category.slug}`,
      siteName: "MALPOTH",
      type: "website",
      ...ogLocaleFor(),
    },
    twitter: {
      card: "summary_large_image",
      title: category.title,
      description: category.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/* ──────────────────────────────────────────────────────────────────────
 * JSON-LD STRUCTURED DATA
 * ────────────────────────────────────────────────────────────────────── */

/** BreadcrumbList — Home → Category */
const breadcrumbSchema = (slug: string, name: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${SITE_URL}/category/${slug}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name,
      item: `${SITE_URL}/category/${slug}`,
    },
  ],
});

/**
 * CollectionPage + ItemList schema — tells AI engines and search engines this
 * page is a curated collection, and enumerates the server-rendered listings
 * (name, URL, price, location) so they are extractable without JS.
 */
const collectionSchema = (
  category: { slug: string; name: string; title: string; description: string },
  items: ApiProperty[],
) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/category/${category.slug}#collection`,
      url: `${SITE_URL}/category/${category.slug}`,
      name: category.title,
      description: category.description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      mainEntity: {
        "@id": `${SITE_URL}/category/${category.slug}#itemlist`,
      },
      breadcrumb: { "@id": `${SITE_URL}/category/${category.slug}#breadcrumb` },
      inLanguage: "en",
      dateModified: new Date().toISOString().split("T")[0],
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/category/${category.slug}#itemlist`,
      name: `${category.name} listings on MALPOTH`,
      description: `Verified ${category.name.toLowerCase()} listings across Nepal`,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: items.length,
      itemListElement: items.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/${p.slug}`,
        name: p.title,
        item: {
          "@type": "RealEstateListing",
          name: p.title,
          url: `${SITE_URL}/${p.slug}`,
          description: `${p.title} — ${formatLocation(p.location)} — asking price ${formatNPR(p.askingPrice)}.`,
          image: (p.media ?? []).find((m) => !m.type || m.type === "IMAGE")
            ?.url,
          offers: {
            "@type": "Offer",
            price: p.askingPrice,
            priceCurrency: "NPR",
            availability: "https://schema.org/InStock",
          },
          ...(p.location?.latitude != null && p.location?.longitude != null
            ? {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: p.location.latitude,
                  longitude: p.location.longitude,
                },
              }
            : {}),
        },
      })),
    },
  ],
});

/**
 * WebPage schema — page-level entity for the category archive.
 */
const webPageSchema = (category: { slug: string; title: string; description: string }) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/category/${category.slug}#webpage`,
  url: `${SITE_URL}/category/${category.slug}`,
  name: `${category.title} | MALPOTH`,
  description: category.description,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  mainEntity: { "@id": `${SITE_URL}/category/${category.slug}#collection` },
  breadcrumb: { "@id": `${SITE_URL}/category/${category.slug}#breadcrumb` },
  inLanguage: "en",
  dateModified: new Date().toISOString().split("T")[0],
  potentialAction: {
    "@type": "ReadAction",
    target: `${SITE_URL}/category/${category.slug}`,
  },
});

/**
 * Speakable schema — targeting the H1 for voice assistants / Google Assistant.
 */
const speakableSchema = (category: { slug: string }) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/category/${category.slug}#speakable`,
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".category-hero-title"],
  },
});

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { type: subTypeParam } = await searchParams;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const activeSubType = category.subTypes.find((s) => s.key === subTypeParam);
  const activeTypeKey = activeSubType ? activeSubType.key : undefined;
  const queryType = activeTypeKey ?? category.slug;

  let initial: FeedPage = { items: [], nextCursor: null, hasMore: false };
  let initialError: string | null = null;
  try {
    initial = await fetchFeedPageGraphql({ first: PAGE_SIZE, type: queryType });
  } catch (e) {
    initialError = e instanceof Error ? e.message : "Failed to load listings";
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(slug, category.name)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema(category, initial.items)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema(category)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(speakableSchema(category)),
        }}
      />
      <main className="flex flex-col">
        <CategoryHero category={category} />
        <CategoryIndex category={category} activeTypeKey={activeTypeKey} />
        <CategoryResults
          category={category}
          activeTypeKey={activeTypeKey}
          activeSubTypeLabel={activeSubType?.label}
          queryType={queryType}
          initialItems={initial.items}
          initialNextCursor={initial.nextCursor}
          initialHasMore={initial.hasMore}
          initialError={initialError}
        />
      </main>
    </>
  );
}
