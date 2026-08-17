import {
  APARTMENT_LIKE_SUBTYPES,
  isBuildingType,
  isLandType,
  PRICE_UNITS,
  type UnitSystem,
} from "./constants";
import { stripHtml } from "./format";

export { isLandType, isBuildingType } from "./constants";

export interface DraftMedia {
  url: string;
  publicId?: string;
  type?: string; // MediaType enum (IMAGE | VIDEO_WALKTHROUGH | CADASTRAL_MAP)
  altText?: string;
}

export interface DraftDocument {
  type: string; // DocumentType enum
  fileUrl: string;
  publicId?: string;
  fileName: string;
  fileSizeMb: number;
}

export interface ListingDraft {
  /* basics */
  title: string;
  mainCategory: string; // MainCategory enum value (e.g. RESIDENTIAL)
  subCategory: string; // SubCategory enum value (e.g. HOUSE)
  description: string;
  askingPrice: string; // user-typed, may contain commas/spaces
  priceUnit: string;

  /* location */
  province: string;
  district: string;
  municipality: string;
  ward: string; // e.g. "Ward 6"
  areaName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;

  /* land & specs */
  unitSystem: UnitSystem;
  units: Record<string, string>; // keyed by part key: ropani/aana/…/dhur
  roadType: string; // RoadType enum value
  roadWidthFt: string;
  facing: string; // FacingDirection enum value
  isCornerPlot: boolean;
  isNegotiable: boolean;
  minBuyableUnitSystem: UnitSystem;
  minBuyableUnits: Record<string, string>; // same shape as units

  /* type-specific specs — Step 3 dynamic fields (wizard-only for now) */

  // Residential land
  plotShape: string;
  frontageFt: string;
  boundaryWall: string; // "YES" | "PARTIAL" | "NO" | ""
  landClearance: boolean; // fenced / cleared

  // Commercial land
  depthFt: string;
  zoning: string;
  setbackAvailable: boolean;
  setbackText: string; // front/back/side setback in feet
  suitableFor: string[];
  parkingSpaces: string; // count

  // Agricultural land
  landClassification: string;
  soilType: string;
  waterSources: string[];
  irrigationType: string;
  currentCrops: string;
  fencing: string; // "FULL" | "PARTIAL" | "NONE" | ""
  electricityAvailable: boolean;
  terrain: string;
  annualYield: string;
  farmStructures: string[];

  // Residential house / Commercial space / Heritage home (shared building specs)
  builtUpAreaSqFt: string;
  propertySubtype: string;
  yearBuilt: string;
  constructionStatus: string;
  floorNumber: string;
  totalFloors: string;
  bedrooms: string;
  bathrooms: string;
  livingRooms: string;
  kitchens: string;
  balconies: string;
  parking: string; // PARKING_OPTIONS (house/heritage)
  furnishing: string;
  houseFacing: string; // HOUSE_FACING_OPTIONS
  amenities: string[];

  // Commercial space only
  ceilingHeightFt: string;
  parkingAvailable: boolean;
  parkingType: string;
  priceType: string; // PRICE_TYPES
  leaseAvailable: boolean;
  leaseMonthlyRent: string;
  commercialFeatures: string[];
  zoningLegal: string;

  // Heritage home only
  heritageType: string;
  heritageEra: string;
  heritageGrade: string;
  courtyard: string;
  traditionalFeatures: string[];
  renovationStatus: string;

  /* media & documents */
  media: DraftMedia[];
  videoUrls: string[];
  documents: DraftDocument[];
}

