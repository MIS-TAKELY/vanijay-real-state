"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Icon } from "@repo/ui";

/**
 * MapExplorer – Full Nepal Interactive Market Map (v3)
 *
 * Requires (already installed):
 *   npm install leaflet react-leaflet
 *   npm install -D @types/leaflet
 *
 * Add once, globally:
 *   import "leaflet/dist/leaflet.css";
 *
 * Fixes vs. previous version:
 *  - Real invalidateSize() via ResizeObserver + ref (whenCreated isn't relied on,
 *    since that API is inconsistent across react-leaflet versions).
 *  - Explicit iconSize on divIcon markers — Leaflet defaults divIcon to a 12x20px
 *    box, which was silently squashing/hiding the custom pin markup.
 *  - Nepal country outline (GeoJSON), fetched client-side, for actual geographic
 *    grounding instead of relying on OSM road tiles alone.
 *  - Hover tooltips + click popups, search box, reset-view control.
 */

type Trend = "up" | "flat" | "down";
type Region =
  | "Kathmandu Valley"
  | "Pokhara"
  | "Eastern"
  | "Central & Terai"
  | "Western";

interface MarketMarker {
  id: number;
  price: string;
  priceValue: number;
  change: string;
  trend: Trend;
  lat: number;
  lng: number;
  area: string;
  city: string;
  region: Region;
  verified: boolean;
  description: string;
}

const mapMarkers: MarketMarker[] = [
  { id: 1, price: "रू 34.2M", priceValue: 34.2, change: "8.1%", trend: "up", lat: 27.7291, lng: 85.3286, area: "Baluwatar", city: "Kathmandu", region: "Kathmandu Valley", verified: true, description: "Prime residential & diplomatic zone" },
  { id: 2, price: "रू 41.5M", priceValue: 41.5, change: "12.4%", trend: "up", lat: 27.7172, lng: 85.324, area: "Lazimpat", city: "Kathmandu", region: "Kathmandu Valley", verified: true, description: "High-demand commercial & residential" },
  { id: 3, price: "रू 28.9M", priceValue: 28.9, change: "6.7%", trend: "up", lat: 27.717, lng: 85.348, area: "Boudha", city: "Kathmandu", region: "Kathmandu Valley", verified: true, description: "Cultural hub with strong rental demand" },
  { id: 4, price: "रू 22.4M", priceValue: 22.4, change: "4.2%", trend: "up", lat: 27.678, lng: 85.317, area: "Patan", city: "Lalitpur", region: "Kathmandu Valley", verified: true, description: "Heritage city, rising mid-premium segment" },
  { id: 5, price: "रू 18.6M", priceValue: 18.6, change: "3.1%", trend: "up", lat: 27.671, lng: 85.429, area: "Bhaktapur", city: "Bhaktapur", region: "Kathmandu Valley", verified: false, description: "Traditional city with growing interest" },
  { id: 6, price: "रू 19.8M", priceValue: 19.8, change: "9.3%", trend: "up", lat: 28.2096, lng: 83.9856, area: "Lakeside", city: "Pokhara", region: "Pokhara", verified: true, description: "Tourism & second-home hotspot" },
  { id: 7, price: "रू 14.2M", priceValue: 14.2, change: "5.6%", trend: "up", lat: 28.238, lng: 83.973, area: "Mahendrapool", city: "Pokhara", region: "Pokhara", verified: true, description: "Commercial core of Pokhara" },
  { id: 8, price: "रू 11.5M", priceValue: 11.5, change: "7.8%", trend: "up", lat: 26.4525, lng: 87.2718, area: "Biratnagar", city: "Biratnagar", region: "Eastern", verified: true, description: "Industrial & trading gateway" },
  { id: 9, price: "रू 9.8M", priceValue: 9.8, change: "4.5%", trend: "up", lat: 26.812, lng: 87.283, area: "Dharan", city: "Dharan", region: "Eastern", verified: false, description: "Hill city with strong local demand" },
  { id: 10, price: "रू 13.4M", priceValue: 13.4, change: "6.2%", trend: "up", lat: 27.676, lng: 84.433, area: "Bharatpur", city: "Chitwan", region: "Central & Terai", verified: true, description: "Fast-growing commercial hub" },
  { id: 11, price: "रू 8.9M", priceValue: 8.9, change: "2.1%", trend: "flat", lat: 27.429, lng: 85.032, area: "Hetauda", city: "Makwanpur", region: "Central & Terai", verified: false, description: "Industrial corridor location" },
  { id: 12, price: "रू 10.2M", priceValue: 10.2, change: "5.9%", trend: "up", lat: 27.01, lng: 84.88, area: "Birgunj", city: "Parsa", region: "Central & Terai", verified: true, description: "Major border trade city" },
  { id: 13, price: "रू 12.1M", priceValue: 12.1, change: "8.4%", trend: "up", lat: 27.7, lng: 83.45, area: "Butwal", city: "Rupandehi", region: "Western", verified: true, description: "Rapidly expanding commercial center" },
  { id: 14, price: "रू 9.4M", priceValue: 9.4, change: "3.8%", trend: "up", lat: 27.506, lng: 83.446, area: "Bhairahawa", city: "Rupandehi", region: "Western", verified: false, description: "Border city with Lumbini tourism link" },
  { id: 15, price: "रू 7.6M", priceValue: 7.6, change: "1.2%", trend: "flat", lat: 28.05, lng: 81.6167, area: "Nepalgunj", city: "Banke", region: "Western", verified: true, description: "Western Terai commercial node" },
];

