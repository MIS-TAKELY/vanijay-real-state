"use client";

import L from "leaflet";

/**
 * Leaflet's default marker icons reference relative image assets that break
 * under Next.js / webpack bundling. This points them at CDN copies matching
 * the installed Leaflet version so default markers render out of the box.
 *
 * Idempotent — safe to call from any map component or to import for the side
 * effect. Runs at most once per page load.
 *
 * This module is marked `"use client"` because importing `leaflet` touches
 * `window` at module-load time; the directive keeps it out of the server
 * module graph so Server Components that import the `@repo/ui` barrel don't
 * crash with "window is not defined" during SSR.
 */
let leafletDefaultsConfigured = false;

export function setupLeafletDefaults(): void {
  // Guard against any accidental server-side invocation.
  if (typeof window === "undefined") return;
  if (leafletDefaultsConfigured) return;

  // The `_getIconUrl` getter short-circuits `mergeOptions`, so remove it first.
  const defaultIconProto = L.Icon.Default.prototype as unknown as {
    _getIconUrl?: () => string;
  };
  delete defaultIconProto._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  leafletDefaultsConfigured = true;
}