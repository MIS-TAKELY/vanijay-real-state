import { apiFetch } from '../../core/client';
import { API_ENDPOINTS } from '../../core/endpoints';

export interface TrendingProperty {
  propertyId: string;
  title: string;
  slug: string;
  imageUrl?: string;
  location: string;
  askingPrice: number;
  trendingScore: number;
  viewCount: number;
  favoriteCount: number;
  cartAddCount: number;
}

export interface TrendingPropertiesResponse {
  items: TrendingProperty[];
}

export async function fetchTrendingProperties(
  limit?: number,
  period?: string,
): Promise<TrendingPropertiesResponse> {
  const query: Record<string, string | number | boolean | null | undefined> = {
    limit: limit || 10,
  };
  if (period) query.period = period;
  return apiFetch<TrendingPropertiesResponse>(API_ENDPOINTS.analytics.trending, { query });
}

export async function trackPropertyView(propertyId: string): Promise<void> {
  await apiFetch(API_ENDPOINTS.analytics.trackView(propertyId), {
    method: 'POST',
    skipServerCookies: true,
  });
}

export async function trackPropertyShare(propertyId: string, platform: string): Promise<void> {
  await apiFetch(API_ENDPOINTS.analytics.trackShare(propertyId), {
    method: 'POST',
    body: { platform },
  });
}

export interface SellerContact {
  name: string | null;
  phoneNumber: string;
  via: 'AGENT' | 'OWNER';
}

export async function fetchSellerContact(propertyId: string): Promise<SellerContact | null> {
  return apiFetch<SellerContact | null>(API_ENDPOINTS.analytics.sellerContact(propertyId), {
    skipServerCookies: true,
  });
}

export async function trackPropertyPhoneClick(propertyId: string): Promise<void> {
  await apiFetch<void>(API_ENDPOINTS.analytics.trackPhoneClick(propertyId), {
    method: 'POST',
    skipServerCookies: true,
  });
}