/**
 * Canonical public origin for the site. Single source of truth for absolute
 * URLs in page metadata, JSON-LD, the sitemap and robots.txt. Override per
 * environment with NEXT_PUBLIC_SITE_URL (e.g. https://malpoth.com in prod).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lekhaprati.com";
