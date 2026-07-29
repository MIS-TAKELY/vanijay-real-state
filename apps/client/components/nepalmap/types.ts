import type { LatLngExpression } from "leaflet";

/* ─── Core Data Types ─────────────────────────────────────────────── */
export type Trend = "up" | "flat" | "down";
export type MapMode = "dark" | "satellite" | "streets";
export type Region =
  | "Kathmandu Valley"
  | "Pokhara"
  | "Eastern"
  | "Central & Terai"
  | "Western";

export interface Marker {
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
  tags: string[];
  sqFt: string;
  psf: string;
  tier: "premium" | "standard" | "emerging";
}

/* ─── Map Config & UI State ──────────────────────────────────────── */

export interface MapConfig {
  center: [number, number];
  zoom: number;
  minZoom: number;
  maxZoom: number;
}

export interface FilterState {
  region: Region | "all";
  tier: string;
  minPrice: number;
  maxPrice: number;
  verifiedOnly: boolean;
  sortBy: "price" | "change" | "area";
}

export type ModalTab = "streetview" | "satellite" | "data";

export interface FlyToTarget {
  lat: number;
  lng: number;
  zoom: number;
}

/**
 * Full set of props accepted by NepalMap.
 * All props are optional – defaults provide a self-contained map out of the box.
 */
export interface NepalMapProps {
  markers?: Marker[];
  config?: Partial<MapConfig>;
  regions?: Region[];
  regionCenters?: Partial<Record<Region, [number, number]>>;
  mapModes?: MapMode[];
  className?: string;
  height?: string | number;
  defaultShowList?: boolean;
  emptyMessage?: string;
  onMarkerSelect?: (marker: Marker | null) => void;
  onMapModeChange?: (mode: MapMode) => void;
  tileUrl?: string;
  tileAttribution?: string;
  googleMapsApiKey?: string;
}

/**
 * Minimal marker shape if consumers don't want the full Marker type.
 * The map will auto-compute missing fields.
 */
export interface MinimalMarker {
  id: number;
  price: string;
  priceValue?: number;
  change?: string;
  trend?: Trend;
  lat: number;
  lng: number;
  area: string;
  city?: string;
  region?: Region;
  verified?: boolean;
  description?: string;
  tags?: string[];
  sqFt?: string;
  psf?: string;
  tier?: "premium" | "standard" | "emerging";
}
