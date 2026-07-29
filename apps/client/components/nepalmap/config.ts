import type { MapConfig, MapMode, Marker, Trend } from "./types";

/* ─── Default Map Configuration ──────────────────────────────────── */
export const DEFAULT_MAP_CONFIG: MapConfig = {
  center: [28.3949, 84.124],
  zoom: 7,
  minZoom: 6,
  maxZoom: 18,
};

export const DEFAULT_MAP_MODES: MapMode[] = ["dark", "satellite", "streets"];

export const PIN_WIDTH = 88;
export const PIN_HEIGHT = 54;

const TILES_BASE = "https://tiles.vanijay.com/nepal-realstate";

export const TILE_URLS: Record<MapMode, string> = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
};

export const TILE_ATTR =
  '&copy; <a href="https://carto.com">CARTO</a>, <a href="https://openstreetmap.org">OSM</a>, <a href="https://esri.com">Esri</a>';

/* ─── Colour Palette ─────────────────────────────────────────────── */
export const TREND_COLORS: Record<string, string> = {
  up_premium: "#dc2626",
  up_emerging: "#ea580c",
  up_standard: "#dc2626",
  down: "#2563eb",
  flat: "#64748b",
};

export const VERIFIED_COLOR = "#4ade80";
export const SURFACE_BG = "rgba(13,26,20,0.82)";
export const SURFACE_BORDER = "rgba(74,222,128,0.25)";
export const SIDEBAR_BG = "rgba(10,20,13,0.85)";

/* ─── Animation & Marker CSS Keyframes ───────────────────────────── */
export const KEYFRAMES = `
.nm-marker {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
.nm-marker, .nm-marker * {
  overflow: visible;
}
.nm-tooltip {
  background: #244530 !important;
  color: #f0fdf4 !important;
  border: 1px solid rgba(74, 222, 128, 0.4) !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  padding: 4px 8px !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}
.nm-tooltip::before {
  border-top-color: #244530 !important;
}
@keyframes nm-fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes nm-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.55; transform: scale(1.35); }
}
@keyframes nm-card-in {
  from { opacity: 0; transform: translateX(-16px) scale(0.96); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes nm-list-in {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes nm-modal-in {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
`;

/* ─── Legend Items ───────────────────────────────────────────────── */
export interface LegendItem {
  color: string;
  label: string;
  pulse?: boolean;
}

export const LEGEND_ITEMS: LegendItem[] = [
  { color: "#dc2626", label: "Rising value" },
  { color: "#64748b", label: "Stable market" },
  { color: "#4ade80", label: "Verified listing" },
  { color: "#dc2626", label: "Hot market", pulse: true },
];

/* ─── Map Mode Labels ────────────────────────────────────────────── */
export const MAP_MODE_LABELS: Record<MapMode, string> = {
  dark: "🌙 Dark",
  satellite: "🛰️ Satellite",
  streets: "🗺️ Streets",
};
