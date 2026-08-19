"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Icon } from "./Icon";
import { Label } from "./ui/label";

export type LatLng = [number, number];

export interface GoogleMapPickerProps {
  apiKey?: string;
  value: LatLng | null;
  onChange: (value: LatLng) => void;
  center?: LatLng;
  bounds?: [LatLng, LatLng];
  height?: number | string;
  zoom?: number;
  minZoom?: number;
  showLocateMe?: boolean;
  showCoordinates?: boolean;
  label?: string;
  helperText?: string;
  className?: string;
}

const DEFAULT_CENTER: LatLng = [27.7172, 85.324];
const DEFAULT_HELPER =
  "Click anywhere on the map to drop a pin, or drag the marker to adjust.";

type MapStyle = "satellite" | "street";

const TILE_LAYERS: Record<
  MapStyle,
  { url: string; options: { maxZoom: number; attribution?: string } }
> = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    options: {
      maxZoom: 19,
      attribution: "Tiles © Esri",
    },
  },
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    },
  },
};

function loadLeafletScript(): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if ((window as any).L) return Promise.resolve((window as any).L);

  return new Promise((resolve, reject) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve((window as any).L);
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

export function GoogleMapPicker({
  value,
  onChange,
  center = DEFAULT_CENTER,
  height = 240,
  zoom = 14,
  minZoom = 6,
  showLocateMe = true,
  showCoordinates = true,
  label = "Pin on map",
  helperText = DEFAULT_HELPER,
  className,
}: GoogleMapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [L, setL] = useState<any>(null);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const [mapStyle, setMapStyle] = useState<MapStyle>("satellite");
  const [expanded, setExpanded] = useState(false);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const ignoreNextValueRef = useRef(false);

  // Load Leaflet dynamically
  useEffect(() => {
    let cancelled = false;
    loadLeafletScript()
      .then((leafletApi) => {
        if (!cancelled && leafletApi) {
          setL(leafletApi);
        }
      })
      .catch((err) => console.error("Leaflet load error:", err));

    return () => {
      cancelled = true;
    };
  }, []);

  // Init map when Leaflet is ready
  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return;

    const initialCenter = valueRef.current ?? center;

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom,
      minZoom,
      zoomControl: false,
      attributionControl: false,
    });

    const provider = TILE_LAYERS[mapStyle];
    tileLayerRef.current = L.tileLayer(provider.url, provider.options).addTo(map);

    L.control.zoom({ position: "bottomleft" }).addTo(map);

    const pinIcon = L.divIcon({
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;cursor:grab;">
          <div style="width:26px;height:26px;background:#ef4444;border:2.5px solid #ffffff;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
            <div style="width:7px;height:7px;background:#ffffff;border-radius:50%;"></div>
          </div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #ef4444;margin-top:-1px;"></div>
        </div>
      `,
      className: "",
      iconSize: [26, 32],
      iconAnchor: [13, 32],
    });

    /* eslint-disable @typescript-eslint/no-explicit-any */
    map.on("click", (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      ignoreNextValueRef.current = true;

      if (!markerRef.current) {
        const marker = L.marker([lat, lng], {
          icon: pinIcon,
          draggable: true,
        }).addTo(map);
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          ignoreNextValueRef.current = true;
          onChangeRef.current([pos.lat, pos.lng]);
        });
        markerRef.current = marker;
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }

      onChangeRef.current([lat, lng]);
    });

    if (initialCenter) {
      const marker = L.marker(initialCenter, {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        ignoreNextValueRef.current = true;
        onChangeRef.current([pos.lat, pos.lng]);
      });
      markerRef.current = marker;
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      tileLayerRef.current = null;
    };
  }, [L, center, zoom, minZoom]);

  // Sync external value changes to marker
  useEffect(() => {
    if (!L || !mapRef.current) return;

    if (ignoreNextValueRef.current) {
      ignoreNextValueRef.current = false;
      return;
    }

    if (value) {
      const pinIcon = L.divIcon({
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;cursor:grab;">
            <div style="width:26px;height:26px;background:#ef4444;border:2.5px solid #ffffff;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
              <div style="width:7px;height:7px;background:#ffffff;border-radius:50%;"></div>
            </div>
            <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #ef4444;margin-top:-1px;"></div>
          </div>
        `,
        className: "",
        iconSize: [26, 32],
        iconAnchor: [13, 32],
      });

      if (markerRef.current) {
        markerRef.current.setLatLng(value);
      } else {
        const marker = L.marker(value, {
          icon: pinIcon,
          draggable: true,
        }).addTo(mapRef.current);
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          ignoreNextValueRef.current = true;
          onChangeRef.current([pos.lat, pos.lng]);
        });
        markerRef.current = marker;
      }
      mapRef.current.panTo(value, { animate: true });
    }
  }, [value, L]);

  // Switch tile layer when mapStyle changes
  useEffect(() => {
    if (!L || !mapRef.current) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const provider = TILE_LAYERS[mapStyle];
    tileLayerRef.current = L.tileLayer(provider.url, provider.options).addTo(mapRef.current);
  }, [mapStyle, L]);

  const handleLocateMe = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        ignoreNextValueRef.current = true;

        if (L && mapRef.current) {
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
          mapRef.current.panTo([lat, lng], { animate: true });
          mapRef.current.setZoom(15, { animate: true });
        }
        onChangeRef.current([lat, lng]);
      },
      (err) => console.error("Geolocation error:", err),
    );
  }, [L]);

  // Invalidate map size when expanded state changes
  useEffect(() => {
    if (mapRef.current) {
      const timer = setTimeout(() => mapRef.current.invalidateSize(), 350);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div className={cn("flex flex-col gap-xs", className)}>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-1.5">
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
      </div>

      <div
        ref={wrapperRef}
        className={cn(
          "relative z-0 overflow-hidden rounded-2xl border border-outline-variant bg-surface transition-all duration-300",
          expanded &&
            "fixed inset-4 z-50 rounded-2xl border-2 border-navy/20 shadow-2xl",
        )}
      >
        {/* Map style toggle — top right */}
        <div className="absolute right-2 top-2 z-[1000] flex flex-col gap-1.5">
          <div className="flex overflow-hidden rounded-lg border border-outline-variant bg-surface/90 shadow-sm backdrop-blur-sm">
            {(["satellite", "street"] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setMapStyle(style)}
                className={cn(
                  "px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                  mapStyle === style
                    ? "bg-navy text-white"
                    : "text-on-surface-variant hover:bg-surface-container",
                )}
              >
                {style === "satellite" ? "🛰️ Sat" : "🗺️ Map"}
              </button>
            ))}
          </div>

          {/* Expand / collapse button */}
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center justify-center rounded-lg border border-outline-variant bg-surface/90 p-1.5 text-on-surface-variant shadow-sm backdrop-blur-sm transition-colors hover:bg-surface-container"
            title={expanded ? "Collapse map" : "Expand map"}
          >
            <Icon
              name={expanded ? "fullscreen_exit" : "fullscreen"}
              className="text-[16px]"
            />
          </button>
        </div>

        <div
          ref={containerRef}
          style={{
            height: expanded ? "100%" : heightStyle,
            width: "100%",
          }}
        />

        {showCoordinates && value && (
          <div className="absolute bottom-3 right-3 z-[1000] rounded-lg bg-surface/90 px-2.5 py-1 text-xs font-bold text-on-surface shadow-sm backdrop-blur-sm border border-outline-variant">
            📍 {value[0].toFixed(5)}, {value[1].toFixed(5)}
          </div>
        )}

        {/* Close button when expanded */}
        {expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="absolute left-2 top-2 z-[1000] flex items-center gap-1 rounded-lg border border-outline-variant bg-surface/90 px-2.5 py-1.5 text-[12px] font-semibold text-on-surface shadow-sm backdrop-blur-sm transition-colors hover:bg-surface-container"
          >
            <Icon name="fullscreen_exit" className="text-[14px]" />
            Close
          </button>
        )}
      </div>

      {helperText && (
        <p className="text-[13px] text-on-surface-variant">{helperText}</p>
      )}
    </div>
  );
}

export const MapPicker = GoogleMapPicker;
