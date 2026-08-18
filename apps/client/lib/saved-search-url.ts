import type { SavedSearchFilters } from "lib/api/services/saved-searches";

/**
 * Shared helpers for saved searches: converting between the `/search` URL
 * query string and the `SavedSearchFilters` JSON persisted on a saved-search
 * row. Used by the card's "Run now" link and the search page's save button.
 *
 * URL uses short param keys to keep URLs compact:
 *   q, type, pr, dist, minS, maxS, mun, ward, bed, bath,
 *   face, road, cp, ng, cs, ft, sub, am
 */

/** Short URL key → SavedSearchFilters key mapping. */
const PARAM_MAP: [string, keyof SavedSearchFilters][] = [
  ["q", "q"],
  ["type", "type"],
  ["pr", "price"],
  ["dist", "district"],
  ["minS", "minSize"],
  ["maxS", "maxSize"],
  ["mun", "municipality"],
  ["ward", "ward"],
  ["bed", "bedrooms"],
  ["bath", "bathrooms"],
  ["face", "facing"],
  ["road", "roadType"],
  ["cp", "isCornerPlot"],
  ["ng", "isNegotiable"],
  ["cs", "constructionStatus"],
  ["ft", "furnishing"],
  ["sub", "subCategory"],
  ["am", "amenities"],
];

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

  for (const [urlKey, filterKey] of PARAM_MAP) {
    const value = sp.get(urlKey);
    if (!value) continue;

    if (filterKey === "isCornerPlot" || filterKey === "isNegotiable") {
      filters[filterKey] = value === "true";
    } else if (filterKey === "amenities") {
      filters[filterKey] = value.split(",");
    } else if (filterKey === "ward" || filterKey === "bedrooms" || filterKey === "bathrooms") {
      filters[filterKey] = Number(value);
    } else {
      (filters as Record<string, unknown>)[filterKey] = value;
    }
  }

  return filters;
}

/** Builds the `/search` URL that replays a saved search's filters. */
export function savedSearchRunHref(filters: SavedSearchFilters): string {
  const params = new URLSearchParams();

  const setParam = (
    urlKey: string,
    value: string | null | undefined,
    skipDefaults: string[] = [],
  ) => {
    if (value == null || value === "") return;
    if (skipDefaults.includes(value)) return;
    params.set(urlKey, String(value));
  };

  setParam("q", filters.q);
  setParam("type", filters.type, ["all"]);
  setParam("pr", filters.price, ["any"]);
  setParam("dist", filters.district, ["any"]);
  setParam("minS", filters.minSize != null ? String(filters.minSize) : null);
  setParam("maxS", filters.maxSize != null ? String(filters.maxSize) : null);
  setParam("mun", filters.municipality);
  setParam("ward", filters.ward != null ? String(filters.ward) : null);
  setParam("bed", filters.bedrooms != null ? String(filters.bedrooms) : null);
  setParam("bath", filters.bathrooms != null ? String(filters.bathrooms) : null);
  setParam("face", filters.facing, ["any"]);
  setParam("road", filters.roadType, ["any"]);
  if (filters.isCornerPlot === true) params.set("cp", "true");
  if (filters.isNegotiable === true) params.set("ng", "true");
  setParam("cs", filters.constructionStatus, ["any"]);
  setParam("ft", filters.furnishing, ["any"]);
  setParam("sub", filters.subCategory, ["all"]);
  if (filters.amenities && filters.amenities.length > 0) {
    params.set("am", filters.amenities.join(","));
  }

  return params.toString() ? `/search?${params.toString()}` : "/search";
}
