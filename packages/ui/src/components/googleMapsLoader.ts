"use client";

/* ------------------------------------------------------------------ */
/*  Google Maps JS API loader (vanilla — no dependency on maps libs)   */
/* ------------------------------------------------------------------ */

/**
 * Dynamically loads the Google Maps JavaScript API exactly once and returns
 * the global `google.maps` namespace. Subsequent calls reuse the pending or
 * resolved promise, so several components can mount concurrently without
 * injecting duplicate <script> tags.
 */

// Minimal ambient types — deliberately scoped to the tiny surface we use
// (Map / Marker / event listeners). Keeps @repo/ui free of the full
// @types/google.maps dependency.
/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, opts: unknown) => unknown;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Marker: any;
        event: {
          addListener: (
            instance: unknown,
            eventName: string,
            handler: (e: unknown) => void,
          ) => { remove(): void };
          removeListener: (listener: { remove(): void }) => void;
        };
        /* additional fields exist at runtime; typed per-use below */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [k: string]: any;
      };
    };
  }
}
/* eslint-enable @typescript-eslint/consistent-type-definitions */

export type GoogleMapsApi = NonNullable<NonNullable<Window["google"]>["maps"]>;

const SCRIPT_ID = "google-maps-js-api";
const CALLBACK_NAME = "__gmapsReady";

let loadPromise: Promise<GoogleMapsApi | null> | null = null;

/**
 * Load the Google Maps JS API with the given API key.
 *
 * Returns `null` — instead of throwing — when the key is missing or the
 * script fails to load, so callers can fall back to another provider.
 */
export function loadGoogleMaps(apiKey: string): Promise<GoogleMapsApi | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<GoogleMapsApi | null>((resolve) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing || window.google?.maps) {
      resolve(window.google?.maps ?? null);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[CALLBACK_NAME] = () => {
      resolve(window.google?.maps ?? null);
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&callback=${CALLBACK_NAME}&loading=async`;
    script.onerror = () => {
      loadPromise = null;
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
