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
  opts: { method?: string; body?: unknown; query?: Record<string, string | number | undefined> } = {},
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
    throw new ApiError(`API ${method} ${path} failed (${res.status})`, res.status, details);
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

export function adminProperties(params: { search?: string; status?: string; take?: number; skip?: number }) {
  return apiFetch<{ items: AdminProperty[]; total: number }>("/api/v1/admin/properties", {
    query: { search: params.search, status: params.status, take: params.take, skip: params.skip },
  });
}

export function adminVerificationQueue() {
  return apiFetch<AdminProperty[]>("/api/v1/admin/verification-queue");
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

export function cmsUpsert(placement: string, slot: string, item: Record<string, unknown>) {
  return apiFetch<CmsItem>(`/api/v1/admin/cms/${placement}/${slot}`, { method: "POST", body: item });
}

export function cmsUpdate(id: string, patch: Record<string, unknown>) {
  return apiFetch<CmsItem>(`/api/v1/admin/cms/items/${id}`, { method: "PATCH", body: patch });
}

export function cmsPublish(id: string, published: boolean) {
  return apiFetch<CmsItem>(`/api/v1/admin/cms/items/${id}/publish`, { method: "PATCH", body: { published } });
}

export function cmsReorder(placement: string, slot: string, ids: string[]) {
  return apiFetch<CmsItem[]>(`/api/v1/admin/cms/${placement}/${slot}/reorder`, { method: "POST", body: { ids } });
}

export function cmsDelete(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/v1/admin/cms/items/${id}`, { method: "DELETE" });
}

// Convenience wrappers used by the CMS admin pages.

export type CmsContentItem = CmsItem & { metaJson?: unknown | null };

export function cmsListItems(placement: string, slot?: string) {
  return cmsList(placement, slot, true) as Promise<CmsContentItem[]>;
}

export function cmsUpsertItem(item: {
  placement: string;
  slot: string;
  key: string;
  title?: string | null;
  body?: string | null;
  metaJson?: unknown | null;
}) {
  return cmsUpsert(item.placement, item.slot, {
    key: item.key,
    title: item.title,
    body: item.body,
    metaJson: item.metaJson,
  }) as Promise<CmsContentItem>;
}

// Gold

export function goldMetals() {
  return apiFetch<MetalConfig[]>("/api/v1/admin/gold/metals");
}

export function goldUpsertMetal(metal: Record<string, unknown>) {
  return apiFetch<MetalConfig>("/api/v1/admin/gold/metals", { method: "POST", body: metal });
}

export function goldSetFaqs(slug: string, faqs: { question: string; answer: string; sortOrder?: number }[]) {
  return apiFetch<unknown[]>("/api/v1/admin/gold/metals/" + slug + "/faqs", { method: "POST", body: { faqs } });
}

export function goldSetOverride(o: { metalSlug: string; ask?: number; bid?: number; unit?: string; currency?: string; note?: string }) {
  return apiFetch<unknown>("/api/v1/admin/gold/overrides", { method: "POST", body: o });
}

// Kabadi

export function kabadiCategories(admin = true) {
  return apiFetch<KabadiCategory[]>((admin ? "/api/v1/admin/kabadi/categories" : "/api/v1/kabadi/categories"));
}

export function kabadiUpsertItem(item: Record<string, unknown>) {
  return apiFetch<unknown>("/api/v1/admin/kabadi/items", { method: "POST", body: item });
}

export function kabadiSetRates(items: Record<string, unknown>[]) {
  return apiFetch<unknown[]>("/api/v1/admin/kabadi/items/bulk", { method: "POST", body: { items } });
}

export function kabadiDeleteItem(id: string) {
  return apiFetch<{ deleted: boolean }>("/api/v1/admin/kabadi/items/" + id, { method: "DELETE" });
}

// Settings

export function getSettings() {
  return apiFetch<Record<string, unknown>>("/api/v1/admin/settings");
}

export function updateSettings(data: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>("/api/v1/admin/settings", { method: "PUT", body: data });
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
  propertyType: string;
  askingPrice: string;
  isFeatured: boolean;
  owner?: { id: string; name: string; email: string } | null;
  location?: { district?: string; municipality?: string; areaName?: string } | null;
  createdAt: string;
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
