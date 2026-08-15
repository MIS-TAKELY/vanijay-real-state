"use client";

import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DetailCard } from "../googlemap/components/DetailCard";
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

function formatDisplayPrice(price: string, priceValue?: number): string {
  if (price) {
    return price.replace(/रू/g, "₹").replace(/NPR/g, "₹").trim();
  }
  if (priceValue) {
    return `₹ ${priceValue}M`;
  }
  return "₹ 0";
}

function buildPinHtml(marker: MarkerType, selected: boolean): string {
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

  return `
<div style="width:96px;display:flex;flex-direction:column;align-items:center;cursor:pointer;${
    selected
      ? "filter:drop-shadow(0 12px 24px rgba(0,0,0,0.45));transform:scale(1.15) translateY(-4px);"
      : "filter:drop-shadow(0 4px 12px rgba(0,0,0,0.25));transform:scale(1);"
  }transform-origin:bottom center;transition:transform 0.28s cubic-bezier(.175,.885,.32,1.275),filter 0.28s ease">
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3.5px solid ${c};border-radius:8px;padding:4px 6px;position:relative;width:96px;box-sizing:border-box;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.25)">
    <div style="font-size:11.5px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;white-space:nowrap;font-family:system-ui,-apple-system,sans-serif;line-height:1.2">${formattedPrice}</div>
    <div style="font-size:9.5px;font-weight:700;color:${trendColor};margin-top:1px;line-height:1.2">${trendSign} ${marker.change}</div>
    <div style="font-size:8.5px;font-weight:600;color:#64748b;margin-top:1px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${marker.area}</div>
  </div>
  <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #ffffff;margin-top:-1px"></div>
</div>`;
}

/* ─── Main Component ──────────────────────────────────────────────── */

export default function LeafletNepalMap({
  markers = [],
  height = "clamp(420px, 52vh, 620px)",
  className,
  defaultShowList = true,
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
  const [showList, setShowList] = useState(defaultShowList);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>("streetview");

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

    const map = L.map(containerRef.current, {
      center: [28.2, 84.4],
      zoom: 7,
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
          color: "#22c55e",
          weight: 1.5,
          opacity: 0.9,
          fillColor: "#4ade80",
          fillOpacity: 0,
        },
        onEachFeature: (_feature, layer) => {
          layer.on({
            mouseover: (e) => {
              const target = e.target;
              target.setStyle({
                fillColor: "#4ade80",
                fillOpacity: 0.22,
                weight: 2,
                color: "#4ade80",
              });
            },
            mouseout: (e) => {
              const target = e.target;
              target.setStyle({
                color: "#22c55e",
                weight: 1.5,
                fillColor: "#4ade80",
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

    (filteredMarkers ?? []).forEach((m) => {
      const icon = L.divIcon({
        html: buildPinHtml(m, m.id === selectedId),
        className: "",
        iconSize: [96, 56],
        iconAnchor: [48, 56],
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
        map.panTo([m.lat, m.lng], { animate: true });
      });
    });

    return () => {
      layerGroup.clearLayers();
      map.removeLayer(layerGroup);
    };
  }, [filteredMarkers, selectedId, onMarkerSelect]);

  const handleMarkerClick = useCallback(
    (m: MarkerType) => {
      setSelectedId(m.id);
      onMarkerSelect?.(m);
      if (mapRef.current) {
        mapRef.current.panTo([m.lat, m.lng], { animate: true });
        mapRef.current.setZoom(11, { animate: true });
      }
    },
    [onMarkerSelect],
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
      mapRef.current.panTo([m.lat, m.lng], { animate: true });
      mapRef.current.setZoom(16, { animate: true });
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
        background: "#0d1a14",
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
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 3,
          background: "rgba(10, 20, 13, 0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 999,
          padding: "4px 6px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        {[
          { id: "dark", label: "🌑 Dark" },
          { id: "satellite", label: "🛰️ Satellite" },
          { id: "streets", label: "🗺️ Streets" },
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
                color: active ? "#4ade80" : "rgba(209,250,229,0.6)",
                border: active
                  ? "1px solid rgba(74,222,128,0.4)"
                  : "1px solid transparent",
                borderRadius: 999,
                padding: "5px 14px",
                fontSize: 11,
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

      {/* RIGHT TOP: Region filter */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 336,
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
            padding: "6px 14px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            color: "#4ade80",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            outline: "none",
            letterSpacing: "0.02em",
          }}
        >
          <option value="all" style={{ background: "#0d1a14", color: "#4ade80" }}>
            📍 All Nepal
          </option>
          <option
            value="Kathmandu Valley"
            style={{ background: "#0d1a14", color: "#4ade80" }}
          >
            Kathmandu Valley
          </option>
          <option value="Pokhara" style={{ background: "#0d1a14", color: "#4ade80" }}>
            Pokhara Region
          </option>
          <option
            value="Central & Terai"
            style={{ background: "#0d1a14", color: "#4ade80" }}
          >
            Central & Terai
          </option>
          <option value="Eastern" style={{ background: "#0d1a14", color: "#4ade80" }}>
            Eastern Nepal
          </option>
          <option value="Western" style={{ background: "#0d1a14", color: "#4ade80" }}>
            Western Nepal
          </option>
        </select>
      </div>

      {/* RIGHT CENTER: Zoom + Fit pill */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: 336,
          transform: "translateY(-50%)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "rgba(10, 20, 13, 0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(74,222,128,0.3)",
          borderRadius: 14,
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
              width: 36,
              height: 36,
              background: "transparent",
              color: "#4ade80",
              border: "none",
              borderBottom:
                i === 0 ? "1px solid rgba(74,222,128,0.2)" : "none",
              fontSize: 20,
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
              (e.currentTarget as HTMLButtonElement).style.color = "#4ade80";
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
              mapRef.current.panTo([28.2, 84.4], { animate: true });
              mapRef.current.setZoom(7, { animate: true });
            }
          }}
          style={{
            width: 36,
            height: 36,
            background: "transparent",
            color: "#4ade80",
            border: "none",
            fontSize: 15,
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
            (e.currentTarget as HTMLButtonElement).style.color = "#4ade80";
          }}
        >
          ⛶
        </button>
      </div>

      {/* Selected Marker Detail Card */}
      {selectedMarker && (
        <DetailCard
          marker={selectedMarker}
          onClose={handleCloseDetail}
          onStreetView={handleStreetView}
          onSatelliteZoom={handleSatelliteZoom}
        />
      )}

      {/* Right Overlay Sidebar */}
      <Sidebar
        markers={filteredMarkers}
        selectedId={selectedId}
        avgChange={avgChange}
        onMarkerClick={handleMarkerClick}
        showList={showList}
        listRef={{ current: null }}
      />

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