export const INITIAL_DRAFT: ListingDraft = {
  title: "",
  mainCategory: "",
  subCategory: "",
  description: "",
  askingPrice: "",
  priceUnit: "",
  province: "",
  district: "",
  municipality: "",
  ward: "",
  areaName: "",
  address: "",
  latitude: null,
  longitude: null,
  unitSystem: "ROPANI",
  units: {},
  roadType: "",
  roadWidthFt: "",
  facing: "",
  isCornerPlot: false,
  isNegotiable: false,
  minBuyableUnitSystem: "ROPANI",
  minBuyableUnits: {},

  /* type-specific specs (wizard-only for now) */
  plotShape: "",
  frontageFt: "",
  boundaryWall: "",
  landClearance: false,
  depthFt: "",
  zoning: "",
  setbackAvailable: false,
  setbackText: "",
  suitableFor: [],
  parkingSpaces: "",
  landClassification: "",
  soilType: "",
  waterSources: [],
  irrigationType: "",
  currentCrops: "",
  fencing: "",
  electricityAvailable: false,
  terrain: "",
  annualYield: "",
  farmStructures: [],
  builtUpAreaSqFt: "",
  propertySubtype: "",
  yearBuilt: "",
  constructionStatus: "",
  floorNumber: "",
  totalFloors: "",
  bedrooms: "",
  bathrooms: "",
  livingRooms: "",
  kitchens: "",
  balconies: "",
  parking: "",
  furnishing: "",
  houseFacing: "",
  amenities: [],
  ceilingHeightFt: "",
  parkingAvailable: false,
  parkingType: "",
  priceType: "",
  leaseAvailable: false,
  leaseMonthlyRent: "",
  commercialFeatures: [],
  zoningLegal: "",
  heritageType: "",
  heritageEra: "",
  heritageGrade: "",
  courtyard: "",
  traditionalFeatures: [],
  renovationStatus: "",
  media: [],
  videoUrls: [],
  documents: [],
};

export type DraftErrors = Partial<Record<string, string>>;

export const TITLE_MIN = 5;
export const TITLE_MAX = 80;
export const ROAD_WIDTH_MAX_FT = 200;

