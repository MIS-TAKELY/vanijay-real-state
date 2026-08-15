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

/**
 * Strips HTML tags and decodes common HTML entities to return clean plain text.
 */
export function stripHtml(input?: string | null): string {
  if (!input) return "";

  return input
    // Replace block-level tags and line breaks with spaces so words don't merge together
    .replace(/<(\/p|p|\/div|div|\/li|li|\/h[1-6]|h[1-6]|br\s*\/?)>/gi, " ")
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, "")
    // Decode common named HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Decode numeric decimal entities (e.g. &#8217;)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    // Decode numeric hex entities (e.g. &#x27;)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    // Collapse multiple whitespaces and newlines
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Truncates text to a maximum length and appends an ellipsis if truncated.
 */
export function truncateText(text: string, maxLength = 120): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

