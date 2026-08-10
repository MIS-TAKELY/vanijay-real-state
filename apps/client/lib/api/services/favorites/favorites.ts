import { apiFetch } from "../../core/client";
import { API_ENDPOINTS } from "../../core/endpoints";
import type { FavoriteItem, FavoriteStatus } from "./types";

/** All saved listings for the signed-in user, newest first. */
export function fetchMyFavorites(): Promise<FavoriteItem[]> {
  return apiFetch<FavoriteItem[]>(API_ENDPOINTS.favorites.base);
}

/** Whether the property is saved by the current user (and its alert state). */
export function fetchFavoriteStatus(
  propertyId: string,
): Promise<FavoriteStatus> {
  return apiFetch<FavoriteStatus>(API_ENDPOINTS.favorites.status(propertyId));
}

/** Save a listing. Idempotent — re-saving just updates the alert preference. */
export function addFavorite(
  propertyId: string,
  notifyOnPriceChange = true,
): Promise<FavoriteItem> {
  return apiFetch<FavoriteItem>(API_ENDPOINTS.favorites.base, {
    method: "POST",
    body: { propertyId, notifyOnPriceChange },
  });
}

export function updateFavoriteNotify(
  propertyId: string,
  notifyOnPriceChange: boolean,
): Promise<FavoriteItem> {
  return apiFetch<FavoriteItem>(
    API_ENDPOINTS.favorites.byProperty(propertyId),
    {
      method: "PATCH",
      body: { notifyOnPriceChange },
    },
  );
}

/** Remove a listing from the user's favorites. */
export function removeFavorite(
  propertyId: string,
): Promise<{ removed: boolean }> {
  return apiFetch<{ removed: boolean }>(
    API_ENDPOINTS.favorites.byProperty(propertyId),
    { method: "DELETE" },
  );
}