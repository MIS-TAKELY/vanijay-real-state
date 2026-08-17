"use client";

import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DetailCard } from "../googlemap/components/DetailCard";
import { MobileListToggle } from "../googlemap/components/MapControls";
import { Sidebar } from "../googlemap/components/Sidebar";
import { StreetViewModal } from "../googlemap/components/StreetViewModal";
import { NEPAL_GEOJSON } from "../googlemap/nepalGeoJson";
import type {
  Marker as MarkerType,
  ModalTab,
  NepalMapProps,
} from "../googlemap/types";
import { computeAvgChange, getTrendColor } from "../googlemap/utils";

/* ─── Tile Providers ─────────────────────────────────────────────── */

const TILE_PROVIDERS: Record<
  "dark" | "satellite" | "streets",
  { url: string; options: L.TileLayerOptions }
> = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    options: { maxZoom: 19, subdomains: "abcd" },
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    options: {
      maxZoom: 18,
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    },
  },
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
};

/* ─── helpers ─────────────────────────────────────────────────────── */

// One consistent initial/fit zoom for every screen — the map keeps the same
// view at all breakpoints except mobile, where we pull back one level.
const NEPAL_ZOOM = { desktop: 7, mobile: 6 } as const;
const DESKTOP_MIN_WIDTH = 768;

const PIN_SIZES = {
  desktop: { width: 96, height: 56, anchorX: 48, anchorY: 56 },
  mobile: { width: 68, height: 42, anchorX: 34, anchorY: 42 },
} as const;

function getNepalZoom(isMobile: boolean | undefined): number {
  return isMobile ? NEPAL_ZOOM.mobile : NEPAL_ZOOM.desktop;
}

function getPinSize(isMobile: boolean | undefined) {
  return isMobile ? PIN_SIZES.mobile : PIN_SIZES.desktop;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${DESKTOP_MIN_WIDTH - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < DESKTOP_MIN_WIDTH);
    };
    mql.addEventListener("change", onChange);
    onChange();
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

function formatDisplayPrice(price: string, priceValue?: number): string {
  if (price) {
    return price.replace(/रू/g, "₹").replace(/NPR/g, "₹").trim();
  }
  if (priceValue) {
    return `₹ ${priceValue}M`;
  }
  return "₹ 0";
}

function buildPinHtml(
  marker: MarkerType,
  selected: boolean,
  compact = false,
): string {
  const c = getTrendColor(marker.trend, marker.tier);
  const formattedPrice = formatDisplayPrice(marker.price, marker.priceValue);
  const trendSign =
    marker.trend === "up" ? "↑" : marker.trend === "down" ? "↓" : "-";
  const trendColor =
    marker.trend === "up"
      ? "#ef4444"
      : marker.trend === "down"
        ? "#3b82f6"
        : "#f97316";

  const w = compact ? 68 : 96;
  const priceFs = compact ? 9.5 : 11.5;
  const trendFs = compact ? 7.5 : 9.5;
  const areaFs = compact ? 7 : 8.5;
  const padding = compact ? "2px 4px" : "4px 6px";
  const borderTop = compact ? "2.5px" : "3.5px";
  const borderRadius = compact ? 6 : 8;
  const selectedScale = compact ? 1.1 : 1.15;
  const selectedLift = compact ? "-3px" : "-4px";

  return `
<div style="width:${w}px;display:flex;flex-direction:column;align-items:center;cursor:pointer;${
    selected
      ? `filter:drop-shadow(0 10px 20px rgba(0,0,0,0.4));transform:scale(${selectedScale}) translateY(${selectedLift});`
      : "filter:drop-shadow(0 3px 8px rgba(0,0,0,0.22));transform:scale(1);"
  }transform-origin:bottom center;transition:transform 0.28s cubic-bezier(.175,.885,.32,1.275),filter 0.28s ease">
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:${borderTop} solid ${c};border-radius:${borderRadius}px;padding:${padding};position:relative;width:${w}px;box-sizing:border-box;text-align:center;box-shadow:0 3px 10px rgba(0,0,0,0.22)">
    <div style="font-size:${priceFs}px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;white-space:nowrap;font-family:system-ui,-apple-system,sans-serif;line-height:1.2">${formattedPrice}</div>
    <div style="font-size:${trendFs}px;font-weight:700;color:${trendColor};margin-top:1px;line-height:1.2">${trendSign} ${marker.change}</div>
    <div style="font-size:${areaFs}px;font-weight:600;color:#64748b;margin-top:1px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:${w - 8}px">${marker.area}</div>
  </div>
  <div style="width:0;height:0;border-left:${compact ? 4 : 6}px solid transparent;border-right:${compact ? 4 : 6}px solid transparent;border-top:${compact ? 5 : 7}px solid #ffffff;margin-top:-1px"></div>
</div>`;
}

