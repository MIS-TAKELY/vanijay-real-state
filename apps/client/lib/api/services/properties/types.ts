export interface ApiProperty {
  id: string;
  listingCode: string;
  slug: string;
  title: string;
  description?: string | null;
  propertyType: string;
  status: string;
  verificationLevel: string;
  askingPrice: number;
  pricePerAana?: number | null;
  roadAccessWidthFt?: number | null;
  roadType?: string | null;
  facing?: string | null;
  isCornerPlot: boolean;
  ownerId: string;
  agentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedPage {
  items: ApiProperty[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CardProperty {
  id: string;
  listingCode?: string;
  title: string;
  price: string;
  location: string;
  gradient: string;
  meta: string[];
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

export const VERIFICATION_LABELS: Record<string, string> = {
  UNVERIFIED: "Unverified",
  LEVEL_1_BASIC: "Level 1 Basic",
  LEVEL_2_DOC_VERIFIED: "Document Verified",
  LEVEL_3_FIELD_VERIFIED: "Field Verified",
  REJECTED: "Rejected",
};

export const FALLBACK_GRADIENT = "from-[#A8C0A0] via-[#7A9A70] to-[#5A7A55]";

export function formatNPR(n: number): string {
  return `NPR ${new Intl.NumberFormat("en-US").format(n)}`;
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

export function toCardProps(p: ApiProperty): CardProperty {
  const meta: string[] = [];
  if (p.roadAccessWidthFt || p.roadType) {
    const parts: string[] = [];
    if (p.roadAccessWidthFt) parts.push(`${p.roadAccessWidthFt}ft`);
    if (p.roadType) parts.push(labelEnum(p.roadType, {}));
    meta.push(`Road: ${parts.join(" ")}`);
  }
  if (p.facing) meta.push(`Facing: ${labelEnum(p.facing, {})}`);
  if (p.isCornerPlot) meta.push("Corner Plot");
  if (p.pricePerAana) meta.push(`Price/Aana: ${formatNPR(p.pricePerAana)}`);
  if (p.verificationLevel && p.verificationLevel !== "UNVERIFIED") {
    meta.push(
      `Verification: ${labelEnum(p.verificationLevel, VERIFICATION_LABELS)}`,
    );
  }

  return {
    id: p.slug,
    listingCode: p.listingCode,
    title: p.title,
    price: formatNPR(p.askingPrice),
    location: labelEnum(p.propertyType, TYPE_LABELS),
    gradient: TYPE_GRADIENTS[p.propertyType] ?? FALLBACK_GRADIENT,
    meta,
  };
}
