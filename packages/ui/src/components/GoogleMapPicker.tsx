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
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [L, setL] = useState<any>(null);
  /* eslint-enable @typescript-eslint/no-explicit-any */

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

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

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

      <div className="relative z-0 overflow-hidden rounded-2xl border border-outline-variant bg-surface">
        <div
          ref={containerRef}
          style={{ height: heightStyle, width: "100%" }}
        />

        {showCoordinates && value && (
          <div className="absolute bottom-3 right-3 z-10 rounded-lg bg-surface/90 px-2.5 py-1 text-xs font-bold text-on-surface shadow-sm backdrop-blur-sm border border-outline-variant">
            📍 {value[0].toFixed(5)}, {value[1].toFixed(5)}
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-[13px] text-on-surface-variant">{helperText}</p>
      )}
    </div>
  );
}

export const MapPicker = GoogleMapPicker;