const REGIONS: Region[] = [
  "Kathmandu Valley",
  "Pokhara",
  "Eastern",
  "Central & Terai",
  "Western",
];

const DEFAULT_CENTER: [number, number] = [28.3949, 84.124];
const DEFAULT_ZOOM = 7;
const NEPAL_OUTLINE_URL =
  "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/NPL.geo.json";

// react-leaflet components are held in React state, not module-level `let`s.
// Module-level mutable bindings can get silently reset to `undefined` by
// Next.js Fast Refresh on a hot-reload, while React state (like
// `leafletReady`) survives — that mismatch was very likely why markers,
// popups, and the zoom control were intermittently missing with no error.
interface LeafletModules {
  L: any;
  MapContainer: any;
  TileLayer: any;
  Marker: any;
  Popup: any;
  Tooltip: any;
  GeoJSON: any;
  ZoomControl: any;
}

function trendColor(trend: Trend) {
  if (trend === "up") return "#b91c1c";
  if (trend === "down") return "#1d4ed8";
  return "#5b6b60";
}

function trendIconName(trend: Trend) {
  if (trend === "up") return "trending_up";
  if (trend === "down") return "trending_down";
  return "trending_flat";
}

const PIN_WIDTH = 76;
const PIN_HEIGHT = 44;

function PinMarkup({
  marker,
  isSelected,
  isHottest,
}: {
  marker: MarketMarker;
  isSelected: boolean;
  isHottest: boolean;
}) {
  const color = trendColor(marker.trend);
  return (
    <div
      style={{
        width: PIN_WIDTH,
        height: PIN_HEIGHT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: isSelected ? "scale(1.15)" : "scale(1)",
        transformOrigin: "bottom center",
      }}
    >
      <div style={{ position: "relative" }}>
        {isHottest && (
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color,
              animation: "lp-pulse 1.8s ease-out infinite",
            }}
          />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "4px 8px",
            borderRadius: 3,
            background: "#fdfcf8",
            border: `1px solid ${isSelected ? "#244530" : "#c9c2ae"}`,
            borderLeft: `3px solid ${color}`,
            boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
            width: PIN_WIDTH - 6,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#244530",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {marker.price}
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, color }}>
            {marker.trend === "up" ? "▲" : marker.trend === "down" ? "▼" : "—"}{" "}
            {marker.change}
          </span>
        </div>
      </div>
      <div
        style={{
          width: 8,
          height: 8,
          marginTop: -4,
          transform: "rotate(45deg)",
          background: "#fdfcf8",
          borderRight: "1px solid #c9c2ae",
          borderBottom: "1px solid #c9c2ae",
        }}
      />
    </div>
  );
}

