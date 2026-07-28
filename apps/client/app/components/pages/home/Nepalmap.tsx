"use client";

import { Trend } from "app/types/nepal-map";
import { MARKERS, REGIONS } from "constants/varibles-constants";
import { Marker } from "leaflet";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */



/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */



/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */

function trendColor(trend: Trend, tier: Marker["tier"] = "standard") {
  if (trend === "up") {
    if (tier === "premium")  return "#dc2626"; // red-600
    if (tier === "emerging") return "#ea580c"; // orange-600
    return "#dc2626";
  }
  if (trend === "down") return "#2563eb";
  return "#64748b";
}

function trendLabel(trend: Trend) {
  if (trend === "up")   return "↑";
  if (trend === "down") return "↓";
  return "→";
}

/* ─────────────────────────────────────────────────────────────────────────────
   PIN MARKUP  (rendered to static HTML for Leaflet divIcon)
───────────────────────────────────────────────────────────────────────────── */

const PIN_W = 88;
const PIN_H = 46;

function PinMarkup({
  marker,
  selected,
  hottest,
}: {
  marker: Marker;
  selected: boolean;
  hottest: boolean;
}) {
  const c = trendColor(marker.trend, marker.tier);
  const bg = selected ? "#1a3326" : "#ffffff";
  const fg = selected ? "#ffffff" : "#111827";
  const sub = selected ? "rgba(255,255,255,0.7)" : c;

  return (
    <div
      style={{
        width: PIN_W,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        filter: selected
          ? "drop-shadow(0 12px 24px rgba(0,0,0,0.35))"
          : "drop-shadow(0 3px 8px rgba(0,0,0,0.18))",
        transform: selected ? "scale(1.18) translateY(-3px)" : "scale(1)",
        transformOrigin: "bottom center",
        transition: "transform 0.28s cubic-bezier(.175,.885,.32,1.275), filter 0.28s ease",
      }}
    >
      {/* bubble */}
      <div
        style={{
          background: bg,
          border: `2px solid ${selected ? "#244530" : "#e5e7eb"}`,
          borderLeft: `4px solid ${c}`,
          borderRadius: 10,
          padding: "5px 9px",
          position: "relative",
          minWidth: PIN_W - 8,
        }}
      >
        {/* HOT badge */}
        {hottest && (
          <span
            style={{
              position: "absolute",
              top: -7,
              right: -4,
              background: c,
              color: "#fff",
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.08em",
              padding: "1px 5px",
              borderRadius: 99,
              animation: "nm-pulse 2s ease-out infinite",
            }}
          >
            HOT
          </span>
        )}

        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: fg,
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {marker.price}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: sub,
            marginTop: 1,
          }}
        >
          {trendLabel(marker.trend)} {marker.change}
        </div>

        {/* caret */}
        <div
          style={{
            position: "absolute",
            bottom: -7,
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: 10,
            height: 10,
            background: bg,
            borderRight: `2px solid ${selected ? "#244530" : "#e5e7eb"}`,
            borderBottom: `2px solid ${selected ? "#244530" : "#e5e7eb"}`,
            zIndex: -1,
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAP CONTROLLER  (inner Leaflet hooks must be inside MapContainer)
───────────────────────────────────────────────────────────────────────────── */

function MapController({
  markers,
  flyTo,
  onReady,
}: {
  markers: Marker[];
  flyTo: { lat: number; lng: number; zoom?: number } | null;
  onReady: () => void;
}) {
  // We use require inside MapContainer so the hook runs with Leaflet context
  const { useMap } = require("react-leaflet");
  const map = useMap();
  const fitted = useRef(false);

  // Initial fit-all on mount
  useEffect(() => {
    if (!map || fitted.current) return;
    const L = require("leaflet");
    const nepalBounds = L.latLngBounds([
      [26.34, 80.05],
      [30.45, 88.20],
    ]);
    map.fitBounds(nepalBounds, { padding: [30, 30], animate: false });
    fitted.current = true;
    setTimeout(() => {
      map.invalidateSize();
      onReady();
    }, 200);
  }, [map, onReady]);

  // Fly-to on demand
  useEffect(() => {
    if (!map || !flyTo) return;
    map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? 12, { duration: 0.8 });
  }, [map, flyTo]);

  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   STAT COUNTER  (animates up from 0)
───────────────────────────────────────────────────────────────────────────── */

function StatCounter({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = 50;
    const step = () => {
      frame++;
      setDisplay(+(value * (frame / total)).toFixed(decimals));
      if (frame < total) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, decimals]);
  return (
    <span>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */

export default function NepalMap() {
  const [modules, setModules]         = useState<any>(null);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [nepalOutline, setNepalOutline] = useState<any>(null);
  const [selectedId, setSelectedId]   = useState<number | null>(null);
  const [activeRegion, setActiveRegion] = useState<Region | "All">("All");
  const [query, setQuery]             = useState("");
  const [flyTo, setFlyTo]             = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [mapReady, setMapReady]       = useState(false);
  const [showList, setShowList]       = useState(true);
  const [revealed, setRevealed]       = useState(false);
  const [mapMode, setMapMode]         = useState<MapMode>("dark");
  const [streetViewModal, setStreetViewModal] = useState<Marker | null>(null);
  const [modalTab, setModalTab]       = useState<"street" | "satellite" | "panorama">("street");

  const iframeSrc = useMemo(() => {
    if (!streetViewModal) return "";
    const latLng = `${streetViewModal.lat},${streetViewModal.lng}`;
    const placeQuery = encodeURIComponent(`${streetViewModal.area}, ${streetViewModal.city}, Nepal`);
    
    if (modalTab === "satellite") {
      return `https://maps.google.com/maps?q=${latLng}&t=k&z=18&ie=UTF8&iwloc=&output=embed`;
    }
    if (modalTab === "panorama") {
      return `https://maps.google.com/maps?q=${latLng}&layer=c&cbll=${latLng}&cbp=11,0,0,0,0&output=embed`;
    }
    // Default street map mode: Focuses on exact location in Nepal with pin marker!
    return `https://maps.google.com/maps?q=${placeQuery}&t=m&z=16&ie=UTF8&iwloc=&output=embed`;
  }, [streetViewModal, modalTab]);

  const sectionRef = useRef<HTMLElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);

  /* ── Load Leaflet dynamically ─────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) setLoadError("Map took too long — try disabling ad-blockers.");
    }, 8000);

    (async () => {
      try {
        const [L, RL] = await Promise.all([
          import("leaflet"),
          import("react-leaflet"),
        ]);
        if (cancelled) return;
        clearTimeout(t);
        setModules({ L, ...RL });
      } catch {
        if (!cancelled) setLoadError("Failed to load map engine.");
      }
    })();

    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  /* ── Scroll-entry reveal ──────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Fetch high-res Nepal District & Province GeoJSON ──────────── */
  const [districtData, setDistrictData] = useState<any>(null);
  const [provinceData, setProvinceData] = useState<any>(null);

  useEffect(() => {
    if (!modules) return;
    Promise.all([
      fetch("/geojson/nepal-districts.json").then((r) => (r.ok ? r.json() : null)),
      fetch("/geojson/nepal-provinces.json").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([districts, provinces]) => {
        if (districts) setDistrictData(districts);
        if (provinces) setProvinceData(provinces);
      })
      .catch(() => {});
  }, [modules]);

  /* ── Inverted World Mask (dims everything outside Nepal) ──────────── */
  const worldMask = useMemo(() => {
    const geoData = districtData || provinceData;
    if (!geoData) return null;
    const worldOuter = [
      [180, 90],
      [180, -90],
      [-180, -90],
      [-180, 90],
      [180, 90],
    ];

    try {
      const rings: any[] = [];
      const features = geoData.type === "FeatureCollection" ? geoData.features : [geoData];
      for (const f of features) {
        const geom = f.geometry || f;
        if (geom.type === "Polygon") {
          rings.push(...geom.coordinates);
        } else if (geom.type === "MultiPolygon") {
          for (const poly of geom.coordinates) {
            rings.push(...poly);
          }
        }
      }

      return {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [worldOuter, ...rings],
        },
      };
    } catch {
      return null;
    }
  }, [districtData, provinceData]);

  /* ── Interactive District Hover & Tooltips ────────────────────────── */
  const onEachDistrict = useCallback((feature: any, layer: any) => {
    const props = feature.properties || {};
    const districtName = props.DISTRICT || props.district || props.FIRST_DIST || "";
    const provinceNum = props.PROVINCE || props.province || props.FIRST_PROV || "";

    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({
          fillColor: "#4ade80",
          fillOpacity: 0.28,
          weight: 1.2,
          color: "#4ade80",
        });
      },
      mouseout: (e: any) => {
        e.target.setStyle({
          fillColor: "#244530",
          fillOpacity: 0.08,
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

  /* ── Derived state ────────────────────────────────────────────────── */
  const hottestId = useMemo(
    () => [...MARKERS].sort((a, b) => parseFloat(b.change) - parseFloat(a.change))[0]!.id,
    []
  );

  const visibleMarkers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MARKERS.filter((m) => {
      const regionOk = activeRegion === "All" || m.region === activeRegion;
      const queryOk =
        !q ||
        m.area.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        m.region.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q));
      return regionOk && queryOk;
    });
  }, [activeRegion, query]);

  const selected = useMemo(
    () => MARKERS.find((m) => m.id === selectedId) ?? null,
    [selectedId]
  );

  const avgChange = useMemo(() => {
    if (!visibleMarkers.length) return 0;
    return (
      visibleMarkers.reduce((s, m) => s + parseFloat(m.change), 0) /
      visibleMarkers.length
    );
  }, [visibleMarkers]);

  const totalValue = useMemo(
    () => visibleMarkers.reduce((s, m) => s + m.priceValue, 0),
    [visibleMarkers]
  );

  /* ── Build Leaflet divIcons ───────────────────────────────────────── */
  const icons = useMemo(() => {
    if (!modules) return null;
    const L = modules.L;
    const map = new Map<number, any>();
    for (const m of MARKERS) {
      map.set(
        m.id,
        L.divIcon({
          html: renderToStaticMarkup(
            <PinMarkup
              marker={m}
              selected={m.id === selectedId}
              hottest={m.id === hottestId}
            />
          ),
          className: "nm-pin",
          iconSize: [PIN_W, PIN_H],
          iconAnchor: [PIN_W / 2, PIN_H],
        })
      );
    }
    return map;
  }, [modules, selectedId, hottestId]);

  /* ── Actions ──────────────────────────────────────────────────────── */
  const focusMarker = useCallback((m: Marker) => {
    setSelectedId(m.id);
    setFlyTo({ lat: m.lat, lng: m.lng, zoom: 13 });
    if (listRef.current) {
      listRef.current
        .querySelector(`[data-id="${m.id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  const resetView = useCallback(() => {
    setQuery("");
    setActiveRegion("All");
    setSelectedId(null);
    setFlyTo(null);
  }, []);

  const flyToRegion = useCallback((r: Region | "All") => {
    setActiveRegion(r);
    setSelectedId(null);
    if (r === "All") {
      setFlyTo(null);
    } else {
      const [lat, lng] = REGION_CENTERS[r];
      setFlyTo({ lat, lng, zoom: 10 });
    }
  }, []);

  /* ── Render states ────────────────────────────────────────────────── */
  const isLoading = !modules || !icons;

  /* ─────────────────────────────────────────────────────────────────── */
  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, #0f1a12 0%, #0d1f16 100%)",
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      {/* ── Keyframes injected once ─────────────────────────────────── */}
      <style>{`
        @keyframes nm-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(220,38,38,0.55); }
          70%  { box-shadow: 0 0 0 10px rgba(220,38,38,0); }
          100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
        }
        @keyframes nm-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes nm-card-in {
          from { opacity: 0; transform: translateX(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes nm-list-in {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes nm-dot-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .nm-pin, .nm-pin * { overflow: visible !important; }
        .nm-pin { background: transparent !important; border: none !important; }

        /* Leaflet tile desaturation for dark theme blending */
        .leaflet-tile-pane {
          filter: saturate(0.6) brightness(0.82) contrast(1.05);
        }
        .leaflet-control-attribution {
          font-size: 9px !important;
          opacity: 0.5 !important;
          background: rgba(0,0,0,0.5) !important;
          color: #aaa !important;
        }
        .leaflet-control-attribution a { color: #888 !important; }
        .nm-tooltip {
          background: #1a2e1f !important;
          color: #d4edda !important;
          border: 1px solid rgba(36,69,48,0.6) !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          padding: 4px 10px !important;
          border-radius: 6px !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.4) !important;
          backdrop-filter: blur(8px) !important;
        }
        .nm-tooltip::before { border-top-color: #1a2e1f !important; }
        .leaflet-zoom-animated { will-change: transform; }
        .leaflet-container { background: #0d1a14 !important; }

        /* Highlight Nepal glowing border */
        .nepal-highlight-border path {
          stroke: #4ade80 !important;
          stroke-width: 2.5px !important;
          filter: drop-shadow(0 0 10px rgba(74, 222, 128, 0.8)) drop-shadow(0 0 3px #4ade80) !important;
        }

        /* Custom scrollbar in sidebar */
        .nm-list::-webkit-scrollbar { width: 4px; }
        .nm-list::-webkit-scrollbar-track { background: transparent; }
        .nm-list::-webkit-scrollbar-thumb { background: rgba(36,69,48,0.5); border-radius: 4px; }
        .nm-list { scrollbar-width: thin; scrollbar-color: rgba(36,69,48,0.5) transparent; }
      `}</style>

      {/* ── Ambient background glow ───────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 25% 50%, rgba(36,69,48,0.18) 0%, transparent 70%)," +
            "radial-gradient(ellipse 40% 40% at 75% 40%, rgba(30,58,40,0.12) 0%, transparent 70%)",
        }}
      />

      {/* ── Header ────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1400,
          margin: "0 auto",
          padding: "32px 24px 20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 8,
              padding: "3px 10px",
              borderRadius: 99,
              border: "1px solid rgba(170,208,179,0.25)",
              background: "rgba(36,69,48,0.35)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#4ade80",
                animation: "nm-dot-blink 2s ease-in-out infinite",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#86efac",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Live Market Data
            </span>
          </div>

          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              fontFamily: "'Fraunces', serif",
              color: "#f0fdf4",
              lineHeight: 1.15,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Nepal Property Market
            <br />
            <span style={{ color: "#4ade80" }}>Explorer</span>
          </h2>
          <p
            style={{
              marginTop: 8,
              fontSize: 14,
              color: "rgba(209,250,229,0.6)",
              maxWidth: 420,
              lineHeight: 1.55,
            }}
          >
            Real-time valuations across {MARKERS.length} verified sectors. Click
            any pin for full property intelligence.
          </p>
        </div>

        {/* Summary stats */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { label: "Markets Tracked", value: MARKERS.length, suffix: "" },
            { label: "Avg. Growth", value: avgChange, suffix: "%", prefix: "+", decimals: 1 },
            { label: "Total Value", value: Math.round(totalValue), suffix: "M", prefix: "रू " },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                backdropFilter: "blur(12px)",
                padding: "10px 18px",
                minWidth: 110,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#4ade80",
                  fontFamily: "'IBM Plex Mono', monospace",
                  lineHeight: 1,
                }}
              >
                {mapReady ? (
                  <StatCounter
                    value={s.value}
                    suffix={s.suffix}
                    prefix={s.prefix}
                    decimals={(s as any).decimals ?? 0}
                  />
                ) : (
                  "—"
                )}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(209,250,229,0.5)",
                  marginTop: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search + region chips ─────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 24px 16px",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg
            viewBox="0 0 20 20"
            fill="rgba(170,208,179,0.6)"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 16,
              height: 16,
              pointerEvents: "none",
            }}
          >
            <path
              fillRule="evenodd"
              d="M9 3a6 6 0 100 12A6 6 0 009 3zM1 9a8 8 0 1114.32 4.906l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387A8 8 0 011 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search area, city, or tag…"
            style={{
              width: 240,
              paddingLeft: 36,
              paddingRight: 12,
              paddingTop: 9,
              paddingBottom: 9,
              fontSize: 13,
              fontFamily: "'Public Sans', sans-serif",
              fontWeight: 500,
              color: "#e8f5ea",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 99,
              outline: "none",
              backdropFilter: "blur(12px)",
              transition: "border-color 0.2s, background 0.2s",
              caretColor: "#4ade80",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(74,222,128,0.5)";
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            }}
          />
        </div>

        {/* Region chips */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {(["All", ...REGIONS] as const).map((r) => {
            const active = activeRegion === r;
            return (
              <button
                key={r}
                onClick={() => flyToRegion(r as any)}
                style={{
                  padding: "7px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'Public Sans', sans-serif",
                  borderRadius: 99,
                  border: active
                    ? "1.5px solid #4ade80"
                    : "1.5px solid rgba(255,255,255,0.15)",
                  background: active
                    ? "rgba(74,222,128,0.18)"
                    : "rgba(255,255,255,0.06)",
                  color: active ? "#4ade80" : "rgba(209,250,229,0.65)",
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.18s ease",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.borderColor = "rgba(74,222,128,0.4)";
                    e.currentTarget.style.color = "rgba(209,250,229,0.9)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.color = "rgba(209,250,229,0.65)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }
                }}
              >
                {r}
              </button>
            );
          })}

          {/* Reset */}
          {(query || activeRegion !== "All" || selectedId) && (
            <button
              onClick={resetView}
              style={{
                padding: "7px 14px",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Public Sans', sans-serif",
                borderRadius: 99,
                border: "1.5px solid rgba(220,38,38,0.4)",
                background: "rgba(220,38,38,0.12)",
                color: "#fca5a5",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                transition: "all 0.18s ease",
              }}
            >
              ✕ Reset
            </button>
          )}

          {/* Map Mode Switcher */}
          <div style={{ display: "flex", gap: 5, marginLeft: "auto" }}>
            {[
              { id: "dark", label: "🌙 Dark" },
              { id: "satellite", label: "🛰️ Satellite" },
              { id: "streets", label: "🛣️ Streets" },
            ].map((mode) => {
              const active = mapMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setMapMode(mode.id as MapMode)}
                  style={{
                    padding: "7px 13px",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Public Sans', sans-serif",
                    borderRadius: 99,
                    border: active
                      ? "1.5px solid #4ade80"
                      : "1.5px solid rgba(255,255,255,0.15)",
                    background: active
                      ? "rgba(74,222,128,0.2)"
                      : "rgba(255,255,255,0.06)",
                    color: active ? "#4ade80" : "rgba(209,250,229,0.7)",
                    cursor: "pointer",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.18s ease",
                  }}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Map + Sidebar ────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          height: "clamp(500px, 72vh, 820px)",
        }}
      >
        {/* Map area */}
        <div style={{ position: "relative", flex: 1, minWidth: 0, height: "100%" }}>

          {/* Loading overlay */}
          {isLoading && !loadError && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(13,26,20,0.9)",
                backdropFilter: "blur(6px)",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "3px solid rgba(74,222,128,0.2)",
                  borderTop: "3px solid #4ade80",
                  animation: "nm-spin 0.9s linear infinite",
                }}
              />
              <p style={{ color: "rgba(209,250,229,0.7)", fontSize: 13, fontWeight: 600 }}>
                Loading Nepal market map…
              </p>
            </div>
          )}

          {/* Error overlay */}
          {loadError && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(13,26,20,0.9)",
                gap: 12,
                padding: 32,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 36 }}>🗺️</div>
              <p style={{ color: "#fca5a5", fontSize: 14, maxWidth: 300 }}>{loadError}</p>
            </div>
          )}

          {/* Leaflet map */}
          {modules && icons && (() => {
            const {
              MapContainer, TileLayer, Marker, Tooltip, GeoJSON, ZoomControl, Circle,
            } = modules;
            return (
              <MapContainer
                center={[28.3949, 84.124]}
                zoom={7}
                zoomControl={false}
                scrollWheelZoom
                style={{ width: "100%", height: "100%" }}
              >
                <MapController
                  markers={visibleMarkers}
                  flyTo={flyTo}
                  onReady={() => setMapReady(true)}
                />

                {/* Dynamic Tile Layer based on mapMode */}
                {mapMode === "dark" && (
                  <TileLayer
                    key="tile-dark"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={20}
                  />
                )}

                {mapMode === "satellite" && (
                  <>
                    <TileLayer
                      key="tile-sat-imagery"
                      attribution='&copy; <a href="https://www.esri.com/">Esri World Imagery</a>'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      maxZoom={19}
                    />
                    <TileLayer
                      key="tile-sat-labels"
                      attribution='&copy; Esri'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                      maxZoom={19}
                    />
                  </>
                )}

                {mapMode === "streets" && (
                  <TileLayer
                    key="tile-streets"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={20}
                  />
                )}

                <ZoomControl position="bottomright" />

                {/* World dimming mask - darkens outside countries */}
                {worldMask && (
                  <GeoJSON
                    key="world-dimming-mask"
                    data={worldMask}
                    style={{
                      color: "transparent",
                      weight: 0,
                      fillColor: "#050b07",
                      fillOpacity: 0.82,
                    }}
                  />
                )}

                {/* Detailed 77 Districts Layer with interactive hover */}
                {districtData && (
                  <GeoJSON
                    key="nepal-districts-layer"
                    data={districtData}
                    onEachFeature={onEachDistrict}
                    style={{
                      color: "rgba(74, 222, 128, 0.4)",
                      weight: 0.8,
                      fillColor: "#244530",
                      fillOpacity: 0.12,
                    }}
                  />
                )}

                {/* 7 Province Outer Outline Layer */}
                {provinceData && (
                  <GeoJSON
                    key="nepal-provinces-layer"
                    data={provinceData}
                    style={{
                      color: "#4ade80",
                      weight: 2.2,
                      opacity: 0.95,
                      fillColor: "transparent",
                      className: "nepal-highlight-border",
                    }}
                  />
                )}

                {/* Heat halos */}
                {visibleMarkers.map((m) => (
                  <Circle
                    key={`h-${m.id}`}
                    center={[m.lat, m.lng]}
                    radius={m.id === hottestId ? 9500 : m.tier === "premium" ? 6000 : 4000}
                    pathOptions={{
                      fillColor: trendColor(m.trend, m.tier),
                      fillOpacity: m.id === selectedId ? 0.18 : 0.07,
                      stroke: m.id === selectedId,
                      color: trendColor(m.trend, m.tier),
                      weight: 1,
                      opacity: 0.3,
                    }}
                  />
                ))}

                {/* Markers */}
                {visibleMarkers.map((m) => (
                  <Marker
                    key={m.id}
                    position={[m.lat, m.lng]}
                    icon={icons.get(m.id)}
                    eventHandlers={{ click: () => focusMarker(m) }}
                  >
                    <Tooltip
                      className="nm-tooltip"
                      direction="top"
                      offset={[0, -PIN_H + 4]}
                      permanent={false}
                    >
                      <strong>{m.area}</strong> · {m.price} ·{" "}
                      <span style={{ color: trendColor(m.trend) }}>
                        {trendLabel(m.trend)} {m.change}
                      </span>
                    </Tooltip>
                  </Marker>
                ))}
              </MapContainer>
            );
          })()}

          {/* Compass rose */}
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: 16,
              zIndex: 1000,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(13,26,20,0.85)",
              border: "1px solid rgba(74,222,128,0.3)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#4ade80",
                fontFamily: "monospace",
              }}
            >
              N
            </span>
          </div>

          {/* Hint bar */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              background: "rgba(13,26,20,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 99,
              padding: "5px 14px",
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(209,250,229,0.55)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              letterSpacing: "0.03em",
            }}
          >
            Scroll to zoom · Click pin for details · Drag to pan
          </div>

          {/* Mobile list toggle */}
          <button
            onClick={() => setShowList((v) => !v)}
            aria-label={showList ? "Hide list" : "Show list"}
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              zIndex: 1001,
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: "#244530",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
            className="lg-hidden"
          >
            <svg viewBox="0 0 24 24" fill="white" style={{ width: 18, height: 18 }}>
              {showList ? (
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              ) : (
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              )}
            </svg>
          </button>

          {/* Selected detail card (glassmorphism) */}
          {selected && (
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                zIndex: 1000,
                width: 300,
                background: "rgba(13,26,20,0.82)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(74,222,128,0.25)",
                borderRadius: 16,
                padding: "16px 18px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
                animation: "nm-card-in 0.3s ease forwards",
              }}
            >
              {/* Close */}
              <button
                onClick={() => setSelectedId(null)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: "50%",
                  width: 26,
                  height: 26,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(209,250,229,0.7)",
                  fontSize: 14,
                }}
              >
                ✕
              </button>

              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "rgba(74,222,128,0.7)",
                  marginBottom: 4,
                }}
              >
                {selected.city} · {selected.region}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 800,
                    fontFamily: "'Fraunces', serif",
                    color: "#f0fdf4",
                  }}
                >
                  {selected.area}
                </h3>
                {selected.verified && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#4ade80",
                      border: "1px solid rgba(74,222,128,0.4)",
                      borderRadius: 4,
                      padding: "1px 6px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    ✓ VERIFIED
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#4ade80",
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {selected.price}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color:
                      selected.trend === "up"
                        ? "#f87171"
                        : "rgba(209,250,229,0.6)",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    background:
                      selected.trend === "up"
                        ? "rgba(220,38,38,0.15)"
                        : "rgba(255,255,255,0.07)",
                    padding: "2px 8px",
                    borderRadius: 99,
                  }}
                >
                  {trendLabel(selected.trend)} {selected.change}
                </span>
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: "rgba(209,250,229,0.6)",
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                {selected.description}
              </p>

              {/* Metrics grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                {[
                  { label: "Area", value: `${selected.sqFt} sqft` },
                  { label: "Price / sqft", value: `रू ${selected.psf}` },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 8,
                      padding: "8px 10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        color: "rgba(209,250,229,0.4)",
                        marginBottom: 3,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#d1fae5",
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {selected.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#86efac",
                      background: "rgba(74,222,128,0.12)",
                      border: "1px solid rgba(74,222,128,0.2)",
                      padding: "3px 8px",
                      borderRadius: 6,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {t}
                  </span>
                ))}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#fcd34d",
                    background: "rgba(252,211,77,0.1)",
                    border: "1px solid rgba(252,211,77,0.2)",
                    padding: "3px 8px",
                    borderRadius: 6,
                    textTransform: "capitalize",
                    letterSpacing: "0.03em",
                  }}
                >
                  {selected.tier}
                </span>
              </div>

              {/* Street & Aerial View Action Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setMapMode("satellite");
                    setFlyTo({ lat: selected.lat, lng: selected.lng, zoom: 18 });
                  }}
                  style={{
                    padding: "8px 0",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'Public Sans', sans-serif",
                    color: "#86efac",
                    background: "rgba(36,69,48,0.6)",
                    border: "1px solid rgba(74,222,128,0.3)",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  🛰️ Street Zoom (z18)
                </button>

                <button
                  type="button"
                  onClick={() => setStreetViewModal(selected)}
                  style={{
                    padding: "8px 0",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'Public Sans', sans-serif",
                    color: "#38bdf8",
                    background: "rgba(14,165,233,0.18)",
                    border: "1px solid rgba(56,189,248,0.35)",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  📷 360° Street View
                </button>
              </div>

              <button
                style={{
                  width: "100%",
                  padding: "10px 0",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'Public Sans', sans-serif",
                  color: "#0d1a14",
                  background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  transition: "opacity 0.15s ease, transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                View Listings in {selected.area} →
              </button>
            </div>
          )}
        </div>

        {/* ── Sidebar list ──────────────────────────────────────────── */}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "rgba(10,20,13,0.85)",
            backdropFilter: "blur(16px)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            transform: showList ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
            position: "relative",
            zIndex: 100,
            animation: mapReady ? "nm-list-in 0.5s ease forwards" : "none",
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(36,69,48,0.15)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#4ade80",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {visibleMarkers.length} Location
                {visibleMarkers.length !== 1 ? "s" : ""}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(209,250,229,0.4)",
                  marginTop: 1,
                }}
              >
                Sorted by market value
              </div>
            </div>
            {visibleMarkers.length > 0 && (
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#f87171",
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  +{avgChange.toFixed(1)}%
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(209,250,229,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Avg growth
                </div>
              </div>
            )}
          </div>

          {/* List items */}
          <div
            ref={listRef}
            className="nm-list"
            style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}
          >
            {visibleMarkers.length === 0 && (
              <div
                style={{
                  padding: "48px 16px",
                  textAlign: "center",
                  color: "rgba(209,250,229,0.4)",
                  fontSize: 13,
                }}
              >
                No locations match "{query}"
              </div>
            )}

            {[...visibleMarkers]
              .sort((a, b) => b.priceValue - a.priceValue)
              .map((m, i) => {
                const isActive = m.id === selectedId;
                const c = trendColor(m.trend, m.tier);
                return (
                  <button
                    key={m.id}
                    data-id={m.id}
                    onClick={() => focusMarker(m)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      cursor: "pointer",
                      border: "none",
                      background: isActive
                        ? "rgba(74,222,128,0.1)"
                        : "transparent",
                      borderLeft: isActive
                        ? "3px solid #4ade80"
                        : "3px solid transparent",
                      transition: "all 0.15s ease",
                      animationDelay: `${i * 30}ms`,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.04)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: "#4ade80",
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}
                      >
                        {m.price}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: c,
                          background: `${c}18`,
                          padding: "2px 7px",
                          borderRadius: 99,
                        }}
                      >
                        {trendLabel(m.trend)} {m.change}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 1,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#e8f5ea",
                        }}
                      >
                        {m.area}
                      </span>
                      {m.verified && (
                        <span style={{ fontSize: 11, color: "#4ade80" }}>✓</span>
                      )}
                      {m.id === hottestId && (
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 800,
                            background: "#dc2626",
                            color: "#fff",
                            padding: "1px 5px",
                            borderRadius: 99,
                            letterSpacing: "0.06em",
                          }}
                        >
                          HOT
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(209,250,229,0.4)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {m.city} · {m.region}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        marginTop: 5,
                        flexWrap: "wrap",
                      }}
                    >
                      {m.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: "rgba(134,239,172,0.7)",
                            background: "rgba(74,222,128,0.08)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            letterSpacing: "0.03em",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Sidebar footer */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: "rgba(209,250,229,0.35)",
                letterSpacing: "0.03em",
              }}
            >
              Nepal · {MARKERS.length} locations
            </span>
            <a
              href="/map"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#4ade80",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
                letterSpacing: "0.02em",
              }}
            >
              Full map ↗
            </a>
          </div>
        </div>
      </div>

      {/* ── Legend bar ────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1400,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px 24px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {[
          { color: "#dc2626", label: "Rising value" },
          { color: "#64748b", label: "Stable market" },
          { color: "#4ade80", label: "Verified listing" },
          { color: "#dc2626", label: "Hot market", pulse: true },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "rgba(209,250,229,0.5)",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: item.color,
                flexShrink: 0,
                animation: item.pulse ? "nm-pulse 2s ease-out infinite" : undefined,
              }}
            />
            {item.label}
          </div>
        ))}

        <div
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(74,222,128,0.6)",
            letterSpacing: "0.03em",
          }}
        >
          Data updated: July 2026
        </div>
      </div>

      {/* ── 360° Street View Modal ─────────────────────────────────────── */}
      {streetViewModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            animation: "nm-card-in 0.25s ease forwards",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 960,
              height: "80vh",
              background: "#0d1a14",
              border: "1px solid rgba(74,222,128,0.3)",
              borderRadius: 20,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 80px rgba(0,0,0,0.8)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(36,69,48,0.35)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#4ade80",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  📷 360° Interactive Street View
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: "'Fraunces', serif",
                    color: "#f0fdf4",
                  }}
                >
                  {streetViewModal.area}, {streetViewModal.city}, Nepal
                </h3>
              </div>

              {/* Tab Selector inside Modal */}
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { id: "street", label: "🗺️ Street Map" },
                  { id: "satellite", label: "🛰️ Aerial View" },
                  { id: "panorama", label: "📷 360° Panorama" },
                ].map((t) => {
                  const active = modalTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setModalTab(t.id as any)}
                      style={{
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "'Public Sans', sans-serif",
                        borderRadius: 99,
                        border: active
                          ? "1.5px solid #4ade80"
                          : "1.5px solid rgba(255,255,255,0.15)",
                        background: active
                          ? "rgba(74,222,128,0.22)"
                          : "rgba(255,255,255,0.06)",
                        color: active ? "#4ade80" : "rgba(209,250,229,0.7)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <a
                  href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${streetViewModal.lat},${streetViewModal.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Public Sans', sans-serif",
                    color: "#38bdf8",
                    textDecoration: "none",
                    background: "rgba(56,189,248,0.15)",
                    border: "1px solid rgba(56,189,248,0.3)",
                    padding: "6px 14px",
                    borderRadius: 99,
                    transition: "all 0.15s ease",
                  }}
                >
                  Open in Google Maps ↗
                </a>

                <button
                  type="button"
                  onClick={() => setStreetViewModal(null)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    color: "#fff",
                    fontSize: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Street View Embed Iframe */}
            <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
              <iframe
                key={`${streetViewModal.id}-${modalTab}`}
                title={`Street View - ${streetViewModal.area}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={iframeSrc}
              />
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "12px 24px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 11,
                color: "rgba(209,250,229,0.5)",
              }}
            >
              <span>Coords: {streetViewModal.lat}, {streetViewModal.lng}</span>
              <span>Drag to rotate 360° · Click arrows to move along streets</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}