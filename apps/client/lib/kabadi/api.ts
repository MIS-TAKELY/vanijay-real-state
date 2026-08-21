/**
 * Client-side API helpers for fetching kabadi/scrape data from the backend.
 */

import { apiFetch } from "lib/api/core/client";

export interface KabadiCategoryData {
  id: string;
  slug: string;
  name: string;
  nepali?: string | null;
  icon?: string | null;
  blurb?: string | null;
  sortOrder: number;
  published: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  heroImage?: string | null;
  body?: string | null;
  faq?: { q: string; a: string }[] | null;
  items: KabadiItemData[];
}

export interface KabadiItemData {
  id: string;
  name: string;
  nepali?: string | null;
  unit: string;
  rate: string;
  note?: string | null;
  popular: boolean;
  sortOrder: number;
  published: boolean;
}

/**
 * Fetch published kabadi categories with their items.
 * Server-side: uses internal API URL. Client-side: uses NEXT_PUBLIC_API_URL.
 *
 * skipServerCookies: these are public endpoints. Reading cookies() inside
 * generateMetadata / generateStaticParams pages makes Next throw
 * "Page changed from static to dynamic at runtime … reason: cookies".
 */
export async function fetchKabadiCategories(): Promise<KabadiCategoryData[]> {
  return apiFetch<KabadiCategoryData[]>("/api/v1/kabadi/categories", {
    skipServerCookies: true,
    cache: "force-cache",
    next: { revalidate: 3600, tags: ["kabadi"] },
  });
}

/**
 * Fetch a single kabadi category by slug with all its items.
 */
export async function fetchKabadiCategoryBySlug(
  slug: string,
): Promise<KabadiCategoryData | null> {
  try {
    return await apiFetch<KabadiCategoryData>(
      `/api/v1/kabadi/categories/${slug}`,
      {
        skipServerCookies: true,
        cache: "force-cache",
        next: { revalidate: 3600, tags: ["kabadi", `kabadi-${slug}`] },
      },
    );
  } catch {
    return null;
  }
}
