import type { MetadataRoute } from "next";
import { API_ENDPOINTS } from "lib/api/core/endpoints";
import { apiUrl } from "lib/api/core/config";
import { SITE_URL } from "lib/site";
import { CATEGORY_CATALOG } from "constants/category-catalog";
import { fetchKabadiCategories } from "lib/kabadi/api";

// Regenerate the sitemap at most once an hour (ISR-style). Listing detail
// pages moved to /{slug} (SEO), so every LIVE listing gets a clean short URL.
export const revalidate = 3600;

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/search", changeFrequency: "daily", priority: 0.8 },
  { path: "/area-guid", changeFrequency: "weekly", priority: 0.6 },
  { path: "/convertor", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/nrn-concierge", changeFrequency: "monthly", priority: 0.5 },
  { path: "/compare", changeFrequency: "weekly", priority: 0.4 },
  { path: "/scrape", changeFrequency: "weekly", priority: 0.7 },
];

// Category archive pages — one per verified register (daily as listings churn).
const CATEGORY_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = CATEGORY_CATALOG.map((c) => ({
  path: `/category/${c.slug}`,
  changeFrequency: "daily",
  priority: 0.7,
}));

interface SitemapSlug {
  slug: string;
  updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let listingSlugs: SitemapSlug[] = [];
  try {
    const res = await fetch(apiUrl(API_ENDPOINTS.properties.sitemap), {
      next: { revalidate },
    });
    if (res.ok) {
      listingSlugs = (await res.json()) as SitemapSlug[];
    }
  } catch {
    // Never let a sitemap fetch failure take down the whole route — emit the
    // static pages so /sitemap.xml still resolves.
    listingSlugs = [];
  }

  // Kabadi category pages
  let kabadiCategoryRoutes: Array<{
    url: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [];
  try {
    const cats = await fetchKabadiCategories();
    kabadiCategoryRoutes = cats.map((c) => ({
      url: `${SITE_URL}/scrape/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // ignore
  }

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...kabadiCategoryRoutes,
    ...listingSlugs.map(({ slug, updatedAt }) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified: updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
