import type { MetadataRoute } from "next";
import { API_ENDPOINTS } from "lib/api/core/endpoints";
import { apiUrl } from "lib/api/core/config";
import { LANGUAGES, DEFAULT_LOCALE } from "lib/i18n";
import { SITE_URL } from "lib/site";
import { CATEGORY_CATALOG } from "constants/category-catalog";

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
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.2 },
  {
    path: "/legal/land-act-compliance",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  // NOTE: /compare is intentionally excluded — it is a utility page whose
  // content depends on ?ids= query params; the bare URL shows an empty state.
  // NOTE: /scrape is excluded — it is disallowed in robots.txt.
  // NOTE: /gold (precious metals) is a separate product; left indexable but
  // not advertised in the real-estate sitemap.
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

/**
 * Filter out obvious test/duplicate listings so the sitemap only advertises
 * real inventory (e.g. "testing-hp22", "itahari-copy-copy-kjcd"). These
 * thin pages dilute crawl budget and can trigger quality flags in Search
 * Console. The proper long-term fix is to unpublish them in the admin
 * console; this guard keeps the sitemap clean in the meantime.
 */
const TEST_SLUG_PATTERN =
  /(test|testing|demo|sample|draft|copy|duplicate|temp|tmp|lorem|asdf|qwerty|zzz)/i;

function isLikelyTestSlug(slug: string): boolean {
  return TEST_SLUG_PATTERN.test(slug);
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

  // Build language alternates for each URL.
  // For each enabled language other than the default, emit a separate
  // sitemap entry with the locale-prefixed URL and xhtml:link alternates.
  const enabledLangs = Object.values(LANGUAGES).filter((l) => l.enabled);
  const hasMultipleLangs = enabledLangs.length > 1;

  /**
   * Attach language alternates to a sitemap entry when multiple languages
   * are enabled. Each entry gets `<xhtml:link rel="alternate" ...>` for
   * every enabled language + x-default.
   */
  function withAlternates(entry: MetadataRoute.Sitemap[number]): MetadataRoute.Sitemap[number] {
    if (!hasMultipleLangs) return entry;

    const languages: Record<string, string> = {};
    for (const lang of enabledLangs) {
      if (lang.code === DEFAULT_LOCALE) {
        languages[lang.code] = entry.url;
      } else {
        // Prefix the path segment of the URL with the locale code
        const url = new URL(entry.url);
        url.pathname = `/${lang.code}${url.pathname}`;
        languages[lang.code] = url.toString();
      }
    }
    languages["x-default"] = entry.url;

    return { ...entry, alternates: { languages } };
  }

  return [
    ...STATIC_ROUTES.map((route) =>
      withAlternates({
        url: `${SITE_URL}${route.path}`,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      }),
    ),
    ...CATEGORY_ROUTES.map((route) =>
      withAlternates({
        url: `${SITE_URL}${route.path}`,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      }),
    ),
    ...listingSlugs
      .filter(({ slug }) => slug && !isLikelyTestSlug(slug))
      .map(({ slug, updatedAt }) =>
        withAlternates({
          url: `${SITE_URL}/${slug}`,
          lastModified: updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }),
      ),
  ];
}
