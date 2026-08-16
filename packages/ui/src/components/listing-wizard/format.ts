/**
 * Small presentational helpers shared by the listing wizard (and re-exported
 * to apps that previously defined them locally).
 */

/** Strips HTML tags and decodes common HTML entities to return clean plain text. */
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

export const TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL_LAND: "Residential Land",
  COMMERCIAL_LAND: "Commercial Land",
  AGRICULTURAL_LAND: "Agricultural Land",
  COMMERCIAL_SPACE: "Commercial Space",
  HERITAGE_HOME: "Heritage Home",
  RESIDENTIAL_HOUSE: "Residential House",
};

export const TYPE_GRADIENTS: Record<string, string> = {
  RESIDENTIAL_LAND: "from-[#A8C0A0] via-[#7A9A70] to-[#5A7A55]",
  COMMERCIAL_LAND: "from-[#C8C0B0] via-[#A89880] to-[#887860]",
  AGRICULTURAL_LAND: "from-[#B0C8A0] via-[#88A870] to-[#688850]",
  COMMERCIAL_SPACE: "from-[#90A8C0] via-[#6A88A8] to-[#4A6888]",
  HERITAGE_HOME: "from-[#C0A890] via-[#A08868] to-[#806848]",
  RESIDENTIAL_HOUSE: "from-[#A0B8C8] via-[#7890A8] to-[#587088]",
};

export const FALLBACK_GRADIENT = "from-[#A8C0A0] via-[#7A9A70] to-[#5A7A55]";

export function formatNPR(n: number): string {
  const hasFraction = !Number.isInteger(n);
  return `NPR ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(n)}`;
}

export function labelEnum(
  value: string,
  labels: Record<string, string>,
): string {
  if (labels[value]) return labels[value];
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
