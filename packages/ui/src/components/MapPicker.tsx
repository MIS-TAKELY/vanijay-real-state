"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import { Button } from "./ui/button";
import { Icon } from "./Icon";
import { Label } from "./ui/label";
import { cn } from "../lib/utils";
import { setupLeafletDefaults } from "../lib/leaflet";

// Configure Leaflet's default marker icons once for the whole app.
setupLeafletDefaults();

// Re-export so consumers of the `@repo/ui/map` subpath can call it manually
// (e.g. when using raw <MapContainer>) without a second import path.
export { setupLeafletDefaults } from "../lib/leaflet";

/* ------------------------------------------------------------------ */
/*  Types & defaults                                                   */
/* ------------------------------------------------------------------ */

export type LatLng = [number, number];

export interface MapPickerProps {
  /** Controlled pin position `[lat, lng]`, or `null` when no pin is set. */
  value: LatLng | null;
  /** Called whenever the pin moves (map click, marker drag, locate, drop). */
  onChange: (value: LatLng) => void;
  /** Initial / fallback map center. Defaults to the Nepal center. */
  center?: LatLng;
  /** Optional `maxBounds` for the map. Defaults to Nepal's bounding box. */
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
  /** Custom tile URL template. Defaults to OpenStreetMap. */
  tileUrl?: string;
  /** Tile attribution string. */
  tileAttribution?: string;
  /** Extra classes for the wrapper. */
  className?: string;
}

const DEFAULT_CENTER: LatLng = [27.7172, 85.324];
const DEFAULT_BOUNDS: [LatLng, LatLng] = [
  [26.35, 80.05],
  [30.45, 88.2],
];
const DEFAULT_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const DEFAULT_HELPER =
  "Click anywhere on the map to drop a pin, or drag the marker to adjust.";

/* ------------------------------------------------------------------ */
/*  Internal map controllers (must live inside <MapContainer>)         */
/* ------------------------------------------------------------------ */

/** Drops a pin when the map is clicked. */
function MapClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Smoothly flies the map to `center` whenever it changes. */
function MapViewController({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, Math.max(map.getZoom() ?? 14, 14));
  }, [center, map]);
  return null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * `<MapPicker>` — a self-contained, controlled "pick a location on a map"
 * widget. The parent owns the pin via `value` / `onChange`; the picker handles
 * click-to-drop, a draggable marker, geolocation, the coordinates overlay and
 * a "drop pin at center" fallback. Setting `value` from outside (e.g. from a
 * search result) automatically flies the map to the new pin.
 */
export function MapPicker({
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
  tileUrl = DEFAULT_TILE_URL,
  tileAttribution = DEFAULT_TILE_ATTR,
  className,
}: MapPickerProps) {
  // Where the map should fly to. Driven by clicks / locate / external `value`.
  const [flyTarget, setFlyTarget] = useState<LatLng | null>(null);
  // Distinguishes value changes we triggered ourselves (no re-fly) from
  // external ones (fly to the new pin). Assumes the parent reflects `onChange`
  // back into `value` — true for any controlled usage.
  const internalChangeRef = useRef(false);

  useEffect(() => {
    if (internalChangeRef.current) {
      internalChangeRef.current = false;
      return;
    }
    if (value) setFlyTarget(value);
  }, [value]);

  const setPin = useCallback(
    (lat: number, lng: number, fly: boolean) => {
      internalChangeRef.current = true;
      onChange([lat, lng]);
      if (fly) setFlyTarget([lat, lng]);
    },
    [onChange],
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => setPin(lat, lng, true),
    [setPin],
  );

  const handleMarkerDragEnd = useCallback(
    (e: L.LeafletEvent) => {
      const marker = e.target as L.Marker;
      const pos = marker.getLatLng();
      // Don't fly — the marker is already in view and we don't want the map
      // to jump while the user is repositioning.
      setPin(pos.lat, pos.lng, false);
    },
    [setPin],
  );

  const handleLocateMe = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setPin(pos.coords.latitude, pos.coords.longitude, true),
      (err) => console.error("Geolocation error:", err),
    );
  }, [setPin]);

  const handleDropPinCenter = useCallback(
    () => setPin(center[0], center[1], true),
    [center, setPin],
  );

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
          >
            <Icon name="my_location" className="mr-1 text-[16px]" />
            Locate me
          </Button>
        )}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom
          style={{ height: heightStyle, width: "100%", zIndex: 1 }}
          maxBounds={bounds}
          minZoom={minZoom}
        >
          <TileLayer attribution={tileAttribution} url={tileUrl} />
          <MapClickHandler onClick={handleMapClick} />
          {flyTarget && <MapViewController center={flyTarget} />}

          {value && (
            <Marker
              position={value}
              draggable
              eventHandlers={{ dragend: handleMarkerDragEnd }}
            >
              <Popup>
                <span className="text-xs font-medium tabular-nums">
                  {value[0].toFixed(5)}, {value[1].toFixed(5)}
                </span>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {showCoordinates && value && (
          <div className="absolute bottom-2 left-2 z-[400] rounded-md bg-surface/90 px-2 py-1 text-xs font-medium text-on-surface shadow-sm backdrop-blur-sm">
            {value[0].toFixed(5)}, {value[1].toFixed(5)}
          </div>
        )}

        {!value && (
          <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center">
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