import { apiFetch } from "../../core/client";
import { API_ENDPOINTS } from "../../core/endpoints";
import type {
  CreateSavedSearchInput,
  SavedSearchItem,
  UpdateSavedSearchInput,
} from "./types";

/** All saved searches for the signed-in user, newest first. */
export function fetchMySavedSearches(): Promise<SavedSearchItem[]> {
  return apiFetch<SavedSearchItem[]>(API_ENDPOINTS.savedSearches.base);
}

/** Persist the current filter state as a saved search + alert. */
export function createSavedSearch(
  input: CreateSavedSearchInput,
): Promise<SavedSearchItem> {
  return apiFetch<SavedSearchItem>(API_ENDPOINTS.savedSearches.base, {
    method: "POST",
    body: input,
  });
}

/** Rename a saved search or change its alert frequency. */
export function updateSavedSearch(
  id: string,
  input: UpdateSavedSearchInput,
): Promise<SavedSearchItem> {
  return apiFetch<SavedSearchItem>(API_ENDPOINTS.savedSearches.byId(id), {
    method: "PATCH",
    body: input,
  });
}

/** Delete a saved search. */
export function deleteSavedSearch(
  id: string,
): Promise<{ removed: boolean }> {
  return apiFetch<{ removed: boolean }>(
    API_ENDPOINTS.savedSearches.byId(id),
    { method: "DELETE" },
  );
}