/* ─── Main Component ──────────────────────────────────────────────── */

export default function LeafletNepalMap({
  markers = [],
  height = "clamp(280px, 38vh, 420px)",
  className,
  defaultShowList = false,
  onMarkerSelect,
}: NepalMapProps & { height?: string; className?: string }) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const leafletMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  const [mapMode, setMapMode] = useState<"dark" | "satellite" | "streets">(
    "dark",
  );
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>("streetview");
  const [mobileListOpen, setMobileListOpen] = useState(defaultShowList);
  const isMobile = useIsMobile();

  // Desktop/tablet (≥768px): sidebar always visible. Mobile: toggled via list button.
  const showList = isMobile ? mobileListOpen : true;

  const filteredMarkers = useMemo(() => {
    if (selectedRegion === "all") return markers;
    return markers.filter(
      (m) => m.region === selectedRegion || m.city === selectedRegion,
    );
  }, [markers, selectedRegion]);

  const selectedMarker =
    filteredMarkers.find((m) => m.id === selectedId) ?? null;
  const avgChange = useMemo(
    () => computeAvgChange(filteredMarkers),
    [filteredMarkers],
  );

  // Initialize Leaflet map once + load Nepal border GeoJSON
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const mobile = window.innerWidth < DESKTOP_MIN_WIDTH;
    const map = L.map(containerRef.current, {
      center: [28.2, 84.4],
      zoom: getNepalZoom(mobile),
      zoomControl: false,
      attributionControl: false,
    });

    const provider = TILE_PROVIDERS.dark;
    tileLayerRef.current = L.tileLayer(provider.url, provider.options).addTo(
      map,
    );

    // Native zoom control disabled — using custom React buttons

    // Render green country & province borders for Nepal with translucent green fill on hover
    try {
      L.geoJSON(NEPAL_GEOJSON as unknown as GeoJSON.GeoJsonObject, {
        style: {
          color: "#8a6d1d",
          weight: 1.5,
          opacity: 0.9,
          fillColor: "#c9a227",
          fillOpacity: 0,
        },
        onEachFeature: (_feature, layer) => {
          layer.on({
            mouseover: (e) => {
              const target = e.target;
              target.setStyle({
                fillColor: "#c9a227",
                fillOpacity: 0.22,
                weight: 2,
                color: "#c9a227",
              });
            },
            mouseout: (e) => {
              const target = e.target;
              target.setStyle({
                color: "#8a6d1d",
                weight: 1.5,
                fillColor: "#c9a227",
                fillOpacity: 0,
              });
            },
          });
        },
      }).addTo(map);
    } catch {
      // Fallback if geojson parsing fails
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Keep the country-level zoom in sync when crossing the mobile breakpoint.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || isMobile === undefined || selectedId) return;
    map.setView([28.2, 84.4], getNepalZoom(isMobile), { animate: false });
  }, [isMobile, selectedId]);

  // Handle map mode switches (Dark, Satellite, Streets)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const provider = TILE_PROVIDERS[mapMode];
    tileLayerRef.current = L.tileLayer(provider.url, provider.options).addTo(
      map,
    );
  }, [mapMode]);

  // Sync custom HTML markers on data or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    leafletMarkersRef.current.forEach((m) => m.remove());
    leafletMarkersRef.current.clear();

    const layerGroup = L.layerGroup().addTo(map);
    const pinSize = getPinSize(isMobile);
    const compactPins = !!isMobile;

    (filteredMarkers ?? []).forEach((m) => {
      const icon = L.divIcon({
        html: buildPinHtml(m, m.id === selectedId, compactPins),
        className: "",
        iconSize: [pinSize.width, pinSize.height],
        iconAnchor: [pinSize.anchorX, pinSize.anchorY],
      });

      const marker = L.marker([m.lat, m.lng], {
        icon,
        zIndexOffset: 1000,
      }).addTo(layerGroup);
      leafletMarkersRef.current.set(m.id, marker);

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedId(m.id);
        onMarkerSelect?.(m);
        map.flyTo([m.lat, m.lng], Math.max(map.getZoom(), isMobile ? 12 : 13), {
          duration: 0.8,
        });
      });
    });

    return () => {
      layerGroup.clearLayers();
      map.removeLayer(layerGroup);
    };
  }, [filteredMarkers, selectedId, onMarkerSelect, isMobile]);

  const handleMarkerClick = useCallback(
    (m: MarkerType) => {
      setSelectedId(m.id);
      onMarkerSelect?.(m);
      if (mapRef.current) {
        mapRef.current.flyTo([m.lat, m.lng], isMobile ? 13 : 14, { duration: 1.2 });
      }
    },
    [onMarkerSelect, isMobile],
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedId(null);
    onMarkerSelect?.(null);
  }, [onMarkerSelect]);

  const handleStreetView = useCallback((m: MarkerType) => {
    window.open(
      `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${m.lat},${m.lng}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, []);

  const handleSatelliteZoom = useCallback((m: MarkerType) => {
    if (mapRef.current) {
      setMapMode("satellite");
      mapRef.current.flyTo([m.lat, m.lng], 16, { duration: 1.0 });
    }
  }, []);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        height,
        width: "100%",
        overflow: "hidden",
        background: "#0a2540",
        zIndex: 0,
      }}
    >
      {/* Leaflet CSS via CDN */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {/* ── Top Controls: 3-column layout ─────────────────────────────── */}

      {/* CENTER: Map view mode toggles */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? 10 : 14,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 1 : 2,
          background: "rgba(10, 20, 13, 0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 999,
          padding: isMobile ? "2px 3px" : "3px 4px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          maxWidth: isMobile ? "calc(100% - 120px)" : undefined,
        }}
      >
        {[
          { id: "dark", label: isMobile ? "Dark" : "🌑 Dark" },
          { id: "satellite", label: isMobile ? "Sat" : "🛰️ Satellite" },
          { id: "streets", label: isMobile ? "Map" : "🗺️ Streets" },
        ].map((mode) => {
          const active = mapMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() =>
                setMapMode(mode.id as "dark" | "satellite" | "streets")
              }
              style={{
                background: active ? "rgba(34, 197, 94, 0.22)" : "transparent",
                color: active ? "#c9a227" : "rgba(232,217,168,0.6)",
                border: active
                  ? "1px solid rgba(74,222,128,0.4)"
                  : "1px solid transparent",
                borderRadius: 999,
                padding: isMobile ? "2px 6px" : "3px 10px",
                fontSize: isMobile ? 9 : 10,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.18s ease",
                letterSpacing: "0.02em",
              }}
            >
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* RIGHT TOP: Region filter — clears the sidebar only while it's open */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? 10 : 14,
          right: showList ? 336 : isMobile ? 10 : 14,
          zIndex: 1000,
        }}
      >
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          style={{
            background: "rgba(10, 20, 13, 0.88)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(74,222,128,0.3)",
            borderRadius: 999,
            padding: isMobile ? "3px 8px" : "4px 10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            color: "#c9a227",
            fontSize: isMobile ? 9 : 10,
            fontWeight: 700,
            cursor: "pointer",
            outline: "none",
            letterSpacing: "0.02em",
            maxWidth: isMobile ? 96 : undefined,
          }}
        >
          <option
            value="all"
            style={{ background: "#0a2540", color: "#c9a227" }}
          >
            {isMobile ? "📍 All" : "📍 All Nepal"}
          </option>
          <option
            value="Kathmandu Valley"
            style={{ background: "#0a2540", color: "#c9a227" }}
          >
            Kathmandu Valley
          </option>
          <option
            value="Pokhara"
            style={{ background: "#0a2540", color: "#c9a227" }}
          >
            Pokhara Region
          </option>
          <option
            value="Central & Terai"
            style={{ background: "#0a2540", color: "#c9a227" }}
          >
            Central & Terai
          </option>
          <option
            value="Eastern"
            style={{ background: "#0a2540", color: "#c9a227" }}
          >
            Eastern Nepal
          </option>
          <option
            value="Western"
            style={{ background: "#0a2540", color: "#c9a227" }}
          >
            Western Nepal
          </option>
        </select>
      </div>

      {/* RIGHT CENTER: Zoom + Fit pill — clears the sidebar only while it's open */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: showList ? 336 : isMobile ? 10 : 14,
          transform: "translateY(-50%)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "rgba(10, 20, 13, 0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(74,222,128,0.3)",
          borderRadius: isMobile ? 10 : 14,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        {[
          {
            label: "+",
            title: "Zoom in",
            onClick: () =>
              mapRef.current?.setZoom((mapRef.current.getZoom() ?? 7) + 1, {
                animate: true,
              }),
          },
          {
            label: "−",
            title: "Zoom out",
            onClick: () =>
              mapRef.current?.setZoom((mapRef.current.getZoom() ?? 7) - 1, {
                animate: true,
              }),
          },
        ].map((btn, i) => (
          <button
            key={btn.label}
            type="button"
            title={btn.title}
            onClick={btn.onClick}
            style={{
              width: isMobile ? 24 : 28,
              height: isMobile ? 24 : 28,
              background: "transparent",
              color: "#c9a227",
              border: "none",
              borderBottom: i === 0 ? "1px solid rgba(74,222,128,0.2)" : "none",
              fontSize: isMobile ? 14 : 16,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.18s ease",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(34, 197, 94, 0.25)";
              (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#c9a227";
            }}
          >
            {btn.label}
          </button>
        ))}
        {/* Divider */}
        <div
          style={{
            width: "70%",
            height: 1,
            background: "rgba(74,222,128,0.2)",

            margin: "1px 0",
          }}
        />
        {/* Fit View */}
        <button
          type="button"
          title="Fit Nepal view"
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.flyTo(
                [28.2, 84.4],
                getNepalZoom(isMobile),
                { duration: 1.0 },
              );
            }
          }}
          style={{
            width: isMobile ? 24 : 28,
            height: isMobile ? 24 : 28,
            background: "transparent",
            color: "#c9a227",
            border: "none",
            fontSize: isMobile ? 10 : 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.18s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(34, 197, 94, 0.25)";
            (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#c9a227";
          }}
        >
          ⛶
        </button>
      </div>

      {isMobile && (
        <MobileListToggle
          showList={mobileListOpen}
          onToggle={() => setMobileListOpen((open) => !open)}
          className="scale-90 origin-bottom-right"
        />
      )}

      {/* Selected Marker Detail Card */}
      {selectedMarker && (
        <DetailCard
          marker={selectedMarker}
          onClose={handleCloseDetail}
          onStreetView={handleStreetView}
          onSatelliteZoom={handleSatelliteZoom}
        />
      )}

      {showList && (
        <Sidebar
          markers={filteredMarkers}
          selectedId={selectedId}
          avgChange={avgChange}
          onMarkerClick={handleMarkerClick}
          showList={showList}
          listRef={{ current: null }}
        />
      )}

      {/* 360 Street View / Satellite Modal */}
      {modalOpen && selectedMarker && (
        <StreetViewModal
          marker={selectedMarker}
          tab={modalTab}
          onTabChange={setModalTab}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
