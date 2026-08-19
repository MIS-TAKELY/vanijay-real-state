"use client";

import { Icon } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { useEffect, useRef, useState } from "react";

interface ListingSidebarMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

type MapStyle = "satellite" | "street";

const TILE_LAYERS: Record<
  MapStyle,
  { url: string; options: { maxZoom: number; attribution?: string } }
> = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    options: {
      maxZoom: 18,
      attribution: "Tiles © Esri",
    },
  },
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      maxZoom: 18,
      attribution: "© OpenStreetMap",
    },
  },
};

/**
 * Lightweight Leaflet map embedded in the listing sidebar.
 * Shows a single pin at the property location with satellite/street toggle
 * and expand button for better navigation.
 *
 * Dynamically imports leaflet to avoid SSR issues.
 */
export function ListingSidebarMap({
  latitude,
  longitude,
  title,
}: ListingSidebarMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const tileLayerRef = useRef<import("leaflet").TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyle>("satellite");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!containerRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");

      // Fix default marker icon paths (common Leaflet + bundler issue)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
      });

      const provider = TILE_LAYERS[mapStyle];
      tileLayerRef.current = L.tileLayer(provider.url, provider.options).addTo(map);

      // Brand pin — navy roundel with a brass-gold ring, echoing the logo.
      L.marker([latitude, longitude], {
        icon: L.divIcon({
          className: "",
          html: `<div style="width:24px;height:24px;border-radius:9999px;background:#103050;border:2px solid #c9a227;box-shadow:0 2px 8px rgba(10,37,64,0.45);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;border-radius:9999px;background:#c9a227;"></div></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -14],
        }),
      })
        .addTo(map)
        .bindPopup(title, { closeButton: false });

      mapInstanceRef.current = map;
    }

    void initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, [latitude, longitude, title]);

  // Switch tile layer when mapStyle changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    async function switchTiles() {
      const L = await import("leaflet");

      if (tileLayerRef.current) {
        tileLayerRef.current.remove();
      }

      const provider = TILE_LAYERS[mapStyle];
      tileLayerRef.current = L.tileLayer(provider.url, provider.options).addTo(
        mapInstanceRef.current!,
      );
    }

    void switchTiles();
  }, [mapStyle]);

  // Invalidate map size when expanded state changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(
        () => mapInstanceRef.current?.invalidateSize(),
        350,
      );
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  return (
    <>
      {/* Leaflet CSS — loaded inline to avoid global import for this lightweight usage */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div
        ref={wrapperRef}
        className={cn(
          "relative overflow-hidden rounded-xl bg-surface-container",
          expanded &&
            "fixed inset-4 z-50 rounded-2xl border-2 border-navy/20 shadow-2xl",
        )}
      >
        {/* Map controls — top right */}
        <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5">
          {/* Map style toggle */}
          <div className="flex overflow-hidden rounded-lg border border-outline-variant bg-surface/90 shadow-sm backdrop-blur-sm">
            {(["satellite", "street"] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setMapStyle(style)}
                className={cn(
                  "px-2 py-1 text-[10px] font-semibold transition-colors",
                  mapStyle === style
                    ? "bg-navy text-white"
                    : "text-on-surface-variant hover:bg-surface-container",
                )}
              >
                {style === "satellite" ? "🛰️" : "🗺️"}
              </button>
            ))}
          </div>

          {/* Expand / collapse button */}
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center justify-center rounded-lg border border-outline-variant bg-surface/90 p-1 text-on-surface-variant shadow-sm backdrop-blur-sm transition-colors hover:bg-surface-container"
            title={expanded ? "Collapse map" : "Expand map"}
          >
            <Icon
              name={expanded ? "fullscreen_exit" : "fullscreen"}
              className="text-[14px]"
            />
          </button>
        </div>

        {/* Close button when expanded */}
        {expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-lg border border-outline-variant bg-surface/90 px-2 py-1 text-[11px] font-semibold text-on-surface shadow-sm backdrop-blur-sm transition-colors hover:bg-surface-container"
          >
            <Icon name="fullscreen_exit" className="text-[13px]" />
            Close
          </button>
        )}

        <div
          ref={containerRef}
          className={cn(
            "w-full bg-surface-container",
            expanded ? "h-full" : "h-40",
          )}
          aria-label={`Map showing ${title}`}
        />
      </div>
    </>
  );
}
