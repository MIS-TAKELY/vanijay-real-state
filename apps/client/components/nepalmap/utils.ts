import type { Marker, Trend } from "./types";
import { TREND_COLORS } from "./config";

/* ─── Trend Helpers ──────────────────────────────────────────────── */
export function getTrendColor(
  trend: Trend,
  tier: Marker["tier"] = "standard"
): string {
  if (trend === "up") {
    const key = `up_${tier}`;
    return TREND_COLORS[key] ?? TREND_COLORS.up_standard!;
  }
  return TREND_COLORS[trend] ?? TREND_COLORS.flat!;
}

export function getTrendLabel(trend: Trend): string {
  if (trend === "up") return "\u2191";
  if (trend === "down") return "\u2193";
  return "\u2192";
}

export function getTrendArrow(change: string): string {
  const num = parseFloat(change);
  if (isNaN(num)) return "\u2192";
  if (num > 0) return "\u2191";
  if (num < 0) return "\u2193";
  return "\u2192";
}

/* ─── Marker Filtering & Sorting ─────────────────────────────────── */
export interface FilterCriteria {
  region: string;
  tier: string;
  minPrice: number;
  maxPrice: number;
  verifiedOnly: boolean;
  query: string;
  sortBy: "price" | "change" | "area";
}

export function filterMarkers(
  markers: Marker[],
  filters: FilterCriteria
): Marker[] {
  return markers
    .filter((m) => {
      if (filters.region !== "all" && m.region !== filters.region) return false;
      if (filters.tier !== "all" && m.tier !== filters.tier) return false;
      if (filters.minPrice > 0 && m.priceValue < filters.minPrice) return false;
      if (filters.maxPrice > 0 && m.priceValue > filters.maxPrice) return false;
      if (filters.verifiedOnly && !m.verified) return false;
      if (filters.query) {
        const q = filters.query.toLowerCase();
        if (
          !m.area.toLowerCase().includes(q) &&
          !m.city.toLowerCase().includes(q) &&
          !m.tags.some((t) => t.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "change":
          return parseFloat(b.change) - parseFloat(a.change);
        case "area":
          return a.area.localeCompare(b.area);
        case "price":
        default:
          return b.priceValue - a.priceValue;
      }
    });
}

/* ─── Average Change ─────────────────────────────────────────────── */
export function computeAvgChange(markers: Marker[]): number {
  if (markers.length === 0) return 0;
  const sum = markers.reduce((acc, m) => acc + parseFloat(m.change), 0);
  return sum / markers.length;
}

/* ─── Style Helpers ──────────────────────────────────────────────── */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/* ─── Street View URL builder ────────────────────────────────────── */
export function buildStreetViewUrl(
  lat: number,
  lng: number
): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}

/* ─── Default Marker Normalizer ──────────────────────────────────── */
export function normalizeMarker(m: Marker): Marker {
  return {
    ...m,
    tier: m.tier ?? "standard",
    verified: m.verified ?? false,
    tags: m.tags ?? [],
    change: m.change ?? "0%",
    sqFt: m.sqFt ?? "0",
    psf: m.psf ?? "0",
  };
}
