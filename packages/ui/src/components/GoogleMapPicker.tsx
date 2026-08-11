"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "./ui/button";
import { Icon } from "./Icon";
import { Label } from "./ui/label";
import { cn } from "../lib/utils";
import { loadGoogleMaps, type GoogleMapsApi } from "./googleMapsLoader";

/* ------------------------------------------------------------------ */
/*  Types & defaults                                                   */
/* ------------------------------------------------------------------ */

export type LatLng = [number, number];

export interface GoogleMapPickerProps {
  /** Google Maps Platform browser API key (Maps JS + Geocoding enabled). */
  apiKey?: string;
  /** Controlled pin position `[lat, lng]`, or `null` when no pin is set. */
  value: LatLng | null;
  /** Called whenever the pin moves (map click, marker drag, locate, drop). */
  onChange: (value: LatLng) => void;
  /** Initial / fallback map center. Defaults to Kathmandu. */
  center?: LatLng;
  /** Restrict panning to this `[[lat,lng],[lat,lng]]` bounds. Default Nepal. */
  bounds?: [LatLng, LatLng];
  /** Map height in px or any CSS length. Default `224`. */
  height?: number | string;
  /** Initial zoom level. Default `14`. */
  zoom?: number;
  /** Minimum zoom level. Default `7`. */
  minZoom?: number;
  /** Show the "Locate me" button. Default `true`. */
  showLocateMe?: boolean;
  /** Show the coordinates overlay. Default `true`. */
  showCoordinates?: boolean;
  /** Section label above the map. Default `"Pin on map"`. */
  label?: string;
  /** Helper text under the map. Set to `""` to hide. */
  helperText?: string;
  /** Extra classes for the wrapper. */
  className?: string;
}

const DEFAULT_CENTER: LatLng = [27.7172, 85.324];
const DEFAULT_BOUNDS: [LatLng, LatLng] = [
  [26.35, 80.05],
  [30.45, 88.2],
];
const DEFAULT_HELPER =
  "Click anywhere on the map to drop a pin, or drag the marker to adjust.";

// Bundlers inline `process.env` at build time; guard against runtimes where
// `process` itself is undefined (the ui package has no Node types installed).
declare const process: { env?: Record<string, string | undefined> } | undefined;
const ENV_API_KEY =
  typeof process !== "undefined"
    ? (process?.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "")
    : "";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * `<GoogleMapPicker>` — the Google Maps equivalent of `<MapPicker>`: a
 * controlled "pin on map" widget with click-to-drop, a draggable marker,
 * geolocation, a coordinates overlay and a "drop pin at center" fallback.
 *
 * Renders a visible fallback message (and still accepts `value`/`onChange`
 * updates from search) when no API key is configured or the Maps JS API
 * fails to load, so the form stays usable.
 */
