/** One row from the polymorphic CMS content store (`ContentItem`). */
export interface CmsContentItem {
  id: string;
  placement: string;
  slot: string;
  key: string;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  image?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  /** Per-slot extras (e.g. mainCategory for category tiles). */
  metadata?: Record<string, unknown> | null;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A category tile rendered in the real-state homepage category strip. */
export interface CmsCategory {
  /** Stable slug (e.g. "residential") — used as the React key. */
  key: string;
  /** Display name shown under the tile. */
  name: string;
  /** Tile image URL. */
  image: string;
}

/** A homepage hero carousel slide published through the admin CMS. */
export interface CmsHeroSlide {
  key: string;
  image: string;
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaHref: string;
}

/** One FAQ row (question + answer) published through the admin CMS. */
export interface CmsFaq {
  q: string;
  a: string;
}

/** Footer content managed through the admin CMS.
 *  Two singleton items in the FOOTER slot: one for brand tagline,
 *  one for contact details. */
export interface CmsFooterContent {
  /** Brand tagline shown under the logo. Falls back to the hardcoded
   *  default when the CMS item is missing or unpublished. */
  tagline: string;
  /** Address line (e.g. "Bajraha, Itahari"). */
  address: string;
  /** Email address. */
  email: string;
  /** Phone number. */
  phone: string;
}
