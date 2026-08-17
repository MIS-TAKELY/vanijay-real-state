"use client";

import { useEffect, useRef } from "react";

interface ListingSidebarMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

/**
 * Lightweight Leaflet map embedded in the listing sidebar.
 * Shows a single pin at the property location — no controls clutter,
 * just immediate spatial context alongside the price.
 *
 * Dynamically imports leaflet to avoid SSR issues.
 */
export function ListingSidebarMap({
  latitude,
  longitude,
  title,
}: ListingSidebarMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);

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

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

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
      }
    };
  }, [latitude, longitude, title]);

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
        ref={containerRef}
        className="h-40 w-full rounded-xl bg-surface-container"
        aria-label={`Map showing ${title}`}
      />
    </>
  );
}
