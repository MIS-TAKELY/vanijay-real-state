// Browser-facing API helpers for the admin app. Admin REST endpoints live under
// /api/v1/admin/* on the NestJS API and require an authenticated ADMIN session.
// We forward cookies (same-origin after the /api/auth rewrite + CORS credentials)
// so better-auth sessions authenticate the calls.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  path: string,
  opts: {
    method?: string;
    body?: unknown;
    query?: Record<string, string | number | undefined>;
  } = {},
): Promise<T> {
  const { method = "GET", body, query } = opts;
  const url = new URL(`${API_BASE}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    });
  }

  const res = await fetch(url.toString(), {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    let details: unknown;
    try {
      details = await res.json();
    } catch {
      details = await res.text();
    }
    throw new ApiError(
      `API ${method} ${path} failed (${res.status})`,
      res.status,
      details,
    );
  }
  return res.json() as Promise<T>;
}

// ---- Admin domain helpers ----

export function adminOverview() {
  return apiFetch<AdminOverview>("/api/v1/admin/overview");
}

export function adminAuditLog(take = 100) {
  return apiFetch<AuditRow[]>("/api/v1/admin/audit-log", { query: { take } });
}

export function adminProperties(params: {
  search?: string;
  status?: string;
  take?: number;
  skip?: number;
}) {
  return apiFetch<{ items: AdminProperty[]; total: number }>(
    "/api/v1/admin/properties",
    {
      query: {
        search: params.search,
        status: params.status,
        take: params.take,
        skip: params.skip,
      },
    },
  );
}

export function adminVerificationQueue() {
  return apiFetch<AdminProperty[]>("/api/v1/admin/verification-queue");
}

export function adminModerateProperty(
  id: string,
  patch: {
    status?: string;
    adminNote?: string;
    isFeatured?: boolean;
    verificationLevel?: string;
  },
) {
  return apiFetch<AdminProperty>(`/api/v1/admin/properties/${id}/moderate`, {
    method: "PATCH",
    body: patch,
  });
}

export function adminProperty(id: string) {
  return apiFetch<AdminPropertyDetail>(`/api/v1/admin/properties/${id}`);
}

export function adminUpdateProperty(id: string, patch: AdminPropertyPatch) {
  return apiFetch<AdminPropertyDetail>(`/api/v1/admin/properties/${id}`, {
    method: "PATCH",
    body: patch,
  });
}

// ---- Uploads (media / documents on the shared /api/v1/uploads endpoint) ----
// Used by the shared listing wizard on the admin edit screen.

export interface AdminUploadedAsset {
  url: string;
  secureUrl?: string;
  publicId?: string;
  originalFilename?: string;
}

async function adminUploadForm(
  file: File,
  folder: string,
): Promise<AdminUploadedAsset> {
  const formData = new FormData();
  formData.append("file", file);
  const url = new URL(`${API_BASE}/api/v1/uploads`);
  url.searchParams.set("folder", folder);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000);
  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "POST",
      body: formData,
      credentials: "include",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
  if (!res.ok) {
    let details: unknown;
    try {
      details = await res.json();
    } catch {
      details = await res.text();
    }
    throw new ApiError(`Upload failed (${res.status})`, res.status, details);
  }
  return res.json() as Promise<AdminUploadedAsset>;
}

export function adminUploadFile(file: File, folder = "properties") {
  return adminUploadForm(file, folder);
}

export async function adminUploadFiles(files: File[], folder = "properties") {
  if (files.length === 0) return [];
  const results: AdminUploadedAsset[] = [];
  let lastError: unknown = null;
  for (const file of files) {
    try {
      results.push(await adminUploadForm(file, folder));
    } catch (error) {
      lastError = error;
    }
  }
  if (results.length === 0 && lastError) throw lastError;
  return results;
}

export async function adminDeleteUpload(publicId: string) {
  const res = await fetch(
    `${API_BASE}/api/v1/uploads/${encodeURIComponent(publicId)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  if (!res.ok) throw new ApiError(`Delete failed (${res.status})`, res.status);
  return res.json() as Promise<{ result: string }>;
}

export function adminDocuments() {
  return apiFetch<unknown[]>("/api/v1/admin/documents");
}

export function adminUsers(q?: string) {
  return apiFetch<AdminUser[]>("/api/v1/admin/users", { query: { q } });
}

// CMS

export function cmsList(placement: string, slot?: string, admin = true) {
  const base = admin ? "/api/v1/admin/cms" : "/api/v1/cms";
  return apiFetch<CmsItem[]>(base, { query: { placement, slot } });
}

export function cmsUpsert(
  placement: string,
  slot: string,
  item: Record<string, unknown>,
) {
  return apiFetch<CmsItem>(`/api/v1/admin/cms/${placement}/${slot}`, {
    method: "POST",
    body: item,
  });
}

export function cmsUpdate(id: string, patch: Record<string, unknown>) {
  return apiFetch<CmsItem>(`/api/v1/admin/cms/items/${id}`, {
    method: "PATCH",
    body: patch,
  });
}

export function cmsPublish(id: string, published: boolean) {
  return apiFetch<CmsItem>(`/api/v1/admin/cms/items/${id}/publish`, {
    method: "PATCH",
    body: { published },
  });
}

export function cmsReorder(placement: string, slot: string, ids: string[]) {
  return apiFetch<CmsItem[]>(`/api/v1/admin/cms/${placement}/${slot}/reorder`, {
    method: "POST",
    body: { ids },
  });
}

export function cmsDelete(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/v1/admin/cms/items/${id}`, {
    method: "DELETE",
  });
}

// Convenience wrappers used by the CMS admin pages.

export type CmsContentItem = CmsItem;

export function cmsListItems(placement: string, slot?: string) {
  return cmsList(placement, slot, true) as Promise<CmsContentItem[]>;
}

export function cmsUpsertItem(item: {
  placement: string;
  slot: string;
  key: string;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  image?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  metadata?: unknown | null;
  sortOrder?: number;
  published?: boolean;
}) {
  return cmsUpsert(item.placement, item.slot, {
    key: item.key,
    title: item.title,
    subtitle: item.subtitle,
    body: item.body,
    image: item.image,
    ctaLabel: item.ctaLabel,
    ctaHref: item.ctaHref,
    metadata: item.metadata,
    sortOrder: item.sortOrder,
    published: item.published,
  }) as Promise<CmsContentItem>;
}

export function listingPerformance(days = 365) {
  return apiFetch<ListingPerformanceData>("/api/v1/admin/analytics/listings", {
    query: { days },
  });
}

// Gold

export function goldMetals() {
  return apiFetch<MetalConfig[]>("/api/v1/admin/gold/metals");
}

export function goldUpsertMetal(metal: Record<string, unknown>) {
  return apiFetch<MetalConfig>("/api/v1/admin/gold/metals", {
    method: "POST",
    body: metal,
  });
}

export function goldSetFaqs(
  slug: string,
  faqs: { question: string; answer: string; sortOrder?: number }[],
) {
  return apiFetch<unknown[]>("/api/v1/admin/gold/metals/" + slug + "/faqs", {
    method: "POST",
    body: { faqs },
  });
}

export function goldSetOverride(o: {
  metalSlug: string;
  ask?: number;
  bid?: number;
  unit?: string;
  currency?: string;
  note?: string;
}) {
  return apiFetch<unknown>("/api/v1/admin/gold/overrides", {
    method: "POST",
    body: o,
  });
}

// Kabadi

export function kabadiCategories(admin = true) {
  return apiFetch<KabadiCategory[]>(
    admin ? "/api/v1/admin/kabadi/categories" : "/api/v1/kabadi/categories",
  );
}

export function kabadiUpsertItem(item: Record<string, unknown>) {
  return apiFetch<unknown>("/api/v1/admin/kabadi/items", {
    method: "POST",
    body: item,
  });
}

export function kabadiSetRates(items: Record<string, unknown>[]) {
  return apiFetch<unknown[]>("/api/v1/admin/kabadi/items/bulk", {
    method: "POST",
    body: { items },
  });
}

export function kabadiDeleteItem(id: string) {
  return apiFetch<{ deleted: boolean }>("/api/v1/admin/kabadi/items/" + id, {
    method: "DELETE",
  });
}

// Analytics

export interface KpiValue {
  value: number;
  delta: number;
}

export interface AnalyticsOverviewData {
  views: KpiValue;
  uniqueViewers: KpiValue;
  searches: KpiValue;
  inquiries: KpiValue;
  phoneClicks: KpiValue;
  favorites: KpiValue;
  cartAdds: KpiValue;
  shares: KpiValue;
  newListings: KpiValue;
  newUsers: KpiValue;
}

export interface FunnelStep {
  step: string;
  value: number;
}

export interface ActivityDay {
  date: string;
  views: number;
  searches: number;
  inquiries: number;
  phoneClicks: number;
  favorites: number;
  cartAdds: number;
  shares: number;
  listings: number;
  users: number;
  questions: number;
  answers: number;
}

export interface TopListing {
  id: string;
  listingCode: string;
  title: string;
  slug: string;
  status: string;
  mainCategory: string;
  subCategory: string;
  askingPrice: number;
  location: string;
  views: number;
  inquiries: number;
  favorites: number;
  phoneClicks: number;
}

export interface ListingPerformanceData {
  top: TopListing[];
  byType: { mainCategory: string; _count: { _all: number } }[];
  byStatus: { status: string; _count: { _all: number } }[];
}

export interface MarketPoint {
  month: string;
  avgAsking: number;
  listingCount: number;
  avgSold: number;
  soldCount: number;
  avgSoldPerAana: number;
}

export interface SearchInsightsData {
  topQueries: { query: string; count: number }[];
  topDistricts: { district: string; count: number }[];
}

export interface LeadsData {
  byType: { type: string; _count: { _all: number } }[];
  byStatus: { status: string; _count: { _all: number } }[];
  byVerified: { isVerifiedLead: boolean; _count: { _all: number } }[];
  total: number;
}

export interface GeographyData {
  district: string;
  views: number;
}

export interface PlatformHealthData {
  sharesByPlatform: { platform: string; count: number }[];
  appointmentsByStatus: { status: string; count: number }[];
  qaActivity: { date: string; questions: number; answers: number }[];
}

// Settings

export function getSettings() {
  return apiFetch<Record<string, unknown>>("/api/v1/admin/settings");
}

export function updateSettings(data: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>("/api/v1/admin/settings", {
    method: "PUT",
    body: data,
  });
}

// Updates the admin's own account email directly in the database.
export function adminUpdateEmail(newEmail: string) {
  return apiFetch<{ id: string; name: string; email: string; role: string[] }>(
    "/api/v1/admin/account/email",
    { method: "PATCH", body: { newEmail } },
  );
}

// ---- Types ----

export interface AdminOverview {
  totalProperties: number;
  totalUsers: number;
  totalSellers: number;
  totalDocuments: number;
  documentsExpiring: number;
  totalContentItems: number;
  totalKabadiItems: number;
  totalInquiries: number;
  totalAppointments: number;
  totalAuditLogs: number;
  propertiesByStatus: { status: string; _count: { _all: number } }[];
}

export interface AuditRow {
  id: string;
  actor: { id: string; name: string; email: string };
  action: string;
  entity: string;
  entityId?: string | null;
  summary?: string | null;
  createdAt: string;
}

export interface AdminProperty {
  id: string;
  listingCode: string;
  title: string;
  status: string;
  mainCategory: string;
  subCategory: string;
  askingPrice: string;
  isFeatured: boolean;
  owner?: { id: string; name: string; email: string } | null;
  location?: {
    district?: string;
    municipality?: string;
    areaName?: string;
  } | null;
  createdAt: string;
}

export interface AdminPropertyDetail extends AdminProperty {
  slug: string;
  description?: string | null;
  verificationLevel: string;
  pricePerAana?: string | null;
  originalAskingPrice?: string | null;
  roadAccessWidthFt?: number | null;
  roadType?: string | null;
  facing?: string | null;
  isCornerPlot: boolean;
  isNegotiable?: boolean;
  minBuyableLandSqFt?: number | null;
  minBuyableUnitSystem?: string | null;
  minBuyableRopani?: number | null;
  minBuyableAana?: number | null;
  minBuyablePaisa?: number | null;
  minBuyableDaam?: number | null;
  minBuyableBigha?: number | null;
  minBuyableKatha?: number | null;
  minBuyableDhur?: number | null;
  // Type-specific Step 3 specs
  builtUpAreaSqFt?: number | null;
  propertySubtype?: string | null;
  yearBuilt?: number | null;
  constructionStatus?: string | null;
  floorNumber?: number | null;
  totalFloors?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  livingRooms?: number | null;
  kitchens?: number | null;
  balconies?: number | null;
  parking?: string | null;
  furnishing?: string | null;
  houseFacing?: string | null;
  amenities?: string[] | null;
  plotShape?: string | null;
  frontageFt?: number | null;
  boundaryWall?: string | null;
  landClearance?: boolean | null;
  depthFt?: number | null;
  zoning?: string | null;
  setbackAvailable?: boolean | null;
  setbackText?: string | null;
  suitableFor?: string[] | null;
  parkingSpaces?: number | null;
  landClassification?: string | null;
  soilType?: string | null;
  waterSources?: string[] | null;
  irrigationType?: string | null;
  currentCrops?: string | null;
  fencing?: string | null;
  electricityAvailable?: boolean | null;
  terrain?: string | null;
  annualYield?: string | null;
  farmStructures?: string[] | null;
  ceilingHeightFt?: number | null;
  parkingAvailable?: boolean | null;
  parkingType?: string | null;
  priceType?: string | null;
  leaseAvailable?: boolean | null;
  leaseMonthlyRent?: number | null;
  commercialFeatures?: string[] | null;
  zoningLegal?: string | null;
  heritageType?: string | null;
  heritageEra?: string | null;
  heritageGrade?: string | null;
  courtyard?: string | null;
  traditionalFeatures?: string[] | null;
  renovationStatus?: string | null;
  adminNote?: string | null;
  agentId?: string | null;
  location?: {
    province: string;
    district: string;
    municipality: string;
    wardNumber: number;
    areaName: string;
    addressText?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  landArea?: {
    ropani: number;
    aana: number;
    paisa: number;
    daam: number;
    bigha?: number | null;
    katha?: number | null;
    dhur?: number | null;
    totalSqFt: number;
    totalSqMeters: number;
  } | null;
  media?: {
    id: string;
    type: string;
    url: string;
    altText?: string | null;
    sortOrder: number;
    isCover: boolean;
  }[];
  agent?: { id: string; name: string; email: string } | null;
}

export interface AdminPropertyPatch {
  title?: string;
  description?: string | null;
  mainCategory?: string;
  subCategory?: string;
  status?: string;
  askingPrice?: number;
  pricePerAana?: number | null;
  roadAccessWidthFt?: number | null;
  roadType?: string | null;
  facing?: string | null;
  isCornerPlot?: boolean;
  isFeatured?: boolean;
  isNegotiable?: boolean;
  minBuyableLandSqFt?: number | null;
  minBuyableUnitSystem?: string | null;
  minBuyableRopani?: number | null;
  minBuyableAana?: number | null;
  minBuyablePaisa?: number | null;
  minBuyableDaam?: number | null;
  minBuyableBigha?: number | null;
  minBuyableKatha?: number | null;
  minBuyableDhur?: number | null;
  // Type-specific Step 3 specs
  builtUpAreaSqFt?: number | null;
  propertySubtype?: string | null;
  yearBuilt?: number | null;
  constructionStatus?: string | null;
  floorNumber?: number | null;
  totalFloors?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  livingRooms?: number | null;
  kitchens?: number | null;
  balconies?: number | null;
  parking?: string | null;
  furnishing?: string | null;
  houseFacing?: string | null;
  amenities?: string[];
  plotShape?: string | null;
  frontageFt?: number | null;
  boundaryWall?: string | null;
  landClearance?: boolean;
  depthFt?: number | null;
  zoning?: string | null;
  setbackAvailable?: boolean;
  setbackText?: string | null;
  suitableFor?: string[];
  parkingSpaces?: number | null;
  landClassification?: string | null;
  soilType?: string | null;
  waterSources?: string[];
  irrigationType?: string | null;
  currentCrops?: string | null;
  fencing?: string | null;
  electricityAvailable?: boolean;
  terrain?: string | null;
  annualYield?: string | null;
  farmStructures?: string[];
  ceilingHeightFt?: number | null;
  parkingAvailable?: boolean;
  parkingType?: string | null;
  priceType?: string | null;
  leaseAvailable?: boolean;
  leaseMonthlyRent?: number | null;
  commercialFeatures?: string[];
  zoningLegal?: string | null;
  heritageType?: string | null;
  heritageEra?: string | null;
  heritageGrade?: string | null;
  courtyard?: string | null;
  traditionalFeatures?: string[];
  renovationStatus?: string | null;
  adminNote?: string | null;
  location?: {
    province: string;
    district: string;
    municipality: string;
    wardNumber: number;
    areaName: string;
    addressText?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  landArea?: {
    ropani?: number;
    aana?: number;
    paisa?: number;
    daam?: number;
    bigha?: number | null;
    katha?: number | null;
    dhur?: number | null;
    totalSqFt?: number;
    totalSqMeters?: number;
  };
  media?: {
    url: string;
    altText?: string | null;
    type?: string;
    sortOrder?: number;
    isCover?: boolean;
  }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string[];
  image?: string | null;
  createdAt: string;
}

export interface CmsItem {
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
  metadata?: unknown | null;
  sortOrder: number;
  published: boolean;
}

export interface MetalConfig {
  id: string;
  slug: string;
  name: string;
  symbol?: string | null;
  isEnabled: boolean;
  description?: string | null;
  accentColor?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface KabadiCategory {
  id: string;
  slug: string;
  name: string;
  nepali?: string | null;
  icon?: string | null;
  blurb?: string | null;
  sortOrder: number;
  published: boolean;
  items: {
    id: string;
    name: string;
    nepali?: string | null;
    unit: string;
    rate: string;
    note?: string | null;
    popular: boolean;
    sortOrder: number;
    published: boolean;
  }[];
}
