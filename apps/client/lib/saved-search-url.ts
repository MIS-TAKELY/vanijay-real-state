import type { SavedSearchFilters } from "lib/api/services/saved-searches";

/**
 * Shared helpers for saved searches: converting between the `/search` URL
 * query string and the `SavedSearchFilters` JSON persisted on a saved-search
 * row. Used by the card's "Run now" link and the search page's save button.
 */

const PARAM_KEYS = ["q", "type", "price", "district", "minSize", "maxSize"] as const;

/** Reads the current `/search` URL params into a saved-search filters object. */
export function searchParamsToFilters(
  searchParams: URLSearchParams | Record<string, string | null>,
): SavedSearchFilters {
  const sp =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(
          Object.entries(searchParams).filter(
            (entry): entry is [string, string] => entry[1] != null,
          ),
        );
  const filters: SavedSearchFilters = {};
  for (const key of PARAM_KEYS) {
    const value = sp.get(key);
    if (value) filters[key] = value;
  }
  return filters;
}

/** Builds the `/search` URL that replays a saved search's filters. */
export function savedSearchRunHref(filters: SavedSearchFilters): string {
  const params = new URLSearchParams();
  for (const key of PARAM_KEYS) {
    const value = filters[key];
    if (value == null || value === "") continue;
    if ((key === "type" || key === "price") && value === "any") continue;
    if (key === "type" && value === "all") continue;
    params.set(key, String(value));
  }
  return params.toString() ? `/search?${params.toString()}` : "/search";
}
