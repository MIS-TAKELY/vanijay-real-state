import { apiFetch } from "../../core/client";
import { API_ENDPOINTS } from "../../core/endpoints";
import type { ApiProperty, FeedPage } from "./types";

export function fetchFeedPage(opts: {
  first: number;
  after?: string | null;
}): Promise<FeedPage> {
  return apiFetch<FeedPage>(API_ENDPOINTS.properties.feed, {
    query: { first: opts.first, after: opts.after ?? undefined },
  });
}

export function fetchPropertyById(id: string): Promise<ApiProperty> {
  return apiFetch<ApiProperty>(API_ENDPOINTS.properties.byId(id));
}

export function createProperty(
  input: Record<string, unknown>,
): Promise<ApiProperty> {
  return apiFetch<ApiProperty>(API_ENDPOINTS.properties.create, {
    method: "POST",
    body: input,
  });
}

export function updateProperty(
  id: string,
  input: Record<string, unknown>,
): Promise<ApiProperty> {
  return apiFetch<ApiProperty>(API_ENDPOINTS.properties.update(id), {
    method: "PATCH",
    body: input,
  });
}

export function deleteProperty(id: string): Promise<void> {
  return apiFetch<void>(API_ENDPOINTS.properties.remove(id), {
    method: "DELETE",
  });
}
