import { apiFetch } from "../../core/client";
import { API_ENDPOINTS } from "../../core/endpoints";
import type {
  CmsCategory,
  CmsContentItem,
  CmsFaq,
  CmsFooterContent,
  CmsHeroSlide,
} from "./types";

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
  footer: "FOOTER",
  howItWorks: "HOW_IT_WORKS",
  cta: "CTA",
} as const;

/** Published content items for a placement (optionally one slot), ordered by sortOrder.
 *  Cached at the edge for 5 min so server components can render CMS content
 *  into the initial HTML without slowing down the response. */
export function fetchCmsItems(
  placement: string,
  slot?: string,
): Promise<CmsContentItem[]> {
  return apiFetch<CmsContentItem[]>(API_ENDPOINTS.cms.items(placement), {
    query: slot ? { slot } : undefined,
    next: { revalidate: 300, tags: ["cms"] },
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

/**
 * Homepage FAQ items managed through the admin CMS. The API returns only
 * published FAQ-slot items ordered by `sortOrder` (question in `title`,
 * answer in `body`). Returns an empty array when nothing is published —
 * callers fall back to their static defaults.
 */
export async function fetchCmsFaqs(
  placement = CMS_PLACEMENTS.realStateHome,
): Promise<CmsFaq[]> {
  const items = await fetchCmsItems(placement, CMS_SLOTS.faq);
  return items
    .filter((item) => item.published && item.title && item.body)
    .map((item) => ({
      q: item.title as string,
      a: item.body as string,
    }));
}

/** Footer content (brand tagline + contact info) managed through the
 *  admin CMS. Two singleton items in the FOOTER slot — `brand` (tagline
 *  in `body`) and `contact` (address/email/phone in `metadata`).
 *  Returns hardcoded defaults when nothing is published or the API is down. */
const FOOTER_DEFAULTS: CmsFooterContent = {
  tagline:
    "Nepal\u2019s first institutional land archive. Professionalizing " +
    "real estate through rigorous field verification and legal " +
    "transparency.",
  address: "Bajraha, Itahari",
  email: "hello@malpoth.com",
  phone: "+977 9702634469",
};

export async function fetchCmsFooterContent(
  placement = CMS_PLACEMENTS.realStateHome,
): Promise<CmsFooterContent> {
  try {
    const items = await fetchCmsItems(placement, CMS_SLOTS.footer);
    const result = { ...FOOTER_DEFAULTS };
    for (const item of items) {
      if (!item.published) continue;
      if (item.key === "brand" && item.body) {
        result.tagline = item.body;
      }
      if (item.key === "contact" && item.metadata) {
        const meta = item.metadata as Record<string, unknown>;
        if (typeof meta.address === "string") result.address = meta.address;
        if (typeof meta.email === "string") result.email = meta.email;
        if (typeof meta.phone === "string") result.phone = meta.phone;
      }
    }
    return result;
  } catch {
    return FOOTER_DEFAULTS;
  }
}
