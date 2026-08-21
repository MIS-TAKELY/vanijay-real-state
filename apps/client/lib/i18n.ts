/**
 * Centralized internationalisation configuration.
 *
 * Single source of truth for:
 * - Supported languages and their ISO 639-1 codes
 * - The default/fallback language
 * - Hreflang helper that generates the `alternates.languages` map for any path
 *
 * To add a new language:
 * 1. Add it to the `LANGUAGES` map below
 * 2. Add the locale prefix routing in next.config.js rewrites (if using prefix)
 *    OR set up middleware-based locale detection (if using subdomain/subdir)
 * 3. Set `enabled: true` so hreflang tags are emitted
 * 4. Add translated content
 */

import { SITE_URL } from "./site";

export interface Language {
  /** ISO 639-1 code (e.g. "en", "ne"). */
  code: string;
  /** Human-readable label (e.g. "English", "नेपाली"). */
  label: string;
  /** BCP 47 locale tag for OpenGraph `og:locale` (e.g. "en_US", "ne_NP"). */
  ogLocale: string;
  /** Whether this language is currently active and should emit hreflang tags. */
  enabled: boolean;
}

/**
 * All supported languages.
 *
 * `enabled: false` languages are documented but do NOT emit hreflang tags —
 * this prevents crawlers from hitting 404s for pages that don't exist yet.
 * Flip to `true` when the translated routes are live.
 */
export const LANGUAGES: Record<string, Language> = {
  en: {
    code: "en",
    label: "English",
    ogLocale: "en_US",
    enabled: true,
  },
  ne: {
    code: "ne",
    label: "नेपाली",
    ogLocale: "ne_NP",
    // Set to `true` when Nepali routes (/ne/*) are deployed.
    enabled: false,
  },
};

/** The default (fallback) language code. */
export const DEFAULT_LOCALE = "en";

/**
 * Build the `alternates.languages` map for Next.js metadata.
 *
 * Usage in a page's `generateMetadata`:
 * ```ts
 * alternates: {
 *   canonical: `/my-page`,
 *   languages: buildHreflang(`/my-page`),
 * }
 * ```
 *
 * Returns an object like:
 * ```json
 * {
 *   "en": "/my-page",
 *   "x-default": "/my-page"
 * }
 * ```
 *
 * When Nepali is enabled, it would additionally include:
 * ```json
 * { "ne": "/ne/my-page" }
 * ```
 */
export function buildHreflang(
  /** The path for the current (default-language) page, e.g. "/" or "/my-slug". */
  path: string,
): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const [code, lang] of Object.entries(LANGUAGES)) {
    if (!lang.enabled) continue;

    if (code === DEFAULT_LOCALE) {
      // Default language: the canonical path itself
      languages[code] = path;
    } else {
      // Other enabled languages: prefixed with their locale code
      languages[code] = `/${code}${path}`;
    }
  }

  // x-default always points to the default language
  languages["x-default"] = path;

  return languages;
}

/**
 * Build OpenGraph `locale` and `alternateLocales` for a given language.
 *
 * Usage:
 * ```ts
 * openGraph: {
 *   ...ogLocaleFor("en"),
 * }
 * ```
 */
export function ogLocaleFor(
  langCode: string = DEFAULT_LOCALE,
): { locale: string; alternateLocales: string[] } {
  const lang = LANGUAGES[langCode] ?? LANGUAGES[DEFAULT_LOCALE]!;
  const enabledLocales = Object.values(LANGUAGES)
    .filter((l) => l.enabled && l.code !== langCode)
    .map((l) => l.ogLocale);

  return {
    locale: lang.ogLocale,
    alternateLocales: enabledLocales,
  };
}
