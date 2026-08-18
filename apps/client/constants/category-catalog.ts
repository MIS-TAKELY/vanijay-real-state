import { HIERARCHICAL_CATEGORIES } from "./varibles-constants";

/**
 * Category archive catalog — the single source of truth for the `/category/[slug]`
 * pages. Slugs match the API's `MAIN_CATEGORY_GROUPS` keys (propertiesFeed `type`
 * param): `residential | commercial | industrial | land | institutional`.
 *
 * Sub-categories are derived from `HIERARCHICAL_CATEGORIES` (same source as the
 * listing wizard + homepage strip) so the page never drifts from the data model.
 */

export interface CategorySubType {
  key: string;
  label: string;
}

export interface CategoryEntry {
  /** URL segment + API feed `type` filter value. */
  slug: string;
  /** Prisma `MainCategory` enum value. */
  mainCategory: string;
  /** Short label used in mono accents ("LAND", "RESIDENTIAL"). */
  name: string;
  /** Gold eyebrow over the H1 — the register descriptor. */
  eyebrow: string;
  /** H1. */
  title: string;
  /** One-line description under the H1. */
  description: string;
  /** Archival volume reference printed on the register card. */
  registerRef: string;
  /** Cover image shown in the homepage category strip. */
  image: string;
  /** Indexed types inside this register (links to /search?type=<key>). */
  subTypes: CategorySubType[];
  /** SEO keywords for the page metadata. */
  keywords: string[];
}

const copy: Record<
  CategoryEntry["slug"],
  { eyebrow: string; title: string; description: string; registerRef: string; keywords: string[] }
> = {
  residential: {
    eyebrow: "Homes & living spaces",
    title: "Residential Properties for Sale in Nepal",
    description:
      "Houses, apartments and townhouses across Kathmandu Valley and beyond. Every listing is document-checked and cleared against cadastral records before it is published.",
    registerRef: "ARCH/RES-01",
    keywords: [
      "house for sale Nepal",
      "apartment for sale Kathmandu",
      "townhouse Lalitpur",
      "verified residential property Nepal",
    ],
  },
  commercial: {
    eyebrow: "Offices, retail & business spaces",
    title: "Commercial Properties for Sale in Nepal",
    description:
      "Offices, retail spaces and hospitality assets in Nepal's business districts. Ownership is cross-checked against the Malpot land ledger before any listing goes live.",
    registerRef: "ARCH/COM-02",
    keywords: [
      "commercial property Kathmandu",
      "office space for sale Nepal",
      "retail shop for sale",
      "hotel property for sale Nepal",
    ],
  },
  industrial: {
    eyebrow: "Warehouses, factories & workshops",
    title: "Industrial Properties for Sale in Nepal",
    description:
      "Warehouses, production facilities and logistics land with verified road access, zoning and title records — inspected by our field team before listing.",
    registerRef: "ARCH/IND-03",
    keywords: [
      "warehouse for sale Nepal",
      "factory land Kathmandu",
      "industrial plot for sale",
      "godown for sale Nepal",
    ],
  },
  land: {
    eyebrow: "Plots & land parcels",
    title: "Land for Sale in Nepal",
    description:
      "Residential, commercial and agricultural land with verified boundaries, road access and ownership history — cross-referenced against cadastral records, with zero title disputes.",
    registerRef: "ARCH/LND-04",
    keywords: [
      "land for sale Nepal",
      "plots for sale Kathmandu",
      "agricultural land for sale",
      "buy land verified title",
    ],
  },
  institutional: {
    eyebrow: "Healthcare, education & community",
    title: "Special Purpose Properties for Sale in Nepal",
    description:
      "Healthcare, education and community facilities with zoning and entitlement checks completed by our verification team before they reach the archive.",
    registerRef: "ARCH/SPP-05",
    keywords: [
      "institutional property Nepal",
      "school building for sale Kathmandu",
      "clinic property for sale",
      "community hall for sale Nepal",
    ],
  },
};

function buildCatalog(): CategoryEntry[] {
  return HIERARCHICAL_CATEGORIES.map((h) => {
    const upper = h.mainCategory;
    const slug = upper
      .replace("INSTITUTIONAL_SPECIALIZED", "institutional")
      .toLowerCase();
    const c = copy[slug as keyof typeof copy] ?? {
      eyebrow: h.label,
      title: `${h.label} Properties in Nepal`,
      description: `Verified ${h.label.toLowerCase()} properties across Nepal.`,
      registerRef: `ARCH/${slug.slice(0, 3).toUpperCase()}`,
      keywords: [h.label.toLowerCase()],
    };
    return {
      slug,
      mainCategory: upper,
      name: h.label,
      eyebrow: c.eyebrow,
      title: c.title,
      description: c.description,
      registerRef: c.registerRef,
      image: h.image,
      subTypes: h.subCategories.map((s) => ({ key: s.key, label: s.label })),
      keywords: c.keywords,
    };
  });
}

export const CATEGORY_CATALOG: CategoryEntry[] = buildCatalog();

export function getCategoryBySlug(
  slug: string,
): CategoryEntry | undefined {
  return CATEGORY_CATALOG.find((c) => c.slug === slug);
}

/**
 * Resolve a category tile (CMS key OR store display name) to its archive slug.
 * Used by the homepage CategoryStrip so tiles deep-link into `/category/[slug]`
 * for known categories; anything unknown resolves to `null` (handled by caller).
 */
export function resolveCategorySlug(
  keyOrName: string | undefined | null,
): string | null {
  if (!keyOrName) return null;
  const direct = getCategoryBySlug(keyOrName);
  if (direct) return direct.slug;
  const byName = CATEGORY_CATALOG.find(
    (c) => c.name.toLowerCase() === keyOrName.trim().toLowerCase(),
  );
  return byName ? byName.slug : null;
}