export function MapExplorer() {
  const [isClient, setIsClient] = useState(false);
  const [modules, setModules] = useState<LeafletModules | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number>(mapMarkers[0]!.id);
  const [activeRegion, setActiveRegion] = useState<Region | "All">("All");
  const [query, setQuery] = useState("");
  const [nepalOutline, setNepalOutline] = useState<any>(null);
  const [hasFitAll, setHasFitAll] = useState(false);

  const mapRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const leafletReady = modules !== null;

  useEffect(() => {
    setIsClient(true);
    let cancelled = false;

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setLoadError(
          "The map is taking longer than expected to load. If this persists, check the browser console for errors, or try disabling ad-block extensions for this site — some block map tile CDNs.",
        );
      }
    }, 6000);

    (async () => {
      try {
        const L = await import("leaflet");
        const RL = await import("react-leaflet");
        if (cancelled) return;
        clearTimeout(timeout);
        setModules({
          L,
          MapContainer: RL.MapContainer,
          TileLayer: RL.TileLayer,
          Marker: RL.Marker,
          Popup: RL.Popup,
          Tooltip: RL.Tooltip,
          GeoJSON: RL.GeoJSON,
          ZoomControl: RL.ZoomControl,
        });
      } catch (err) {
        console.error("Failed to load Leaflet:", err);
        if (!cancelled) {
          setLoadError(
            "The map failed to load. Check the browser console for the underlying error.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  // Fetch Nepal's country outline once, client-side. Failure is non-fatal —
  // the map still works fine without it, just less visually grounded.
  useEffect(() => {
    if (!leafletReady) return;
    let cancelled = false;
    fetch(NEPAL_OUTLINE_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setNepalOutline(data);
      })
      .catch(() => {
        /* silently ignore — outline is a nice-to-have, not a dependency */
      });
    return () => {
      cancelled = true;
    };
  }, [leafletReady]);

  // Robust resize handling: a ResizeObserver on the wrapper element catches
  // layout settling (flex children measuring late), sidebar toggles, etc.
  // This replaces the unreliable `whenCreated` callback from the prior version.
  useEffect(() => {
    if (!leafletReady || !wrapperRef.current || !mapRef.current) return;
    const el = wrapperRef.current;
    const map = mapRef.current;

    const invalidate = () => map.invalidateSize();
    const observer = new ResizeObserver(invalidate);
    observer.observe(el);

    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 400);

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [leafletReady]);

  // Show the *whole* country with every marker in frame on first load,
  // instead of a fixed zoom level that might crop half the data out.
  useEffect(() => {
    if (!leafletReady || !modules || !mapRef.current || hasFitAll) return;
    const bounds = modules.L.latLngBounds(
      mapMarkers.map((m) => [m.lat, m.lng] as [number, number]),
    );
    mapRef.current.fitBounds(bounds, { padding: [30, 30] });
    setHasFitAll(true);
  }, [leafletReady, modules, hasFitAll]);

  const hottestId = useMemo(
    () =>
      [...mapMarkers].sort(
        (a, b) => parseFloat(b.change) - parseFloat(a.change),
      )[0]!.id,
    [],
  );

  const visibleMarkers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mapMarkers.filter((m) => {
      const regionMatch = activeRegion === "All" || m.region === activeRegion;
      const queryMatch =
        !q ||
        m.area.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        m.region.toLowerCase().includes(q);
      return regionMatch && queryMatch;
    });
  }, [activeRegion, query]);

  const selected =
    mapMarkers.find((m) => m.id === selectedId) ?? mapMarkers[0]!;

  const icons = useMemo(() => {
    if (!modules) return null;
    const L = modules.L;
    const map = new Map<number, any>();
    for (const m of mapMarkers) {
      map.set(
        m.id,
        L.divIcon({
          html: renderToStaticMarkup(
            <PinMarkup
              marker={m}
              isSelected={m.id === selectedId}
              isHottest={m.id === hottestId}
            />,
          ),
          className: "lp-pin",
          iconSize: [PIN_WIDTH, PIN_HEIGHT],
          iconAnchor: [PIN_WIDTH / 2, PIN_HEIGHT],
        }),
      );
    }
    return map;
  }, [modules, selectedId, hottestId]);

  function focusMarker(m: MarketMarker) {
    setSelectedId(m.id);
    mapRef.current?.flyTo?.(
      [m.lat, m.lng],
      Math.max(mapRef.current.getZoom(), 11),
      { duration: 0.6 },
    );
  }

  function resetView() {
    setQuery("");
    setActiveRegion("All");
    if (modules && mapRef.current) {
      const bounds = modules.L.latLngBounds(
        mapMarkers.map((m) => [m.lat, m.lng] as [number, number]),
      );
      mapRef.current.flyToBounds(bounds, { padding: [30, 30], duration: 0.7 });
    }
  }

  const avgChange =
    visibleMarkers.length > 0
      ? visibleMarkers.reduce((sum, m) => sum + parseFloat(m.change), 0) /
        visibleMarkers.length
      : 0;

  return (
    <section className="py-xl bg-surface-container border-y border-outline-variant relative z-10">
      <style>{`
        @keyframes lp-pulse {
          0% { box-shadow: 0 0 0 0 rgba(185,28,28,0.55); }
          70% { box-shadow: 0 0 0 8px rgba(185,28,28,0); }
          100% { box-shadow: 0 0 0 0 rgba(185,28,28,0); }
        }
        .lp-pin, .lp-pin * { overflow: visible; }
        .lp-pin { background: transparent !important; border: none !important; }
        .lp-popup .leaflet-popup-content-wrapper {
          border-radius: 3px;
          border: 1px solid #d8d3c7;
          box-shadow: 0 4px 14px rgba(0,0,0,0.1);
        }
        .lp-popup .leaflet-popup-content { margin: 10px 12px; }
        .lp-popup .leaflet-popup-tip { border: 1px solid #d8d3c7; }
        .lp-tooltip {
          background: #244530;
          color: #fdfcf8;
          border: none;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 2px;
        }
        .lp-tooltip::before { border-top-color: #244530; }
        .leaflet-tile-pane { filter: saturate(0.3) brightness(1.08) contrast(0.95); }
        .leaflet-control-attribution { font-size: 9px; }
      `}</style>

      <div className="max-w-container-max mx-auto px-gutter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-md">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary mb-xs">
              Market Explorer
            </h2>
            <p className="font-body-md text-on-surface-variant max-w-xl">
              Real-time valuation trends across {mapMarkers.length} verified
              survey sectors nationwide.
            </p>
          </div>
          <a
            href="/map"
            className="font-label-sm text-label-sm text-primary flex items-center gap-xs hover:underline self-start sm:self-auto"
          >
            Launch Full Map <Icon name="open_in_new" className="text-[18px]" />
          </a>
        </div>

        {/* Search + region chips */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-md">
          <div className="relative w-full sm:w-64">
            <Icon
              name="search"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search area or city…"
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-full border border-outline-variant bg-surface focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["All", ...REGIONS] as const).map((region) => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`font-label-sm text-label-sm px-3 py-1.5 rounded-full border transition-colors ${
                  activeRegion === region
                    ? "bg-primary text-white border-primary"
                    : "bg-surface text-on-surface-variant border-outline-variant hover:border-primary"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Map + sidebar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div
            ref={wrapperRef}
            className="relative flex-1 border border-outline-variant overflow-hidden rounded-sm shadow-sm"
            style={{ height: "560px", background: "#f4f2ec" }}
          >
            {/* Featured stat card */}
            <div className="absolute top-4 left-4 z-[1000] bg-surface/95 backdrop-blur-sm border border-primary px-3 py-2 flex flex-col shadow-md min-w-[150px] rounded-sm">
              <span className="mono-stat text-data-table text-primary tracking-tighter font-bold text-lg leading-none">
                {selected.price}
              </span>
              <div
                className={`flex items-center gap-1 text-[11px] font-bold mt-0.5 ${
                  selected.trend === "up"
                    ? "text-error"
                    : "text-on-secondary-container"
                }`}
              >
                <Icon name={trendIconName(selected.trend)} className="text-[13px]" />
                {selected.change}
              </div>
              <div className="text-[11px] font-semibold text-primary mt-1.5 leading-tight">
                {selected.area}
              </div>
              <div className="text-[10px] text-on-surface-variant leading-tight flex items-center gap-1">
                {selected.city}
                {selected.verified && (
                  <Icon name="verified" className="text-[11px] text-primary" />
                )}
              </div>
            </div>

            {/* Region average + reset, top-right */}
            <div className="absolute top-4 right-4 z-[1000] flex items-start gap-2">
              <div className="bg-surface/95 backdrop-blur-sm border border-outline-variant px-3 py-2 shadow-sm rounded-sm text-right">
                <div className="text-[10px] text-on-surface-variant">
                  {activeRegion === "All" ? "Nationwide" : activeRegion} avg. change
                </div>
                <div className="font-bold text-primary text-sm">
                  {visibleMarkers.length > 0 ? `+${avgChange.toFixed(1)}%` : "—"}
                </div>
              </div>
              <button
                onClick={resetView}
                title="Reset view"
                className="bg-surface/95 border border-outline-variant w-9 h-9 rounded-sm shadow-sm flex items-center justify-center hover:border-primary"
              >
                <Icon name="refresh" className="text-[16px] text-primary" />
              </button>
            </div>

            <div className="absolute bottom-4 left-4 z-[1000] w-9 h-9 rounded-full bg-surface border border-outline-variant flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-primary">N</span>
            </div>

            <div className="absolute bottom-4 right-4 z-[1000] text-[10px] text-on-surface-variant bg-surface/85 px-2 py-1 rounded-sm border border-outline-variant/50">
              Scroll to zoom · Hover for details · Click to open
            </div>

            {isClient && modules && icons ? (
              <modules.MapContainer
                ref={mapRef}
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                minZoom={6}
                maxZoom={18}
                scrollWheelZoom
                zoomControl={false}
                className="w-full h-full"
                style={{ height: "100%", width: "100%" }}
              >
                <modules.TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  subdomains="abc"
                  maxZoom={19}
                />

                <modules.ZoomControl position="bottomright" />

                {nepalOutline && (
                  <modules.GeoJSON
                    data={nepalOutline}
                    style={{
                      color: "#244530",
                      weight: 1.5,
                      opacity: 0.6,
                      fillColor: "#244530",
                      fillOpacity: 0.03,
                      dashArray: "4 3",
                    }}
                  />
                )}

                {visibleMarkers.map((m) => (
                  <modules.Marker
                    key={m.id}
                    position={[m.lat, m.lng]}
                    icon={icons.get(m.id)}
                    eventHandlers={{ click: () => setSelectedId(m.id) }}
                  >
                    <modules.Tooltip
                      className="lp-tooltip"
                      direction="top"
                      offset={[0, -PIN_HEIGHT]}
                    >
                      {m.area} · {m.price}
                    </modules.Tooltip>
                    <modules.Popup className="lp-popup" closeButton={false}>
                      <div className="min-w-[180px]">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="font-bold text-[#244530] text-base">
                            {m.price}
                          </span>
                          {m.verified && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#244530]">
                              <Icon name="verified" className="text-[13px]" />
                              Verified
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-xs font-semibold mb-1.5 ${
                            m.trend === "up" ? "text-red-600" : "text-slate-600"
                          }`}
                        >
                          {m.trend === "up" ? "↑" : m.trend === "flat" ? "→" : "↓"}{" "}
                          {m.change} this period
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {m.area}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">{m.city}</div>
                        <div className="text-xs text-gray-600 leading-snug">
                          {m.description}
                        </div>
                      </div>
                    </modules.Popup>
                  </modules.Marker>
                ))}
              </modules.MapContainer>
            ) : loadError ? (
              <div className="absolute inset-0 flex items-center justify-center px-8">
                <div className="text-center max-w-sm">
                  <Icon name="cloud_off" className="text-[28px] text-on-surface-variant mb-2" />
                  <p className="text-sm text-on-surface-variant">{loadError}</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-on-surface-variant">
                    Loading Nepal market map…
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar list, synced with the map */}
          <div
            className="lg:w-[300px] flex-shrink-0 border border-outline-variant rounded-sm bg-surface overflow-hidden flex flex-col"
            style={{ height: "560px" }}
          >
            <div className="px-3 py-2 border-b border-outline-variant flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {visibleMarkers.length} location{visibleMarkers.length !== 1 ? "s" : ""}
              </span>
              <span className="font-label-sm text-label-sm text-primary">
                Sorted by value
              </span>
            </div>
            <div className="overflow-y-auto flex-1">
              {visibleMarkers.length === 0 && (
                <div className="p-4 text-sm text-on-surface-variant text-center">
                  No locations match "{query}".
                </div>
              )}
              {[...visibleMarkers]
                .sort((a, b) => b.priceValue - a.priceValue)
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => focusMarker(m)}
                    className={`w-full text-left px-3 py-2.5 border-b border-outline-variant/60 transition-colors ${
                      m.id === selectedId ? "bg-primary/10" : "hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary text-sm">{m.price}</span>
                      <span
                        className={`flex items-center gap-0.5 text-[11px] font-bold ${
                          m.trend === "up" ? "text-error" : "text-on-secondary-container"
                        }`}
                      >
                        <Icon name={trendIconName(m.trend)} className="text-[12px]" />
                        {m.change}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs font-semibold text-on-surface">
                        {m.area}
                      </span>
                      {m.verified && (
                        <Icon name="verified" className="text-[11px] text-primary" />
                      )}
                    </div>
                    <div className="text-[11px] text-on-surface-variant">
                      {m.city} · {m.region}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            Rising value
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            Stable
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="verified" className="text-[14px] text-primary" />
            Verified listing
          </div>
          <div className="ml-auto font-medium text-primary">
            Nepal · {mapMarkers.length} major locations mapped
          </div>
        </div>
      </div>
    </section>
  );
}

export default MapExplorer;