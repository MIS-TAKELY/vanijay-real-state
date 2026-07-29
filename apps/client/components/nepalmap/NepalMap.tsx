"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
  GeoJSON,
} from "react-leaflet";
import L from "leaflet";
import type {
  Marker as MarkerType,
  MapMode,
  NepalMapProps,
  ModalTab,
  FlyToTarget,
} from "./types";
import {
  DEFAULT_MAP_CONFIG,
  DEFAULT_MAP_MODES,
  TILE_URLS,
  TILE_ATTR,
  KEYFRAMES,
  PIN_WIDTH,
  PIN_HEIGHT,
} from "./config";
import {
  filterMarkers,
  computeAvgChange,
  normalizeMarker,
} from "./utils";
import { CompassRose, HintBar, MobileListToggle } from "./components/MapControls";
import { DetailCard } from "./components/DetailCard";
import { Sidebar } from "./components/Sidebar";
import { MapModeSwitcher } from "./components/MapModeSwitcher";
import { StreetViewModal } from "./components/StreetViewModal";
import { renderPinHtml } from "./components/PinMarkup";

// Inject keyframes CSS once
if (typeof document !== "undefined" && !document.getElementById("nm-keyframes")) {
  const style = document.createElement("style");
  style.id = "nm-keyframes";
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
}

/**
 * MapSetup – child component that uses useMap hook to handle resize invalidation and bounds fitting.
 * Must be rendered inside MapContainer.
 */
function MapSetup({
  boundsTarget,
}: {
  boundsTarget: L.LatLngBoundsExpression | null;
}) {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.enable();
    const invalidate = () => map.invalidateSize();
    const container = map.getContainer();
    const observer = new ResizeObserver(invalidate);
    observer.observe(container);

    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 400);

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  useEffect(() => {
    if (boundsTarget) {
      map.fitBounds(boundsTarget, { padding: [40, 40], animate: true, duration: 0.8 });
    }
  }, [boundsTarget, map]);

  return null;
}

/**
 * FlyTo – child component that uses useMap hook to animate the map to a target.
 * Must be rendered inside MapContainer.
 */
function FlyTo({ target }: { target: FlyToTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.setView([target.lat, target.lng], target.zoom, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [target, map]);
  return null;
}

/**
 * ZoomControl – custom styled +/− buttons rendered inside the Leaflet map.
 * Positioned via Leaflet's leaflet-top leaflet-left control slot, but nudged
 * down so they never collide with the top search-bar overlay.
 */
function ZoomControl() {
  const map = useMap();
  const btnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(13,26,20,0.88)",
    border: "1px solid rgba(74,222,128,0.25)",
    borderRadius: 8,
    color: "#4ade80",
    fontSize: 20,
    fontWeight: 300,
    cursor: "pointer",
    lineHeight: 1,
    userSelect: "none",
    transition: "background 0.15s ease",
    backdropFilter: "blur(8px)",
  };
  return (
    <div
      className="leaflet-top leaflet-left"
      style={{ marginTop: 56, marginLeft: 8 }}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div className="leaflet-control" style={{ display: "flex", flexDirection: "column", gap: 4, margin: 0 }}>
        <button
          type="button"
          aria-label="Zoom in"
          style={btnStyle}
          onClick={() => map.zoomIn()}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(36,69,48,0.95)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(13,26,20,0.88)"; }}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          style={btnStyle}
          onClick={() => map.zoomOut()}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(36,69,48,0.95)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(13,26,20,0.88)"; }}
        >
          −
        </button>
      </div>
    </div>
  );
}

/**
 * ProvinceBoundaries – memoized so it never re-renders when parent state
 * (search, selected marker, hover) changes. Prevents expensive GeoJSON diffing.
 */
const PROVINCE_STYLE = {
  fillColor: "transparent" as const,
  fillOpacity: 0,
  weight: 1.5,
  color: "#4ade80",
  opacity: 0.45,
  dashArray: "8, 6",
};
const ProvinceBoundaries = memo(function ProvinceBoundaries({ data }: { data: any }) {
  return <GeoJSON data={data} style={PROVINCE_STYLE} />;
});

