export type AlertFrequency = "INSTANT" | "DAILY_DIGEST" | "OFF";

/** Filter state mirroring the `/search` URL params, as stored on the row. */
export interface SavedSearchFilters {
  q?: string | null;
  type?: string | null;
  price?: string | null;
  district?: string | null;
  minSize?: string | number | null;
  maxSize?: string | number | null;
}

/** One saved search row from `GET /api/v1/saved-searches`. */
export interface SavedSearchItem {
  id: string;
  /** Human-readable summary, e.g. "Land under 5 Aana, Ward 6, Pokhara". */
  label: string;
  filters: SavedSearchFilters;
  alertFrequency: AlertFrequency;
  /** Total LIVE listings currently matching the saved filters. */
  matchCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedSearchInput {
  label?: string;
  filters: SavedSearchFilters;
  alertFrequency?: AlertFrequency;
}

export interface UpdateSavedSearchInput {
  label?: string;
  alertFrequency?: AlertFrequency;
}
