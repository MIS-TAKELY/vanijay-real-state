import {
  CategoryHero,
  CategoryIndex,
  CategoryResults,
} from "components/real-state/pages/category";
import { getCategoryBySlug } from "constants/category-catalog";
import { PAGE_SIZE } from "lib/api/core/config";
import {
  fetchFeedPageGraphql,
  type FeedPage,
} from "lib/api/services/properties";
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
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title: category.title,
      description: category.description,
      url: `${SITE_URL}/category/${category.slug}`,
      siteName: "MALPOTH",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

const breadcrumbSchema = (slug: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: slug,
      item: `${SITE_URL}/category/${slug}`,
    },
  ],
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
    // If a subcategory is selected, filter by that subcategory; otherwise by mainCategory slug
    initial = await fetchFeedPageGraphql({ first: PAGE_SIZE, type: queryType });
  } catch (e) {
    initialError = e instanceof Error ? e.message : "Failed to load listings";
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(slug)),
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