const num = (s: string | undefined): number => {
  const n = Number((s ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/** Number from a draft input, or null when the field was left empty. */
const numberOrNull = (s: string): number | null =>
  s.trim() === "" ? null : num(s);

/** Trimmed string, or null when empty. */
const strOrNull = (s: string): string | null =>
  s.trim().length > 0 ? s.trim() : null;

/** Exact area in sq ft (no rounding). Used for price-per-unit so rates stay
 *  consistent with PRICE_UNITS factors (e.g. 1 daam = 342.25/16 sq ft). */
function totalSqFtExact(draft: ListingDraft): number {
  const u = draft.units;
  if (draft.unitSystem === "ROPANI") {
    const totalAana =
      num(u.ropani) * 16 + num(u.aana) + num(u.paisa) / 4 + num(u.daam) / 16;
    return totalAana * 342.25;
  }
  const totalKatha = num(u.bigha) * 20 + num(u.katha) + num(u.dhur) / 20;
  return totalKatha * 364.5;
}

/** Rounded area for display / payload. */
export function totalSqFt(draft: ListingDraft): number {
  return Math.round(totalSqFtExact(draft));
}

/** Min buyable land in sq ft (exact). Mirrors totalSqFtExact but reads minBuyableUnits. */
function minBuyableSqFtExact(draft: ListingDraft): number {
  const mu = draft.minBuyableUnits;
  if (draft.minBuyableUnitSystem === "ROPANI") {
    const totalAana =
      num(mu.ropani) * 16 +
      num(mu.aana) +
      num(mu.paisa) / 4 +
      num(mu.daam) / 16;
    return totalAana * 342.25;
  }
  const totalKatha = num(mu.bigha) * 20 + num(mu.katha) + num(mu.dhur) / 20;
  return totalKatha * 364.5;
}

/** Rounded min buyable area for payload. */
export function minBuyableSqFt(draft: ListingDraft): number {
  return Math.round(minBuyableSqFtExact(draft));
}

export function askingPriceNumber(draft: ListingDraft): number {
  return num(draft.askingPrice);
}

/** Built-up / carpet area in sq ft (0 when unset). */
export function builtUpAreaNumber(draft: ListingDraft): number {
  return num(draft.builtUpAreaSqFt);
}

/**
 * The area (sq ft, exact) that drives price-per-unit math for the current
 * property type. Building types are priced per sq ft of built-up area when it
 * is provided (falling back to the land area otherwise); land types always use
 * the land area.
 */
function priceAreaSqFtExact(draft: ListingDraft): number {
  if (isBuildingType(draft.subCategory)) {
    const built = builtUpAreaNumber(draft);
    if (built > 0) return built;
  }
  return totalSqFtExact(draft);
}

/**
 * Price per unit of the given PRICE_UNITS key. Building types effectively use
 * the "sqft"/"sqm" keys (built-up area); land types use the land units.
 */
export function pricePerUnit(
  draft: ListingDraft,
  unitKey: string,
): number | null {
  // Must use exact sq ft — rounding first (e.g. 1 daam → 21 instead of
  // 21.390625) makes totalUnits ≠ the entered land units and skews the rate.
  const sqft = priceAreaSqFtExact(draft);
  const price = askingPriceNumber(draft);

  if (sqft <= 0 || price <= 0) return null;
  const unit = PRICE_UNITS.find((u) => u.key === unitKey);
  if (!unit || unit.sqFt <= 0) return null;
  const totalUnits = sqft / unit.sqFt;
  if (totalUnits <= 0) return null;
  // Keep paisa-level precision (2 dp) — do not round to whole rupees.
  return Math.round((price / totalUnits) * 100) / 100;
}

/** Price per sq ft of built-up area (building types only). */
export function pricePerSqFt(draft: ListingDraft): number | null {
  const area = builtUpAreaNumber(draft);
  const price = askingPriceNumber(draft);
  if (area <= 0 || price <= 0) return null;
  return Math.round((price / area) * 100) / 100;
}

export function formatLandAreaLabel(draft: ListingDraft): string | null {
  const u = draft.units;
  if (draft.unitSystem === "ROPANI") {
    const parts: string[] = [];
    if (num(u.ropani)) parts.push(`${num(u.ropani)} Ropani`);
    if (num(u.aana)) parts.push(`${num(u.aana)} Aana`);
    if (num(u.paisa)) parts.push(`${num(u.paisa)} Paisa`);
    if (num(u.daam)) parts.push(`${num(u.daam)} Daam`);
    return parts.length > 0 ? parts.join(" ") : null;
  }
  const parts: string[] = [];
  if (num(u.bigha)) parts.push(`${num(u.bigha)} Bigha`);
  if (num(u.katha)) parts.push(`${num(u.katha)} Kattha`);
  if (num(u.dhur)) parts.push(`${num(u.dhur)} Dhur`);
  return parts.length > 0 ? parts.join(" ") : null;
}

export function validateStep(step: number, draft: ListingDraft): DraftErrors {
  const errors: DraftErrors = {};

  if (step === 0) {
    const title = draft.title.trim();
    if (title.length < TITLE_MIN)
      errors.title = `Give the listing at least ${TITLE_MIN} characters.`;
    else if (title.length > TITLE_MAX)
      errors.title = `Keep the title under ${TITLE_MAX} characters.`;
    if (!draft.mainCategory || !draft.subCategory)
      errors.subCategory = "Pick a property category and type.";
  }

  if (step === 1) {
    if (!draft.province) errors.province = "Required";
    if (!draft.district) errors.district = "Required";
    if (!draft.municipality) errors.municipality = "Required";
    if (!draft.ward) errors.ward = "Required";
    if (!draft.areaName.trim()) errors.areaName = "Area name is required.";
  }

  if (step === 2) {
    const u = draft.units;
    const hasLand = totalSqFt(draft) > 0;

    // Land area: required for the three land types; optional for building
    // types ("only if the property includes land"). Either way, sub-units at
    // or above their parent unit silently double-count the area math.
    if (isLandType(draft.subCategory) && !hasLand) {
      errors.units = "Enter the land area in your chosen unit system.";
    } else if (hasLand) {
      if (draft.unitSystem === "ROPANI") {
        // 1 ropani = 16 aana = 64 paisa = 256 daam.
        if (num(u.aana) >= 16)
          errors.units = "Aana must be under 16 (16 aana = 1 ropani).";
        else if (num(u.paisa) >= 4)
          errors.units = "Paisa must be under 4 (4 paisa = 1 aana).";
        else if (num(u.daam) >= 4)
          errors.units = "Daam must be under 4 (4 daam = 1 paisa).";
      } else {
        // 1 bigha = 20 katha = 400 dhur.
        if (num(u.katha) >= 20)
          errors.units = "Katha must be under 20 (20 katha = 1 bigha).";
        else if (num(u.dhur) >= 20)
          errors.units = "Dhur must be under 20 (20 dhur = 1 katha).";
      }
    }

    // Per-type required fields (wizard-only — not yet persisted).
    // Now using subCategory for granular validation.
    const sub = draft.subCategory;
    if (
      (sub === "COMMERCIAL_LAND" || sub === "RETAIL_SPACE") &&
      num(draft.frontageFt) <= 0
    ) {
      errors.frontageFt = "Frontage is required for commercial land/retail.";
    }
    if (
      sub === "HOUSE" ||
      sub === "APARTMENT_FLAT" ||
      sub === "TOWNHOUSE" ||
      sub === "RESIDENTIAL_BUILDING"
    ) {
      if (builtUpAreaNumber(draft) <= 0)
        errors.builtUpAreaSqFt = "Enter the built-up area in sq.ft.";
      if (
        (sub === "APARTMENT_FLAT" || sub === "TOWNHOUSE") &&
        num(draft.floorNumber) <= 0
      )
        errors.floorNumber = "Floor number is required for apartments/townhouses.";
    }
    if (
      sub === "OFFICE" ||
      sub === "RETAIL_SPACE" ||
      sub === "RESTAURANT_CAFE" ||
      sub === "HOSPITALITY" ||
      sub === "COMMERCIAL_BUILDING"
    ) {
      if (builtUpAreaNumber(draft) <= 0)
        errors.builtUpAreaSqFt = "Enter the built-up area in sq.ft.";
    }
    if (
      sub === "WAREHOUSE_GODOWN" ||
      sub === "FACTORY_MANUFACTURING" ||
      sub === "INDUSTRIAL_BUILDING"
    ) {
      if (builtUpAreaNumber(draft) <= 0)
        errors.builtUpAreaSqFt = "Enter the built-up area in sq.ft.";
    }

    const roadWidth = num(draft.roadWidthFt);
    if (
      draft.roadWidthFt.trim() !== "" &&
      (roadWidth <= 0 || roadWidth > ROAD_WIDTH_MAX_FT)
    )
      errors.roadWidthFt = `Road width must be between 1 and ${ROAD_WIDTH_MAX_FT} ft.`;

    if (askingPriceNumber(draft) <= 0)
      errors.askingPrice = "Enter the asking price in NPR.";
  }

  return errors;
}

export function validateAll(draft: ListingDraft): {
  errors: DraftErrors;
  firstInvalidStep: number | null;
} {
  for (const step of [0, 1, 2]) {
    const errors = validateStep(step, draft);
    if (Object.keys(errors).length > 0) {
      return { errors, firstInvalidStep: step };
    }
  }
  return { errors: {}, firstInvalidStep: null };
}

/* ------------------------------------------------------------------ */
/* Payload types — the wire shape sent to the API on create/update.    */
/* Mirrors the API's CreatePropertyInput DTO. Enum fields stay `string` */
/* so consumers don't depend on Prisma — the API validates and returns */
/* 400 on bad values.                                                  */
/* ------------------------------------------------------------------ */

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

export interface CreatePropertyPayload {
  title: string;
  description?: string;
  mainCategory: string; // MainCategory enum
  subCategory: string; // SubCategory enum
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

  /* Type-specific Step 3 specs — always sent (null/[]/false clear on edit). */
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

export function buildCreatePayload(draft: ListingDraft): CreatePropertyPayload {
  const askingPrice = askingPriceNumber(draft);
  const sqft = totalSqFt(draft);
  const sqm = Math.round(sqft * 0.092903);
  const u = draft.units;
  const wardNumber = Number(draft.ward.replace(/[^0-9]/g, ""));

  const landArea: CreatePropertyPayload["landArea"] =
    draft.unitSystem === "ROPANI"
      ? {
          ropani: num(u.ropani),
          aana: num(u.aana),
          paisa: num(u.paisa),
          daam: num(u.daam),
          totalSqFt: sqft,
          totalSqMeters: sqm,
        }
      : {
          // DTO requires ropani/aana as numbers even for Terai listings.
          ropani: 0,
          aana: 0,
          bigha: num(u.bigha),
          katha: num(u.katha),
          dhur: num(u.dhur),
          totalSqFt: sqft,
          totalSqMeters: sqm,
        };

  // Price per aana is a land-pricing metric: only meaningful for the land
  // types and only in the Ropani system. Building types (houses, apartments,
  // heritage, commercial space) are priced per sq.ft of built-up area, so a
  // per-aana rate derived from an optional/small land parcel would be
  // misleading (e.g. a 1-paisa parcel under an apartment → an absurd rate).
  let pricePerAana: number | undefined;
  if (isLandType(draft.subCategory) && draft.unitSystem === "ROPANI") {
    const totalAana =
      num(u.ropani) * 16 + num(u.aana) + num(u.paisa) / 4 + num(u.daam) / 16;
    if (totalAana > 0) pricePerAana = Math.round(askingPrice / totalAana);
  }

  // Assemble media: uploaded images first (first image = cover), then uploaded
  // videos, then external video URLs. Sort orders are sequential across all.
  const media: NonNullable<CreatePropertyPayload["media"]> = [];
  let sortOrder = 0;
  let coverAssigned = false;

  // Uploaded images — first one becomes the cover. Cadastral maps (naksa) are
  // never the cover.
  for (const m of draft.media) {
    if (m.type === "VIDEO_WALKTHROUGH" || m.type === "CADASTRAL_MAP") continue;
    media.push({
      type: m.type ?? "IMAGE",
      url: m.url,
      ...(m.altText && { altText: m.altText }),
      sortOrder,
      isCover: !coverAssigned,
    });
    coverAssigned = true;
    sortOrder++;
  }

  // Cadastral maps (Naksa)
  for (const m of draft.media) {
    if (m.type !== "CADASTRAL_MAP") continue;
    media.push({
      type: "CADASTRAL_MAP",
      url: m.url,
      ...(m.altText && { altText: m.altText }),
      sortOrder,
      isCover: false,
    });
    sortOrder++;
  }

  // Uploaded videos
  for (const m of draft.media) {
    if (m.type !== "VIDEO_WALKTHROUGH") continue;
    media.push({
      type: "VIDEO_WALKTHROUGH",
      url: m.url,
      ...(m.altText && { altText: m.altText }),
      sortOrder,
    });
    sortOrder++;
  }

  // External video URLs
  for (const url of draft.videoUrls) {
    const trimmed = url.trim();
    if (trimmed) {
      media.push({
        type: "VIDEO_WALKTHROUGH",
        url: trimmed,
        sortOrder,
      });
      sortOrder++;
    }
  }

  return {
    title: draft.title.trim(),
    ...(stripHtml(draft.description)
      ? { description: draft.description.trim() }
      : {}),
    mainCategory: draft.mainCategory,
    subCategory: draft.subCategory,
    askingPrice,
    // Land types carry the computed rate; building types send an explicit
    // null so stale values stored before the land-only rule are cleared on
    // edit (matches the "cleared fields reset the DB" pattern in this payload).
    ...(isLandType(draft.subCategory)
      ? pricePerAana
        ? { pricePerAana }
        : {}
      : { pricePerAana: null }),
    ...(num(draft.roadWidthFt) > 0 && {
      roadAccessWidthFt: num(draft.roadWidthFt),
    }),
    ...(draft.roadType && { roadType: draft.roadType }),
    ...(draft.facing && { facing: draft.facing }),
    isCornerPlot: draft.isCornerPlot,
    isNegotiable: draft.isNegotiable,
    // Min buyable land — only send if at least one unit is entered.
    ...(() => {
      const mu = draft.minBuyableUnits;
      const hasMin = Object.values(mu).some((v) => num(v) > 0);
      if (!hasMin) return {};
      const mSqft = minBuyableSqFt(draft);
      const mSqm = Math.round(mSqft * 0.092903);
      return {
        minBuyableLandSqFt: mSqft,
        minBuyableUnitSystem: draft.minBuyableUnitSystem,
        ...(draft.minBuyableUnitSystem === "ROPANI"
          ? {
              minBuyableRopani: num(mu.ropani),
              minBuyableAana: num(mu.aana),
              minBuyablePaisa: num(mu.paisa),
              minBuyableDaam: num(mu.daam),
            }
          : {
              minBuyableBigha: num(mu.bigha),
              minBuyableKatha: num(mu.katha),
              minBuyableDhur: num(mu.dhur),
            }),
      };
    })(),
    // Type-specific Step 3 specs — always included so fields cleared on edit
    // reset to null/[]/false instead of keeping their previous value.
    builtUpAreaSqFt: numberOrNull(draft.builtUpAreaSqFt),
    propertySubtype: strOrNull(draft.propertySubtype),
    yearBuilt: numberOrNull(draft.yearBuilt),
    constructionStatus: strOrNull(draft.constructionStatus),
    floorNumber: numberOrNull(draft.floorNumber),
    totalFloors: numberOrNull(draft.totalFloors),
    bedrooms: numberOrNull(draft.bedrooms),
    bathrooms: numberOrNull(draft.bathrooms),
    livingRooms: numberOrNull(draft.livingRooms),
    kitchens: numberOrNull(draft.kitchens),
    balconies: numberOrNull(draft.balconies),
    parking: strOrNull(draft.parking),
    furnishing: strOrNull(draft.furnishing),
    houseFacing: strOrNull(draft.houseFacing),
    amenities: draft.amenities,
    plotShape: strOrNull(draft.plotShape),
    frontageFt: numberOrNull(draft.frontageFt),
    boundaryWall: strOrNull(draft.boundaryWall),
    landClearance: draft.landClearance,
    depthFt: numberOrNull(draft.depthFt),
    zoning: strOrNull(draft.zoning),
    setbackAvailable: draft.setbackAvailable,
    setbackText: strOrNull(draft.setbackText),
    suitableFor: draft.suitableFor,
    parkingSpaces: numberOrNull(draft.parkingSpaces),
    landClassification: strOrNull(draft.landClassification),
    soilType: strOrNull(draft.soilType),
    waterSources: draft.waterSources,
    irrigationType: strOrNull(draft.irrigationType),
    currentCrops: strOrNull(draft.currentCrops),
    fencing: strOrNull(draft.fencing),
    electricityAvailable: draft.electricityAvailable,
    terrain: strOrNull(draft.terrain),
    annualYield: strOrNull(draft.annualYield),
    farmStructures: draft.farmStructures,
    ceilingHeightFt: numberOrNull(draft.ceilingHeightFt),
    parkingAvailable: draft.parkingAvailable,
    parkingType: strOrNull(draft.parkingType),
    priceType: strOrNull(draft.priceType),
    leaseAvailable: draft.leaseAvailable,
    leaseMonthlyRent: numberOrNull(draft.leaseMonthlyRent),
    commercialFeatures: draft.commercialFeatures,
    zoningLegal: strOrNull(draft.zoningLegal),
    heritageType: strOrNull(draft.heritageType),
    heritageEra: strOrNull(draft.heritageEra),
    heritageGrade: strOrNull(draft.heritageGrade),
    courtyard: strOrNull(draft.courtyard),
    traditionalFeatures: draft.traditionalFeatures,
    renovationStatus: strOrNull(draft.renovationStatus),
    landArea,
    location: {
      province: draft.province,
      district: draft.district,
      municipality: draft.municipality,
      wardNumber,
      areaName: draft.areaName.trim(),
      ...(draft.address.trim() && { addressText: draft.address.trim() }),
      ...(draft.latitude != null && { latitude: draft.latitude }),
      ...(draft.longitude != null && { longitude: draft.longitude }),
    },
    // Always send the media array: on create an empty array simply means "no
    // media", while on update it lets the API replace (or clear) the gallery.
    media,
    ...(draft.documents.length > 0 && {
      documents: draft.documents.map((d) => ({
        type: d.type,
        fileUrl: d.fileUrl,
        fileName: d.fileName,
        fileSizeMb: d.fileSizeMb,
        isPrivate: true,
      })),
    }),
  };
}

/* ------------------------------------------------------------------ */
/* Edit-mode hydration — the shape of a property record returned by    */
/* either the client API or the admin API. Structural subset of the    */
/* full record: only the fields the wizard reads.                      */
/* ------------------------------------------------------------------ */

export interface WizardProperty {
  title: string;
  mainCategory: string;
  subCategory: string;
  description?: string | null;
  askingPrice: number | string;
  pricePerAana?: number | string | null;
  roadAccessWidthFt?: number | null;
  roadType?: string | null;
  facing?: string | null;
  isCornerPlot: boolean;
  isNegotiable?: boolean;
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
  location?: {
    province?: string;
    district?: string;
    municipality?: string;
    wardNumber?: number | null;
    areaName?: string;
    addressText?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  landArea?: {
    ropani?: number;
    aana?: number;
    paisa?: number;
    daam?: number;
    bigha?: number | null;
    katha?: number | null;
    dhur?: number | null;
    totalSqFt?: number;
    totalSqMeters?: number;
  } | null;
  media?: {
    type?: string | null;
    url: string;
    altText?: string | null;
    sortOrder?: number;
    isCover?: boolean;
  }[];
  documents?: {
    type: string;
    fileUrl: string;
    fileName: string;
    fileSizeMb: number;
  }[];
}

/**
 * Hydrate a create draft from an existing API record (used by the listing
 * wizard's edit mode). The wizard's steps read/write a `ListingDraft`, so this
 * is the bridge that lets "Edit" load the same form a property was created on.
 */
export function listingDraftFromApiProperty(p: WizardProperty): ListingDraft {
  const location = p.location;
  const area = p.landArea;
  const usedBigha = Boolean(area && (area.bigha || area.katha || area.dhur));

  const allMedia = p.media ?? [];

  // Uploaded videos live on Cloudinary; external URLs are anything else.
  // WizardPropertyMedia has no publicId field, so we distinguish by URL host.
  const isUploaded = (url: string) => url.includes("res.cloudinary.com");

  const videoUrls = allMedia
    .filter((m) => m.type === "VIDEO_WALKTHROUGH" && !isUploaded(m.url))
    .map((m) => m.url);

  // Gallery items: images + uploaded videos + cadastral maps (naksa). Rows
  // without a type (legacy records) are kept as photos to avoid dropping real
  // uploads. Cadastral maps must be kept here too — the API replaces media
  // wholesale on update, so dropping them on edit would delete the naksa.
  const media: DraftMedia[] = allMedia
    .filter(
      (m) =>
        !m.type ||
        m.type === "IMAGE" ||
        m.type === "CADASTRAL_MAP" ||
        (m.type === "VIDEO_WALKTHROUGH" && isUploaded(m.url)),
    )
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m) => ({
      url: m.url,
      ...(m.type === "VIDEO_WALKTHROUGH" || m.type === "CADASTRAL_MAP"
        ? { type: m.type }
        : {}),
      ...(m.altText ? { altText: m.altText } : {}),
    }));

  const units: Record<string, string> = {};
  if (area) {
    if (area.ropani) units.ropani = String(area.ropani);
    if (area.aana) units.aana = String(area.aana);
    if (area.paisa) units.paisa = String(area.paisa);
    if (area.daam) units.daam = String(area.daam);
    if (area.bigha) units.bigha = String(area.bigha);
    if (area.katha) units.katha = String(area.katha);
    if (area.dhur) units.dhur = String(area.dhur);
  }

  // The original API record stores the ward as a number; mirror the wizard's
  // "Ward N" display/text format.
  const ward = location?.wardNumber ? `Ward ${location.wardNumber}` : "";

  return {
    // Type-specific spec fields aren't persisted yet — hydrate from defaults.
    ...INITIAL_DRAFT,
    title: p.title,
    mainCategory: p.mainCategory,
    subCategory: p.subCategory,
    description: p.description ?? "",
    askingPrice: String(p.askingPrice),
    priceUnit: "",
    province: location?.province ?? "",
    district: location?.district ?? "",
    municipality: location?.municipality ?? "",
    ward,
    areaName: location?.areaName ?? "",
    address: location?.addressText ?? "",
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    unitSystem: (usedBigha ? "BIGHA" : "ROPANI") as UnitSystem,
    units,
    roadType: p.roadType ?? "",
    roadWidthFt: p.roadAccessWidthFt ? String(p.roadAccessWidthFt) : "",
    facing: p.facing ?? "",
    isCornerPlot: p.isCornerPlot,
    isNegotiable: p.isNegotiable ?? false,
    minBuyableUnitSystem: (p.minBuyableUnitSystem === "BIGHA"
      ? "BIGHA"
      : "ROPANI") as UnitSystem,
    minBuyableUnits: (() => {
      const mu: Record<string, string> = {};
      if (p.minBuyableRopani) mu.ropani = String(p.minBuyableRopani);
      if (p.minBuyableAana) mu.aana = String(p.minBuyableAana);
      if (p.minBuyablePaisa) mu.paisa = String(p.minBuyablePaisa);
      if (p.minBuyableDaam) mu.daam = String(p.minBuyableDaam);
      if (p.minBuyableBigha) mu.bigha = String(p.minBuyableBigha);
      if (p.minBuyableKatha) mu.katha = String(p.minBuyableKatha);
      if (p.minBuyableDhur) mu.dhur = String(p.minBuyableDhur);
      return mu;
    })(),
    // Type-specific Step 3 specs (INITIAL_DRAFT defaults above, then overrides).
    builtUpAreaSqFt: p.builtUpAreaSqFt ? String(p.builtUpAreaSqFt) : "",
    propertySubtype: p.propertySubtype ?? "",
    yearBuilt: p.yearBuilt ? String(p.yearBuilt) : "",
    constructionStatus: p.constructionStatus ?? "",
    floorNumber: p.floorNumber ? String(p.floorNumber) : "",
    totalFloors: p.totalFloors ? String(p.totalFloors) : "",
    bedrooms: p.bedrooms ? String(p.bedrooms) : "",
    bathrooms: p.bathrooms ? String(p.bathrooms) : "",
    livingRooms: p.livingRooms ? String(p.livingRooms) : "",
    kitchens: p.kitchens ? String(p.kitchens) : "",
    balconies: p.balconies ? String(p.balconies) : "",
    parking: p.parking ?? "",
    furnishing: p.furnishing ?? "",
    houseFacing: p.houseFacing ?? "",
    amenities: p.amenities ?? [],
    plotShape: p.plotShape ?? "",
    frontageFt: p.frontageFt ? String(p.frontageFt) : "",
    boundaryWall: p.boundaryWall ?? "",
    landClearance: p.landClearance ?? false,
    depthFt: p.depthFt ? String(p.depthFt) : "",
    zoning: p.zoning ?? "",
    setbackAvailable: p.setbackAvailable ?? false,
    setbackText: p.setbackText ?? "",
    suitableFor: p.suitableFor ?? [],
    parkingSpaces: p.parkingSpaces ? String(p.parkingSpaces) : "",
    landClassification: p.landClassification ?? "",
    soilType: p.soilType ?? "",
    waterSources: p.waterSources ?? [],
    irrigationType: p.irrigationType ?? "",
    currentCrops: p.currentCrops ?? "",
    fencing: p.fencing ?? "",
    electricityAvailable: p.electricityAvailable ?? false,
    terrain: p.terrain ?? "",
    annualYield: p.annualYield ?? "",
    farmStructures: p.farmStructures ?? [],
    ceilingHeightFt: p.ceilingHeightFt ? String(p.ceilingHeightFt) : "",
    parkingAvailable: p.parkingAvailable ?? false,
    parkingType: p.parkingType ?? "",
    priceType: p.priceType ?? "",
    leaseAvailable: p.leaseAvailable ?? false,
    leaseMonthlyRent: p.leaseMonthlyRent ? String(p.leaseMonthlyRent) : "",
    commercialFeatures: p.commercialFeatures ?? [],
    zoningLegal: p.zoningLegal ?? "",
    heritageType: p.heritageType ?? "",
    heritageEra: p.heritageEra ?? "",
    heritageGrade: p.heritageGrade ?? "",
    courtyard: p.courtyard ?? "",
    traditionalFeatures: p.traditionalFeatures ?? [],
    renovationStatus: p.renovationStatus ?? "",
    media,
    videoUrls,
    documents: (p.documents ?? []).map((d) => ({
      type: d.type,
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      fileSizeMb: d.fileSizeMb,
    })),
  };
}
