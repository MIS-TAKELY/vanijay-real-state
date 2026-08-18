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
