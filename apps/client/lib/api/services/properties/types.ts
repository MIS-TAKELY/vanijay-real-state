import { listingCoverImageUrl } from "lib/media/videoThumbnail";
import {
  TYPE_LABELS,
  TYPE_GRADIENTS,
  FALLBACK_GRADIENT,
  formatNPR,
  labelEnum,
} from "@repo/ui";

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
  isNegotiable: boolean;
  minBuyableLandSqFt?: number | null;
  minBuyableUnitSystem?: string | null;
  minBuyableRopani?: number | null;
  minBuyableAana?: number | null;
  minBuyablePaisa?: number | null;
  minBuyableDaam?: number | null;
  minBuyableBigha?: number | null;
  minBuyableKatha?: number | null;
  minBuyableDhur?: number | null;
  // Type-specific Step 3 specs
  builtUpAreaSqFt?: number | null;
  propertySubtype?: string | null;
  yearBuilt?: number | null;
  constructionStatus?: string | null;
  floorNumber?: number | null;
  totalFloors?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  livingRooms?: number | null;
  kitchens?: number | null;
  balconies?: number | null;
  parking?: string | null;
  furnishing?: string | null;
  houseFacing?: string | null;
  amenities?: string[] | null;
  plotShape?: string | null;
  frontageFt?: number | null;
  boundaryWall?: string | null;
  landClearance?: boolean | null;
  depthFt?: number | null;
  zoning?: string | null;
  setbackAvailable?: boolean | null;
  setbackText?: string | null;
  suitableFor?: string[] | null;
  parkingSpaces?: number | null;
  landClassification?: string | null;
  soilType?: string | null;
  waterSources?: string[] | null;
  irrigationType?: string | null;
  currentCrops?: string | null;
  fencing?: string | null;
  electricityAvailable?: boolean | null;
  terrain?: string | null;
  annualYield?: string | null;
  farmStructures?: string[] | null;
  ceilingHeightFt?: number | null;
  parkingAvailable?: boolean | null;
  parkingType?: string | null;
  priceType?: string | null;
  leaseAvailable?: boolean | null;
  leaseMonthlyRent?: number | null;
  commercialFeatures?: string[] | null;
  zoningLegal?: string | null;
  heritageType?: string | null;
  heritageEra?: string | null;
  heritageGrade?: string | null;
  courtyard?: string | null;
  traditionalFeatures?: string[] | null;
  renovationStatus?: string | null;
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
  pricePerAana?: number | null;
  roadAccessWidthFt?: number;
  roadType?: string; // RoadType enum
  facing?: string; // FacingDirection enum
  isCornerPlot?: boolean;
  isNegotiable?: boolean;
  minBuyableLandSqFt?: number;
  minBuyableUnitSystem?: string;
  minBuyableRopani?: number;
  minBuyableAana?: number;
  minBuyablePaisa?: number;
  minBuyableDaam?: number;
  minBuyableBigha?: number;
  minBuyableKatha?: number;
  minBuyableDhur?: number;
  // Type-specific Step 3 specs — null/[]/false clear the field on edit.
  builtUpAreaSqFt?: number | null;
  propertySubtype?: string | null;
  yearBuilt?: number | null;
  constructionStatus?: string | null;
  floorNumber?: number | null;
  totalFloors?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  livingRooms?: number | null;
  kitchens?: number | null;
  balconies?: number | null;
  parking?: string | null;
  furnishing?: string | null;
  houseFacing?: string | null;
  amenities?: string[];
  plotShape?: string | null;
  frontageFt?: number | null;
  boundaryWall?: string | null;
  landClearance?: boolean;
  depthFt?: number | null;
  zoning?: string | null;
  setbackAvailable?: boolean;
  setbackText?: string | null;
  suitableFor?: string[];
  parkingSpaces?: number | null;
  landClassification?: string | null;
  soilType?: string | null;
  waterSources?: string[];
  irrigationType?: string | null;
  currentCrops?: string | null;
  fencing?: string | null;
  electricityAvailable?: boolean;
  terrain?: string | null;
  annualYield?: string | null;
  farmStructures?: string[];
  ceilingHeightFt?: number | null;
  parkingAvailable?: boolean;
  parkingType?: string | null;
  priceType?: string | null;
  leaseAvailable?: boolean;
  leaseMonthlyRent?: number | null;
  commercialFeatures?: string[];
  zoningLegal?: string | null;
  heritageType?: string | null;
  heritageEra?: string | null;
  heritageGrade?: string | null;
  courtyard?: string | null;
  traditionalFeatures?: string[];
  renovationStatus?: string | null;
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
  /** Whether the listing carries a verification level (shows the stamp). */
  isVerified?: boolean;
}

// Presentational helpers moved to @repo/ui (shared with the admin console).
export { TYPE_LABELS, TYPE_GRADIENTS, FALLBACK_GRADIENT, formatNPR, labelEnum };

export const VERIFICATION_LABELS: Record<string, string> = {
  UNVERIFIED: "Unverified",
  LEVEL_1_BASIC: "Level 1 Basic",
  LEVEL_2_DOC_VERIFIED: "Document Verified",
  LEVEL_3_FIELD_VERIFIED: "Field Verified",
  REJECTED: "Rejected",
};

export function formatLocation(loc?: ApiPropertyLocation | null): string {
  if (!loc) return "Location TBD";
  const place = loc.areaName || loc.municipality || loc.district;
  return loc.district && loc.district !== place
    ? `${place}, ${loc.district}`
    : place;
}

/** Format min buyable land for display, defaulting to Dhur for BIGHA system or Aana for ROPANI. */
export function formatMinBuyableLand(p: ApiProperty): string | null {
  if (!p.minBuyableLandSqFt) return null;
  const sqft = p.minBuyableLandSqFt;
  // Default display unit based on the seller's entry system
  if (p.minBuyableUnitSystem === "BIGHA") {
    // Convert to Dhur (1 dhur = 364.5 / 20 = 18.225 sq ft)
    const dhur = Math.round((sqft / 18.225) * 100) / 100;
    return `${dhur} Dhur`;
  }
  // ROPANI system — show in Aana (1 aana = 342.25 sq ft)
  const aana = Math.round((sqft / 342.25) * 100) / 100;
  return `${aana} Aana`;
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

/** The three land property types — priced per land unit (aana/ropani/bigha).
 *  Building types (houses, apartments, heritage, commercial space) are priced
 *  per sq.ft of built-up area, so per-aana rates are hidden for them. */
export function isLandPropertyType(type?: string | null): boolean {
  return (
    type === "RESIDENTIAL_LAND" ||
    type === "COMMERCIAL_LAND" ||
    type === "AGRICULTURAL_LAND"
  );
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
  if (p.isNegotiable) meta.push("Negotiable");
  if (p.minBuyableLandSqFt) {
    const minArea = formatMinBuyableLand(p);
    if (minArea) meta.push(`Min: ${minArea}`);
  }
  if (isLandPropertyType(p.propertyType) && p.pricePerAana)
    meta.push(`Price/Aana: ${formatNPR(p.pricePerAana)}`);
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
    isVerified:
      p.verificationLevel != null && p.verificationLevel !== "UNVERIFIED",
  };
}