export function GoogleMapPicker({
  apiKey = ENV_API_KEY,
  value,
  onChange,
  center = DEFAULT_CENTER,
  bounds = DEFAULT_BOUNDS,
  height = 224,
  zoom = 14,
  minZoom = 7,
  showLocateMe = true,
  showCoordinates = true,
  label = "Pin on map",
  helperText = DEFAULT_HELPER,
  className,
}: GoogleMapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const listenersRef = useRef<Array<{ remove(): void }>>([]);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const [maps, setMaps] = useState<GoogleMapsApi | null>(null);
  const [failed, setFailed] = useState(false);

  // Keep latest values for map event handlers without re-binding listeners.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const ignoreNextValueRef = useRef(false);

  /* --- Track the latest `value` prop for use in map init & handlers --- */
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  /* --- Load the Maps JS API (once) ---------------------------------- */
  useEffect(() => {
    if (!apiKey) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    void loadGoogleMaps(apiKey).then((api) => {
      if (cancelled) return;
      if (api) setMaps(api);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  /* --- Init map (once per api) --------------------------------------- */
  useEffect(() => {
    if (!maps || !containerRef.current || mapRef.current) return;

    const el = containerRef.current;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const map: any = new maps.Map(el, {
      center: { lat: center[0], lng: center[1] },
      zoom,
      minZoom,
      restriction: {
        latLngBounds: {
          north: bounds[1][0],
          south: bounds[0][0],
          west: bounds[0][1],
          east: bounds[1][1],
        },
        strictBounds: false,
      },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      gestureHandling: "greedy",
    });
    mapRef.current = map;

    const marker = new maps.Marker({ map, draggable: true });
    markerRef.current = marker;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const emit = (latlng: { lat(): number; lng(): number }) => {
      ignoreNextValueRef.current = true;
      onChangeRef.current([latlng.lat(), latlng.lng()]);
    };

    listenersRef.current = [
      /* eslint-disable @typescript-eslint/no-explicit-any */
      maps.event.addListener(map, "click", (e: any) => {
        if (e?.latLng) {
          // Move the marker to the clicked spot immediately; the controlled
          // `value` update follows via onChange (ignoreNextValue skips the
          // redundant re-sync).
          marker.setPosition(e.latLng);
          emit(e.latLng);
        }
      }),
      maps.event.addListener(marker, "dragend", () => {
        const pos = marker.getPosition();
        if (pos) emit(pos);
      }),
      /* eslint-enable @typescript-eslint/no-explicit-any */
    ];

    // Reflect an external initial pin (e.g. from search or edit-mode
    // hydration) if one exists at the time the map finishes loading.
    const initial = valueRef.current;
    if (initial) {
      marker.setPosition({ lat: initial[0], lng: initial[1] });
      map.setCenter({ lat: initial[0], lng: initial[1] });
      map.setZoom(Math.max(map.getZoom() ?? zoom, zoom));
    }
  }, [maps, center, bounds, zoom, minZoom]);

  /* --- Reflect external `value` changes into the map ------------------ */
  useEffect(() => {
    if (!maps || !mapRef.current || !markerRef.current || !value) return;

    if (ignoreNextValueRef.current) {
      // Our own click/drag already positioned the marker.
      ignoreNextValueRef.current = false;
      return;
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    markerRef.current.setPosition({ lat: value[0], lng: value[1] });
    const map: any = mapRef.current;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    map.panTo({ lat: value[0], lng: value[1] });
    map.setZoom(Math.max(map.getZoom() ?? zoom, zoom));
  }, [value, maps, zoom]);

  /* --- Cleanup -------------------------------------------------------- */
  useEffect(() => {
    return () => {
      listenersRef.current.forEach((l) => l.remove());
      listenersRef.current = [];
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  /* --- Actions --------------------------------------------------------- */
  const handleLocateMe = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        ignoreNextValueRef.current = !(
          maps && markerRef.current && mapRef.current
        );
        if (maps && markerRef.current && mapRef.current) {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          /* eslint-disable @typescript-eslint/no-explicit-any */
          const ll = { lat, lng };
          markerRef.current.setPosition(ll);
          const map: any = mapRef.current;
          /* eslint-enable @typescript-eslint/no-explicit-any */
          map.panTo(ll);
          map.setZoom(Math.max(map.getZoom() ?? zoom, zoom));
        }
        onChangeRef.current([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.error("Geolocation error:", err),
    );
  }, [maps, zoom]);

  const handleDropPinCenter = useCallback(() => {
    if (maps && markerRef.current && mapRef.current) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const map: any = mapRef.current;
      /* eslint-enable @typescript-eslint/no-explicit-any */
      const c = map.getCenter();
      if (c) {
        markerRef.current.setPosition(c);
        ignoreNextValueRef.current = true;
        onChangeRef.current([c.lat(), c.lng()]);
        return;
      }
    }
    onChangeRef.current(center);
  }, [maps, center]);

  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div className={cn("flex flex-col gap-xs", className)}>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {showLocateMe && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLocateMe}
            className="text-[13px]"
            disabled={failed && !maps}
          >
            <Icon name="my_location" className="mr-1 text-[16px]" />
            Locate me
          </Button>
        )}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface">
        <div
          ref={containerRef}
          style={{ height: heightStyle, width: "100%" }}
          className={cn(failed && "hidden")}
        />

        {failed && (
          <div
            style={{ height: heightStyle }}
            className="flex w-full flex-col items-center justify-center gap-1 bg-surface-container px-4 text-center"
          >
            <Icon name="map" className="text-[28px] text-on-surface-variant" />
            <p className="text-sm font-medium text-on-surface">
              Google Maps unavailable
            </p>
            <p className="text-xs text-on-surface-variant">
              {apiKey
                ? "The Maps API failed to load. Check the key and network connection."
                : "Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable map pinning."}{" "}
              You can still use the address search above and enter the location
              manually.
            </p>
          </div>
        )}

        {showCoordinates && value && (
          <div className="absolute bottom-2 left-2 z-[400] rounded-md bg-surface/90 px-2 py-1 text-xs font-medium text-on-surface shadow-sm backdrop-blur-sm">
            {value[0].toFixed(5)}, {value[1].toFixed(5)}
          </div>
        )}

        {!value && !failed && maps && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleDropPinCenter}
              className="pointer-events-auto inline-flex cursor-pointer items-center gap-1 rounded-md border-outline-variant px-3 py-1.5 text-[13px] font-medium text-on-surface shadow-sm hover:border-primary hover:text-primary"
            >
              <Icon name="map" className="text-[16px]" />
              Drop pin at center
            </Button>
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-[13px] text-on-surface-variant">{helperText}</p>
      )}
    </div>
  );
}
