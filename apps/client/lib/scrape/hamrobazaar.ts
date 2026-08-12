import { findCategory, HAMROBAZAAR_DEFAULT_CATEGORY } from "./categories";
import { SAMPLE_HAMROBAZAAR_LISTINGS } from "./sample-data";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface HamrobazaarListing {
  id: string;
  title: string;
  price: number; // NPR
  categoryName: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  description: string;
  createdTime: string;
  seller: string;
  negotiable: boolean;
  condition: string;
  detailUrl: string;
}

export interface ScrapeParams {
  categoryId?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface ScrapeResult {
  source: "live" | "sample";
  usedFallback: boolean;
  items: HamrobazaarListing[];
  totalRecords: number;
  page: number;
  pageSize: number;
  fetchedAt: string;
  durationMs: number;
  error?: string;
}

/* ------------------------------------------------------------------ */
/* Pure helpers (also used by the dashboard UI)                        */
/* ------------------------------------------------------------------ */

const DEVANAGARI_DIGITS: Record<string, string> = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

/** Convert Devanagari numerals (०-९) to ASCII digits. */
export function normalizeNepaliDigits(input: string): string {
  return input.replace(/[०-९]/g, (ch) => DEVANAGARI_DIGITS[ch] ?? ch);
}

/** Kebab-case slug for the detail-URL path segment. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/**
 * Format an NPR amount using the Indian/Nepali digit grouping
 * (1,00,000 → "1,00,000"). Falls back to locale grouping for small values.
 */
export function formatNepaliNumber(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.round(Math.abs(value));
  const s = String(abs);
  if (s.length <= 3) return `${sign}${s}`;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const groups: string[] = [last3];
  while (rest.length > 2) {
    groups.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest.length > 0) groups.unshift(rest);
  return `${sign}${groups.join(",")}`;
}

export function formatPrice(price: number): string {
  if (!price) return "Negotiable";
  return `Rs ${formatNepaliNumber(price)}`;
}

/* ------------------------------------------------------------------ */
/* Scraper (server-side only)                                          */
/* ------------------------------------------------------------------ */

const HAMROBAZAAR_API = "https://hamrobazaar.com/api/products/list/latest";
const REQUEST_TIMEOUT_MS = 15_000;

const BROWSER_HEADERS: Record<string, string> = {
  Accept: "application/json, text/plain, */*",
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Origin: "https://hamrobazaar.com",
  Referer: "https://hamrobazaar.com/",
};

const CONDITION_LABELS: Record<number, string> = {
  0: "Brand New",
  1: "Like New",
  2: "Used / Secondhand",
  3: "Refurbished",
};

interface RawLocation {
  locationDescription?: string | null;
  locationLatitude?: number | null;
  locationLongitude?: number | null;
}

interface RawProduct {
  id?: string;
  name?: string;
  price?: number;
  newPrice?: number;
  categoryName?: string;
  description?: string;
  createdTime?: string;
  imageUrl?: string | null;
  negotiable?: boolean;
  condition?: number | null;
  location?: RawLocation | null;
  productMedia?: Array<{ locationKey?: string }> | null;
  creatorInfo?: { createdByName?: string } | null;
}

interface RawApiResponse {
  succeeded?: boolean;
  data?: RawProduct[] | null;
  totalRecords?: number;
  pageNumber?: number;
  pageSize?: number;
  message?: string | null;
  errors?: unknown;
}

function normalizeProduct(raw: RawProduct, categoryDetailPath: string): HamrobazaarListing | null {
  const id = raw.id;
  const title = (raw.name ?? "").trim();
  if (!id || !title) return null;

  const rawPrice = typeof raw.price === "number" ? raw.price : 0;
  const mediaUrl = raw.productMedia?.find((m) => m.locationKey)?.locationKey ?? null;

  return {
    id,
    title: normalizeNepaliDigits(title),
    price: rawPrice,
    categoryName: normalizeNepaliDigits(raw.categoryName ?? ""),
    location: normalizeNepaliDigits(raw.location?.locationDescription ?? "") || "Location not specified",
    latitude: raw.location?.locationLatitude ?? null,
    longitude: raw.location?.locationLongitude ?? null,
    imageUrl: raw.imageUrl ?? mediaUrl,
    description: normalizeNepaliDigits(raw.description ?? "").slice(0, 240),
    createdTime: raw.createdTime ?? "",
    seller: raw.creatorInfo?.createdByName ?? "Unknown seller",
    negotiable: raw.negotiable ?? false,
    condition:
      raw.condition !== null && raw.condition !== undefined
        ? CONDITION_LABELS[raw.condition] ?? "Other"
        : "Other",
    detailUrl: `/detail/${categoryDetailPath}/${slugify(title)}/${id}`,
  };
}

export async function scrapeHamrobazaar(
  params: ScrapeParams = {},
): Promise<ScrapeResult> {
  const startedAt = Date.now();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 12));

  const category = params.categoryId
    ? findCategory(params.categoryId)
    : undefined;
  const categoryId = category?.id ?? HAMROBAZAAR_DEFAULT_CATEGORY.id;
  const detailPath = category?.detailPath ?? HAMROBAZAAR_DEFAULT_CATEGORY.detailPath;

  const query = new URLSearchParams({
    PageNumber: String(page),
    PageSize: String(pageSize),
    CategoryId: categoryId,
    IsHBSelect: "false",
  });
  const keyword = params.keyword?.trim();
  if (keyword) query.set("search", keyword);

  try {
    const res = await fetch(`${HAMROBAZAAR_API}?${query.toString()}`, {
      headers: BROWSER_HEADERS,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`Hamrobazaar responded ${res.status} (${res.statusText})`);
    }

    const json = (await res.json()) as RawApiResponse;
    if (!json.succeeded) {
      throw new Error(json.message ?? "Hamrobazaar API rejected the request");
    }

    const items = (json.data ?? [])
      .map((p) => normalizeProduct(p, detailPath))
      .filter((p): p is HamrobazaarListing => p !== null);

    return {
      source: "live",
      usedFallback: false,
      items,
      totalRecords: json.totalRecords ?? items.length,
      page: json.pageNumber ?? page,
      pageSize: json.pageSize ?? pageSize,
      fetchedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown scrape error";
    return {
      source: "sample",
      usedFallback: true,
      items: SAMPLE_HAMROBAZAAR_LISTINGS.slice(0, pageSize),
      totalRecords: SAMPLE_HAMROBAZAAR_LISTINGS.length,
      page,
      pageSize,
      fetchedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      error: message,
    };
  }
}