/**
 * DistrictBoundaries – memoized; hover handlers attached once on mount.
 * Uses stable onEachFeature callback (useCallback) from parent.
 */
const DISTRICT_STYLE = {
  fillColor: "#244530",
  fillOpacity: 0.06,
  weight: 0.7,
  color: "rgba(74, 222, 128, 0.35)",
};
const DistrictBoundaries = memo(function DistrictBoundaries({
  data,
  onEachFeature,
}: {
  data: any;
  onEachFeature: (feature: any, layer: any) => void;
}) {
  return <GeoJSON data={data} onEachFeature={onEachFeature} style={DISTRICT_STYLE} />;
});

/**
 * NepalMap — a fully-featured, reusable interactive map component.
 *
 * Features:
 *  - Leaflet-based map with dark / satellite / streets tile modes
 *  - Custom HTML pin markers with price, trend, and HOT badges
 *  - Region, tier, price-range, and verified-only filtering
 *  - Sidebar listing with sorted markers
 *  - Glassmorphism detail card with satellite zoom & street view
 *  - Fullscreen Street View / Satellite / Data modal
 *  - Responsive: sidebar off-canvas on mobile
 */
export function NepalMap({
  markers: rawMarkers = [],
  config,
  regions,
  regionCenters,
  mapModes = DEFAULT_MAP_MODES,
  className,
  height = "clamp(500px, 72vh, 820px)",
  defaultShowList = true,
  onMarkerSelect,
  onMapModeChange,
  tileUrl,
  tileAttribution = TILE_ATTR,
}: NepalMapProps) {
  const mapConfig = { ...DEFAULT_MAP_CONFIG, ...config };

  // Normalize markers
  const markers = useMemo(
    () => rawMarkers.map(normalizeMarker),
    [rawMarkers]
  );

  // ─── State ──────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showList, setShowList] = useState(defaultShowList);
  const [mapMode, setMapMode] = useState<MapMode>(
    mapModes[0] ?? "dark"
  );
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [streetViewModal, setStreetViewModal] = useState<MarkerType | null>(null);
  const [modalTab, setModalTab] = useState<ModalTab>("streetview");
  const [flyToTarget, setFlyToTarget] = useState<FlyToTarget | null>(null);
  const [boundsTarget, setBoundsTarget] = useState<L.LatLngBoundsExpression | null>(null);

  // ─── Filters & Search ─────────────────────────────────────
  const [activeRegion, setActiveRegion] = useState<string>("all");
  const [activeTier, setActiveTier] = useState<string>("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [query, setQuery] = useState("");
  // Debounced query avoids re-filtering + re-generating marker icons on every keystroke
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const queryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
    queryDebounceRef.current = setTimeout(() => setDebouncedQuery(value), 150);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => () => { if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current); }, []);

  const listRef = useRef<HTMLDivElement>(null);

  // ─── Nepal GeoJSON Data (district/province boundaries) ────────
  const [districtData, setDistrictData] = useState<any>(null);
  const [provinceData, setProvinceData] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/geojson/nepal-districts.json").then((r) => (r.ok ? r.json() : null)),
      fetch("/geojson/nepal-provinces.json").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([districts, provinces]) => {
        if (districts) setDistrictData(districts);
        if (provinces) setProvinceData(provinces);
      })
      .catch(() => {});
  }, []);

  // ─── Derived: filtered markers ────────────────────────────
  const visibleMarkers = useMemo(
    () =>
      filterMarkers(markers, {
        region: activeRegion,
        tier: activeTier,
        minPrice,
        maxPrice,
        verifiedOnly,
        query: debouncedQuery,
        sortBy: "price",
      }),
    [markers, activeRegion, activeTier, minPrice, maxPrice, verifiedOnly, debouncedQuery]
  );

  const avgChange = useMemo(
    () => computeAvgChange(visibleMarkers),
    [visibleMarkers]
  );

  // ─── Interactive District Hover & Tooltips ────────────────────
  const onEachDistrict = useCallback((feature: any, layer: any) => {
    const props = feature.properties || {};
    const districtName =
      props.DISTRICT || props.district || props.FIRST_DIST || "";
    const provinceNum =
      props.PROVINCE || props.province || props.FIRST_PROV || "";

    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({
          fillColor: "#4ade80",
          fillOpacity: 0.25,
          weight: 1.5,
          color: "#4ade80",
        });
      },
      mouseout: (e: any) => {
        e.target.setStyle({
          fillColor: "#244530",
          fillOpacity: 0.06,
          weight: 0.7,
          color: "rgba(74, 222, 128, 0.35)",
        });
      },
    });

    if (districtName) {
      layer.bindTooltip(
        `<div style="font-weight:700; color:#4ade80;">${districtName} ${provinceNum ? `<span style="font-weight:400; opacity:0.75; font-size:10px;">(Province ${provinceNum})</span>` : ""}</div>`,
        { sticky: true, className: "nm-tooltip", direction: "top" }
      );
    }
  }, []);

  // ─── Selected marker ──────────────────────────────────────
  const selected = useMemo(
    () => markers.find((m: MarkerType) => m.id === selectedId) ?? null,
    [markers, selectedId]
  );

  // ─── Effects ──────────────────────────────────────────────
  useEffect(() => {
    onMarkerSelect?.(selected);
  }, [selected, onMarkerSelect]);

  const handleMapModeChange = (mode: MapMode) => {
    setMapMode(mode);
    onMapModeChange?.(mode);
  };

  const focusMarker = (m: MarkerType) => {
    setSelectedId(m.id);
    setBoundsTarget(null);
    setFlyToTarget({ lat: m.lat, lng: m.lng, zoom: 15 });
  };

  const handleMarkerClick = (m: MarkerType) => {
    setSelectedId(m.id);
    setBoundsTarget(null);
    setFlyToTarget({ lat: m.lat, lng: m.lng, zoom: 15 });
  };

  const handleCloseDetail = () => {
    setSelectedId(null);
  };

  const handleSatelliteZoom = (m: MarkerType) => {
    setMapMode("satellite");
    setBoundsTarget(null);
    setFlyToTarget({ lat: m.lat, lng: m.lng, zoom: 18 });
  };

  const handleStreetView = (m: MarkerType) => {
    setStreetViewModal(m);
    setModalTab("streetview");
  };

  const handleCloseStreetView = () => {
    setStreetViewModal(null);
  };

  const handleResetView = () => {
    setSelectedId(null);
    setQuery("");
    setActiveRegion("all");
    setVerifiedOnly(false);
    if (visibleMarkers.length > 0) {
      const bounds = L.latLngBounds(visibleMarkers.map((m) => [m.lat, m.lng]));
      setFlyToTarget(null);
      setBoundsTarget(bounds);
    }
  };

  // ─── Marker icon generation ───────────────────────────────
  const markerIcons = useMemo(() => {
    const icons: Record<number, L.DivIcon> = {};
    markers.forEach((m: MarkerType) => {
      const isSelected = m.id === selectedId;
      const isHottest =
        visibleMarkers.length > 0 &&
        m.id ===
          visibleMarkers.reduce((prev: MarkerType, curr: MarkerType) =>
            curr.priceValue > prev.priceValue ? curr : prev
          ).id;
      const html = renderPinHtml(m, isSelected, isHottest);
      icons[m.id] = L.divIcon({
        html,
        className: "nm-marker",
        iconSize: [PIN_WIDTH, PIN_HEIGHT],
        iconAnchor: [PIN_WIDTH / 2, PIN_HEIGHT],
        popupAnchor: [0, -PIN_HEIGHT],
      });
    });
    return icons;
  }, [markers, selectedId, visibleMarkers]);

  // ─── Render ───────────────────────────────────────────────
  return (
    <section
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      {/* Top Search & Filter Bar Overlay */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 16,
          zIndex: 1000,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          // Reserve space for the mode switcher: 16px gutter + ~160px switcher + 16px gap + sidebar (when open)
          maxWidth: showList
            ? "calc(100% - 510px)"
            : "calc(100% - 210px)",
          transition: "max-width 0.3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(13,26,20,0.85)",
            border: "1px solid rgba(74,222,128,0.25)",
            backdropFilter: "blur(12px)",
            borderRadius: 99,
            padding: "4px 12px",
          }}
        >
          <span style={{ color: "#4ade80", fontSize: 13, marginRight: 6 }}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search area or city..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#f0fdf4",
              fontSize: 12,
              width: 130,
            }}
          />
        </div>

        {["all", "Kathmandu Valley", "Pokhara", "Eastern", "Western"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setActiveRegion(r)}
            style={{
              background: activeRegion === r ? "#244530" : "rgba(13,26,20,0.8)",
              color: activeRegion === r ? "#4ade80" : "rgba(209,250,229,0.7)",
              border: activeRegion === r ? "1px solid #4ade80" : "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 99,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {r === "all" ? "All Nepal" : r}
          </button>
        ))}

        <button
          type="button"
          onClick={handleResetView}
          style={{
            background: "rgba(13,26,20,0.85)",
            color: "#4ade80",
            border: "1px solid rgba(74,222,128,0.3)",
            backdropFilter: "blur(10px)",
            borderRadius: 99,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
          }}
          title="Fit all markers on map"
        >
          🎯 Reset View
        </button>
      </div>

      {/* Map Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      >
        {/* Leaflet Map */}
        <MapContainer
          center={mapConfig.center}
          zoom={mapConfig.zoom}
          minZoom={mapConfig.minZoom}
          maxZoom={mapConfig.maxZoom}
          scrollWheelZoom={true}
          zoomControl={false}
          zoomSnap={0.5}
          zoomDelta={0.5}
          wheelDebounceTime={0}
          wheelPxPerZoomLevel={60}
          preferCanvas={true}
          style={{ flex: 1, height: "100%" }}
        >
          <MapSetup boundsTarget={boundsTarget} />
          <FlyTo target={flyToTarget} />
          <ZoomControl />
          <TileLayer
            url={tileUrl ?? TILE_URLS[mapMode]}
            attribution={tileAttribution}
            key={mapMode}
            updateWhenZooming={false}
            keepBuffer={4}
          />

          {/* Province boundaries — memoized, won't re-render on marker/search changes */}
          {provinceData && <ProvinceBoundaries data={provinceData} />}
          {/* District boundaries — memoized, hover handlers attached once */}
          {districtData && (
            <DistrictBoundaries data={districtData} onEachFeature={onEachDistrict} />
          )}
          {visibleMarkers.map((m: MarkerType) => (
            <Marker
              key={m.id}
              position={[m.lat, m.lng]}
              icon={markerIcons[m.id]}
              eventHandlers={{
                click: () => handleMarkerClick(m),
                mouseover: () => setHoveredId(m.id),
                mouseout: () => setHoveredId(null),
              }}
            >
              <Tooltip
                className="nm-tooltip"
                direction="top"
                offset={[0, -PIN_HEIGHT]}
                permanent={false}
              >
                <strong>{m.area}</strong> · {m.price} ·{" "}
                <span style={{ color: "#4ade80" }}>
                  {m.trend === "up" ? "↑" : m.trend === "down" ? "↓" : "→"} {m.change}
                </span>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>

        {/* Sidebar */}
        <Sidebar
          markers={visibleMarkers}
          selectedId={selectedId}
          avgChange={avgChange}
          onMarkerClick={focusMarker}
          showList={showList}
          listRef={listRef}
        />
      </div>

      {/* Map Controls */}
      <CompassRose />
      <HintBar />
      <MobileListToggle showList={showList} onToggle={() => setShowList((v: boolean) => !v)} />
      <MapModeSwitcher
        mode={mapMode}
        modes={mapModes}
        onChange={handleMapModeChange}
        rightOffset={showList ? 316 : 16}
      />

      {/* Detail Card */}
      {selected && (
        <DetailCard
          marker={selected}
          onClose={handleCloseDetail}
          onStreetView={handleStreetView}
          onSatelliteZoom={handleSatelliteZoom}
        />
      )}

      {/* Street View Modal */}
      {streetViewModal && (
        <StreetViewModal
          marker={streetViewModal}
          tab={modalTab}
          onTabChange={setModalTab}
          onClose={handleCloseStreetView}
        />
      )}
    </section>
  );
}

export default NepalMap;
