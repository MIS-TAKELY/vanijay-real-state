import type { Marker, Trend } from "./types";

const TREND_COLORS: Record<string, string> = {
  up_premium: "#dc2626",
  up_emerging: "#ea580c",
  up_standard: "#dc2626",
  down: "#2563eb",
  flat: "#64748b",
};

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
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  return "→";
}

export function computeAvgChange(markers: Marker[]): number {
  if (markers.length === 0) return 0;
  const sum = markers.reduce((acc, m) => acc + parseFloat(m.change), 0);
  return sum / markers.length;
}

export function buildStreetViewUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}
