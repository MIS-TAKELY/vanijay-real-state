import { listingCoverImageUrl } from "lib/media/videoThumbnail";

export interface ApiPropertyLocation {
  province: string;
  district: string;
  municipality: string;
  wardNumber: number;
  areaName: string;
  addressText?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ApiLandArea {
  ropani: number;
  aana: number;
  paisa: number;
  daam: number;
  bigha?: number | null;
  katha?: number | null;
  dhur?: number | null;
  totalSqFt: number;
  totalSqMeters: number;
}

export interface ApiPropertyMedia {
  /** MediaType enum (IMAGE | VIDEO_WALKTHROUGH | CADASTRAL_MAP) when exposed by the API. */
  type?: string | null;
  url: string;
  altText?: string | null;
  sortOrder: number;
  isCover: boolean;
}

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
  isFeatured: boolean;
  ownerId: string;
  agentId?: string | null;
  location?: ApiPropertyLocation | null;
  landArea?: ApiLandArea | null;
  media?: ApiPropertyMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedPage {
  items: ApiProperty[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface PropertyMediaPayload {
  type?: string; // MediaType enum (IMAGE | VIDEO_WALKTHROUGH | CADASTRAL_MAP)
  url: string;
  altText?: string;
  sortOrder?: number;
  isCover?: boolean;
}

export interface PropertyDocumentPayload {
  type: string; // DocumentType enum
  fileUrl: string;
  fileName: string;
  fileSizeMb: number;
  isPrivate?: boolean;
}

/**
 * POST /api/v1/properties body. Mirrors the API's `CreatePropertyInput` DTO.
 * Enum fields stay `string` so the client doesn't depend on Prisma — the API
 * validates (`@IsEnum`) and returns 400 on bad values.
 */
export interface CreatePropertyPayload {
  title: string;
  description?: string;
  propertyType: string; // PropertyType enum
  askingPrice: number;
  pricePerAana?: number;
  roadAccessWidthFt?: number;
  roadType?: string; // RoadType enum
  facing?: string; // FacingDirection enum
  isCornerPlot?: boolean;
  landArea: {
    ropani: number;
    aana: number;
    paisa?: number;
    daam?: number;
    bigha?: number;
    katha?: number;
    dhur?: number;
    totalSqFt: number;
    totalSqMeters: number;
  };
  location: {
    province: string;
    district: string;
    municipality: string;
    wardNumber: number;
    areaName: string;
    addressText?: string;
    latitude?: number;
    longitude?: number;
  };
  /** Uploaded gallery + video assets (Cloudinary URLs). */
  media?: PropertyMediaPayload[];
  /** Verification documents (Lalpurja, citizenship, tax clearance, etc.). */
  documents?: PropertyDocumentPayload[];
}

export interface CardProperty {
  /** Slug — used for the detail-page URL. */
  id: string;
  /** Real DB id — required for favorites/cart API calls. */
  propertyId?: string;
  listingCode?: string;
  title: string;
  price: string;
  location: string;
  gradient: string;
  imageUrl?: string;
  meta: string[];
  /** Optional accent badge (e.g. "HOT", "FEATURED") rendered top-right. */
  badge?: string;
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

export function formatLocation(loc?: ApiPropertyLocation | null): string {
  if (!loc) return "Location TBD";
  const place = loc.areaName || loc.municipality || loc.district;
  return loc.district && loc.district !== place
    ? `${place}, ${loc.district}`
    : place;
}

export function formatLandArea(a?: ApiLandArea | null): string | null {
  if (!a) return null;
  if (a.bigha || a.katha || a.dhur) {
    const parts: string[] = [];
    if (a.bigha) parts.push(`${a.bigha} Bigha`);
    if (a.katha) parts.push(`${a.katha} Katha`);
    if (a.dhur) parts.push(`${a.dhur} Dhur`);
    return parts.join(" ");
  }
  const parts: string[] = [];
  if (a.ropani) parts.push(`${a.ropani} Ropani`);
  if (a.aana) parts.push(`${a.aana} Aana`);
  if (a.paisa) parts.push(`${a.paisa} Paisa`);
  if (a.daam) parts.push(`${a.daam} Daam`);
  return parts.length > 0 ? parts.join(" ") : null;
}

export function toCardProps(p: ApiProperty): CardProperty {
  const meta: string[] = [];
  const area = formatLandArea(p.landArea);
  if (area) meta.push(area);
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
    propertyId: p.id,
    listingCode: p.listingCode,
    title: p.title,
    price: formatNPR(p.askingPrice),
    location: formatLocation(p.location),
    gradient: TYPE_GRADIENTS[p.propertyType] ?? FALLBACK_GRADIENT,
    imageUrl: listingCoverImageUrl(p.media),
    meta,
  };
}
