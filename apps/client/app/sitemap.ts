import type { MetadataRoute } from "next";
import { API_ENDPOINTS } from "lib/api/core/endpoints";
import { apiUrl } from "lib/api/core/config";
import { LANGUAGES, DEFAULT_LOCALE } from "lib/i18n";
import { CONVERSION_PAIRS } from "lib/land-conversions";
import { SITE_URL } from "lib/site";
import { CATEGORY_CATALOG } from "constants/category-catalog";
import { DISTRICT_CATALOG } from "constants/district-catalog";
import { UNIT_RATE_UNITS } from "components/gold/UnitRateTemplate";
import { fetchFeedPageGraphql } from "lib/api/services/properties";

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
];

// Precious metals section (gold group) — live price pages. Daily refresh:
// rates move continuously and each page's headline number changes with them.
const METAL_SLUGS = [
  "gold",
  "silver",
  "platinum",
  "palladium",
  "bitcoin",
  "ethereum",
  "copper",
  "diamond",
  "steel",
] as const;

const METAL_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  ...METAL_SLUGS.map((slug) => ({
    path: `/${slug}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  })),
  { path: "/metals/compare", changeFrequency: "weekly" as const, priority: 0.5 },
];

// Unit-rate programmatic pages (/gold/tola, /silver/gram, …). Only gold and
// silver — the metals quoted in traditional Nepali units with genuine
// per-unit search demand.
const METAL_UNIT_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = ["gold", "silver"].flatMap((metal) =>
  UNIT_RATE_UNITS.map((u) => ({
    path: `/${metal}/${u.id}`,
    changeFrequency: "daily" as const,
    priority: 0.6,
  })),
);

// Programmatic conversion-pair pages (/convertor/ropani-to-square-feet, …).
// Static tool content — factors never change — so a monthly refresh is plenty.
const CONVERSION_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = CONVERSION_PAIRS.map((p) => ({
  path: `/convertor/${p.slug}`,
  changeFrequency: "monthly",
  priority: 0.6,
}));

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

/**
 * Only advertise district area guides that have at least one verified listing.
 * Empty districts render noindex on-page — listing them in the sitemap wastes
 * crawl budget and creates GSC "Indexed though blocked" noise.
 */
async function districtRoutesWithInventory(): Promise<
  Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }>
> {
  const checks = await Promise.all(
    DISTRICT_CATALOG.map(async (d) => {
      try {
        const feed = await fetchFeedPageGraphql({
          first: 1,
          district: d.name,
        });
        return feed.items.length > 0 ? d : null;
      } catch {
        return null;
      }
    }),
  );

  return checks
    .filter((d): d is (typeof DISTRICT_CATALOG)[number] => d != null)
    .map((d) => ({
      path: `/area-guid/${d.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
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

  let districtRoutes: Awaited<ReturnType<typeof districtRoutesWithInventory>> =
    [];
  try {
    districtRoutes = await districtRoutesWithInventory();
  } catch {
    districtRoutes = [];
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
  function withAlternates(
    entry: MetadataRoute.Sitemap[number],
  ): MetadataRoute.Sitemap[number] {
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
    ...CONVERSION_ROUTES.map((route) =>
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
    ...districtRoutes.map((route) =>
      withAlternates({
        url: `${SITE_URL}${route.path}`,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      }),
    ),
    // Precious metals (gold group) — no language alternates: the metals app
    // is English-only for now.
    ...METAL_ROUTES.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...METAL_UNIT_ROUTES.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
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
