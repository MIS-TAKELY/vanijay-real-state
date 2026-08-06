/**
 * Single source of truth for the New Listing wizard state.
 *
 * The wizard collects display-friendly values (comma-grouped prices, "Ward 6",
 * human road/facing labels). `buildCreatePayload()` converts that draft into
 * the exact shape the API's `CreatePropertyInput` DTO validates, including
 * mapping UI labels to Prisma enum values (`NORTH_EAST`, `PITCHED`, …).
 *
 * Conversion factors match the ones historically used in StepLandSpecs:
 *   Ropani system:  1 ropani = 16 aana = 64 paisa = 256 daam; 1 aana = 342.25 sq ft
 *   Bigha system:   1 bigha = 20 katha = 400 dhur;            1 katha = 364.5 sq ft
 */

import type { CreatePropertyPayload } from "lib/api/services/properties/types";
import type { UnitSystem } from "./constants";

export type { CreatePropertyPayload };

/**
 * One uploaded media asset kept on the client draft. `url` is the Cloudinary
 * URL returned by the uploads API; previews are derived from it in the UI.
 */
export interface DraftMedia {
  url: string;
  /** Cloudinary public id, kept so the asset can be deleted if removed. */
  publicId?: string;
  type?: string; // MediaType enum (IMAGE | VIDEO_WALKTHROUGH | CADASTRAL_MAP)
  altText?: string;
}

export interface ListingDraft {
  /* basics */
  title: string;
  propertyType: string; // PropertyType enum value (e.g. RESIDENTIAL_LAND)
  description: string;
  askingPrice: string; // user-typed, may contain commas/spaces

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

  /* media & documents */
  /** Uploaded photo gallery (Cloudinary), first item is the cover. */
  media: DraftMedia[];
  /** Optional video-walkthrough URL (YouTube, etc.). */
  videoUrl: string;
}

export const INITIAL_DRAFT: ListingDraft = {
  title: "",
  propertyType: "RESIDENTIAL_LAND",
  description: "",
  askingPrice: "",
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
  media: [],
  videoUrl: "",
};

export type DraftErrors = Partial<Record<string, string>>;

/* ------------------------- validation limits ------------------------- */
// Kept in sync with the API's CreatePropertyInput DTO
// (apps/api/src/modules/rest/properties/dto/create-property.input.ts) so the
// wizard never submits values the server would reject with a 400.
export const TITLE_MIN = 5;
/** Stricter than the API's 200 — short titles scan better in the feed. */
export const TITLE_MAX = 80;
/** Matches the DTO's @MaxLength(5000) on description. */
export const DESC_MAX = 5000;
/** Sanity cap for the optional road-access width. */
export const ROAD_WIDTH_MAX_FT = 200;

const num = (s: string | undefined): number => {
  const n = Number((s ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/** Total land area in sq ft from the active unit system. */
export function totalSqFt(draft: ListingDraft): number {
  const u = draft.units;
  if (draft.unitSystem === "ROPANI") {
    const totalAana =
      num(u.ropani) * 16 + num(u.aana) + num(u.paisa) / 4 + num(u.daam) / 16;
    return Math.round(totalAana * 342.25);
  }
  const totalKatha = num(u.bigha) * 20 + num(u.katha) + num(u.dhur) / 20;
  return Math.round(totalKatha * 364.5);
}

export function askingPriceNumber(draft: ListingDraft): number {
  return num(draft.askingPrice);
}

/** Human land-area summary for previews, e.g. "4 Aana" or "1 Kattha 5 Dhur". */
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

/** Per-step field validation. Returns {} when the step is complete. */
export function validateStep(step: number, draft: ListingDraft): DraftErrors {
  const errors: DraftErrors = {};

  if (step === 0) {
    const title = draft.title.trim();
    if (title.length < TITLE_MIN)
      errors.title = `Give the listing at least ${TITLE_MIN} characters.`;
    else if (title.length > TITLE_MAX)
      errors.title = `Keep the title under ${TITLE_MAX} characters.`;
    if (!draft.propertyType) errors.propertyType = "Pick a property type.";
    if (draft.description.trim().length > DESC_MAX)
      errors.description = `Keep the description under ${DESC_MAX.toLocaleString()} characters.`;
    if (askingPriceNumber(draft) <= 0)
      errors.askingPrice = "Enter the asking price in NPR.";
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
    if (totalSqFt(draft) <= 0) {
      errors.units = "Enter the land area in your chosen unit system.";
    } else if (draft.unitSystem === "ROPANI") {
      // 1 ropani = 16 aana = 64 paisa = 256 daam — a sub-unit at or above its
      // parent unit means the area math silently double-counts.
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

    const roadWidth = num(draft.roadWidthFt);
    if (
      draft.roadWidthFt.trim() !== "" &&
      (roadWidth <= 0 || roadWidth > ROAD_WIDTH_MAX_FT)
    )
      errors.roadWidthFt = `Road width must be between 1 and ${ROAD_WIDTH_MAX_FT} ft.`;
  }

  return errors;
}

/** Every step-pair that must validate before the listing can be submitted. */
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

/**
 * The POST /api/v1/properties body. Kept structural (strings for enums) so
 * the client package stays free of Prisma imports; the API validates them.
 */
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

  // Price/aana is only meaningful in the Ropani system.
  let pricePerAana: number | undefined;
  if (draft.unitSystem === "ROPANI") {
    const totalAana =
      num(u.ropani) * 16 + num(u.aana) + num(u.paisa) / 4 + num(u.daam) / 16;
    if (totalAana > 0) pricePerAana = Math.round(askingPrice / totalAana);
  }

  // Assemble media: uploaded gallery (first = cover) then any video walkthrough.
  const media: NonNullable<CreatePropertyPayload["media"]> = [];
  draft.media.forEach((m, index) => {
    media.push({
      type: m.type ?? "IMAGE",
      url: m.url,
      ...(m.altText && { altText: m.altText }),
      sortOrder: index,
      isCover: index === 0,
    });
  });
  const video = draft.videoUrl.trim();
  if (video) {
    media.push({
      type: "VIDEO_WALKTHROUGH",
      url: video,
      sortOrder: media.length,
    });
  }

  return {
    title: draft.title.trim(),
    ...(draft.description.trim() && { description: draft.description.trim() }),
    propertyType: draft.propertyType,
    askingPrice,
    ...(pricePerAana && { pricePerAana }),
    ...(num(draft.roadWidthFt) > 0 && { roadAccessWidthFt: num(draft.roadWidthFt) }),
    ...(draft.roadType && { roadType: draft.roadType }),
    ...(draft.facing && { facing: draft.facing }),
    isCornerPlot: draft.isCornerPlot,
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
    ...(media.length > 0 && { media }),
  };
}
