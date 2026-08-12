"use client";

/* ------------------------------------------------------------------ */
/*  Google Maps JS API loader — singleton, safe for concurrent mounts  */
/* ------------------------------------------------------------------ */

// Minimal ambient typing — avoids requiring @types/google.maps
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [k: string]: any;
      };
    };
  }
}

const SCRIPT_ID = "gmap-js-api";
const CALLBACK_NAME = "__gmapReady";

let loadPromise: Promise<any | null> | null = null;

/**
 * Dynamically loads the Google Maps JavaScript API exactly once.
 * Returns `null` (never throws) when the key is missing or loading fails,
 * so callers can render a graceful fallback.
 */
export function loadGoogleMaps(apiKey: string): Promise<any | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing || window.google?.maps) {
      resolve(window.google?.maps ?? null);
      return;
    }

    (window as unknown as Record<string, unknown>)[CALLBACK_NAME] = () => {
      resolve(window.google?.maps ?? null);
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&callback=${CALLBACK_NAME}&loading=async`;
    script.onerror = () => {
      loadPromise = null;
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
