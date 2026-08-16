import type { ListingDraft } from "./draft";

/**
 * localStorage persistence for the creation wizard's draft (spec UX rule 6:
 * never lose progress on refresh). Create mode only — edit mode is backed by
 * the API, and restoring a stale local draft over the saved property would be
 * worse than losing an in-progress edit.
 *
 * The payload is versioned so a future draft-schema change (new fields, type
 * tweaks) discards old drafts instead of hydrating a mismatched shape.
 */

const STORAGE_KEY = "lekha.wizard.draft.v1";
const VERSION = 1;

interface StoredWizardDraft {
  version: typeof VERSION;
  savedAt: string;
  step: number;
  draft: ListingDraft;
}

/** Minimal `localStorage` surface — injectable so Node tests can fake it. */
export interface WizardDraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStorage(): WizardDraftStorage | null {
  // Guard SSR — `window` is undefined during server rendering.
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    // Storage can throw in private modes / sandboxed iframes.
    return null;
  }
}

export interface LoadedWizardDraft {
  draft: ListingDraft;
  step: number;
}

/** Restore the saved draft, or null when nothing valid is stored. */
export function loadWizardDraft(
  storage: WizardDraftStorage | null = defaultStorage(),
): LoadedWizardDraft | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredWizardDraft> | null;
    if (!parsed || parsed.version !== VERSION) return null;
    if (typeof parsed.step !== "number" || typeof parsed.savedAt !== "string") {
      return null;
    }
    // Shape guard — reject anything that doesn't look like a draft (corrupt
    // payloads, foreign objects) rather than hydrating garbage.
    if (!parsed.draft || typeof parsed.draft !== "object") return null;
    if (typeof parsed.draft.title !== "string") return null;
    if (typeof parsed.draft.propertyType !== "string") return null;
    return { draft: parsed.draft, step: parsed.step };
  } catch {
    return null;
  }
}

/** Persist the current draft + step (debounced by the caller). */
export function saveWizardDraft(
  draft: ListingDraft,
  step: number,
  storage: WizardDraftStorage | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    const payload: StoredWizardDraft = {
      version: VERSION,
      savedAt: new Date().toISOString(),
      step,
      draft,
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded / private mode — persistence is best-effort.
  }
}

/** Forget the saved draft (after a successful publish or \"Start fresh\"). */
export function clearWizardDraft(
  storage: WizardDraftStorage | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
