import { apiFetch } from "../../core/client";
import { API_ENDPOINTS } from "../../core/endpoints";
import type { CmsCategory, CmsContentItem, CmsHeroSlide } from "./types";

/** `ContentPlacement` enum values from the API. */
export const CMS_PLACEMENTS = {
  realStateHome: "REAL_STATE_HOME",
  realStateStatic: "REAL_STATE_STATIC",
  gold: "GOLD",
  kabadi: "KABADI",
  global: "GLOBAL",
} as const;

/** `ContentSlot` enum values from the API. */
export const CMS_SLOTS = {
  heroBanner: "HERO_BANNER",
  category: "CATEGORY",
  section: "SECTION",
  contentBlock: "CONTENT_BLOCK",
  faq: "FAQ",
  howItWorks: "HOW_IT_WORKS",
  cta: "CTA",
} as const;

/** Published content items for a placement (optionally one slot), ordered by sortOrder. */
export function fetchCmsItems(
  placement: string,
  slot?: string,
): Promise<CmsContentItem[]> {
  return apiFetch<CmsContentItem[]>(API_ENDPOINTS.cms.items(placement), {
    query: slot ? { slot } : undefined,
  });
}

/**
 * Category tiles for the real-state homepage strip. The API returns only
 * published items ordered by `sortOrder`, so the admin-set display order is
 * respected out of the box.
 */
export async function fetchCmsCategories(
  placement = CMS_PLACEMENTS.realStateHome,
): Promise<CmsCategory[]> {
  const items = await fetchCmsItems(placement, CMS_SLOTS.category);
  return items
    .filter((item) => item.published && item.image)
    .map((item) => ({
      key: item.key,
      name: item.title || item.key,
      image: item.image as string,
    }));
}

/**
 * Homepage hero slides. The API returns only published items ordered by
 * `sortOrder`, so the admin drag-and-drop order is what the carousel shows.
 */
export async function fetchCmsHeroBanners(
  placement = CMS_PLACEMENTS.realStateHome,
): Promise<CmsHeroSlide[]> {
  const items = await fetchCmsItems(placement, CMS_SLOTS.heroBanner);
  return items
    .filter((item) => item.published && item.image)
    .map((item) => ({
      key: item.key,
      image: item.image as string,
      headline: item.title || "",
      subheadline: item.subtitle || "",
      ctaPrimary: item.ctaLabel || "Explore Properties",
      ctaHref: item.ctaHref || "/search",
    }));
}
