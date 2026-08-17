/**
 * Saved Searches display constants (DESIGN.md §5.4).
 *
 * `alertFrequency` uses the `AlertFrequency` enum (`INSTANT` | `DAILY_DIGEST`
 * | `OFF`) — the same values the API persists on the `SavedSearch` row.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type AlertFrequency = "INSTANT" | "DAILY_DIGEST" | "OFF";

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
