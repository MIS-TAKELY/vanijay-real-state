/**
 * Saved Searches constants & mock data (DESIGN.md §5.4).
 *
 * Shapes mirror the real Prisma model `SavedSearch` (see
 * `packages/db/prisma/schema.prisma`) — `alertFrequency` uses the
 * `AlertFrequency` enum (`INSTANT` | `DAILY_DIGEST` | `OFF`) — so this
 * skeleton can be wired to live data later without reshaping components.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type AlertFrequency = "INSTANT" | "DAILY_DIGEST" | "OFF";

/** A saved-search card — SavedSearch + display-only fields. */
export interface SavedSearch {
  id: string;
  /** Human-readable summary, e.g. "Land under 5 Aana, Ward 6, Pokhara". */
  label: string;
  /** Serialized filter state (location, price range, size, type…). */
  filters: Record<string, string>;
  alertFrequency: AlertFrequency;
  /** Total matches for this search, rendered mono. */
  matchCount: number;
  /** New matches since last visit (drives the primary dot badge). */
  newMatches: number;
  /** Pre-formatted "Saved" label, rendered mono. */
  savedAt: string;
}

/* ------------------------------------------------------------------ */
/* Frequency options (segmented control)                              */
/* ------------------------------------------------------------------ */

export interface FrequencyOption {
  key: AlertFrequency;
  label: string;
}

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { key: "INSTANT", label: "Instant" },
  { key: "DAILY_DIGEST", label: "Daily" },
  { key: "OFF", label: "Off" },
];

/** Concrete fallback so `noUncheckedIndexedAccess` lookups stay defined. */
export const DEFAULT_FREQUENCY: AlertFrequency = "INSTANT";

/* ------------------------------------------------------------------ */
/* Row menu actions (§5.4 `...` menu)                                  */
/* ------------------------------------------------------------------ */

export interface SavedSearchMenuItem {
  icon: string;
  label: string;
  destructive?: boolean;
}

export const SAVED_SEARCH_MENU_ITEMS: SavedSearchMenuItem[] = [
  { icon: "drive_file_rename_outline", label: "Rename" },
  { icon: "content_copy", label: "Duplicate" },
  { icon: "delete", label: "Delete", destructive: true },
];

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

export const SAVED_SEARCHES: SavedSearch[] = [
  {
    id: "s1",
    label: "Land under 5 Aana, Ward 6, Pokhara",
    filters: {
      Location: "Pokhara · Ward 6",
      Type: "Residential Land",
      "Max Size": "5 Aana",
    },
    alertFrequency: "INSTANT",
    matchCount: 12,
    newMatches: 3,
    savedAt: "2d ago",
  },
  {
    id: "s2",
    label: "Commercial space, Durbar Marg, NPR 5–10 Cr",
    filters: {
      Location: "Kathmandu · Durbar Marg",
      Type: "Commercial Space",
      Budget: "NPR 5–10 Cr",
    },
    alertFrequency: "DAILY_DIGEST",
    matchCount: 4,
    newMatches: 0,
    savedAt: "1w ago",
  },
  {
    id: "s3",
    label: "Heritage homes, Lalitpur, facing South",
    filters: {
      Location: "Lalitpur",
      Type: "Heritage Home",
      Facing: "South",
    },
    alertFrequency: "OFF",
    matchCount: 7,
    newMatches: 1,
    savedAt: "3w ago",
  },
  {
    id: "s4",
    label: "Agricultural land, Bhaktapur, road 20ft+",
    filters: {
      Location: "Bhaktapur",
      Type: "Agricultural Land",
      "Road Width": "20ft+",
    },
    alertFrequency: "INSTANT",
    matchCount: 21,
    newMatches: 9,
    savedAt: "1mo ago",
  },
];
