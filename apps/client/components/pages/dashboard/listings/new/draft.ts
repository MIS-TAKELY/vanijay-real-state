import type {
  ApiProperty,
  CreatePropertyPayload,
} from "lib/api/services/properties/types";
import { PRICE_UNITS, type UnitSystem } from "./constants";

export type { CreatePropertyPayload };

export interface DraftMedia {
  url: string;
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

  /* media & documents */
  media: DraftMedia[];
  videoUrl: string;
}

export const INITIAL_DRAFT: ListingDraft = {
  title: "",
  propertyType: "RESIDENTIAL_LAND",
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
  media: [],
  videoUrl: "",
};

export type DraftErrors = Partial<Record<string, string>>;

export const TITLE_MIN = 5;
export const TITLE_MAX = 80;
export const DESC_MAX = 5000;
export const ROAD_WIDTH_MAX_FT = 200;

const num = (s: string | undefined): number => {
  const n = Number((s ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

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

export function pricePerUnit(
  draft: ListingDraft,
  unitKey: string,
): number | null {
  const sqft = totalSqFt(draft);
  const price = askingPriceNumber(draft);

  if (sqft <= 0 || price <= 0) return null;
  const unit = PRICE_UNITS.find((u) => u.key === unitKey);
  if (!unit || unit.sqFt <= 0) return null;
  const totalUnits = sqft / unit.sqFt;
  if (totalUnits <= 0) return null;
  return Math.round(price / totalUnits);
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
    if (!draft.propertyType) errors.propertyType = "Pick a property type.";
    if (draft.description.trim().length > DESC_MAX)
      errors.description = `Keep the description under ${DESC_MAX.toLocaleString()} characters.`;
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
    ...(num(draft.roadWidthFt) > 0 && {
      roadAccessWidthFt: num(draft.roadWidthFt),
    }),
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
    // Always send the media array: on create an empty array simply means "no
    // media", while on update it lets the API replace (or clear) the gallery.
    media,
  };
}

/**
 * Hydrate a create draft from an existing API record (used by the listing
 * wizard's edit mode). The wizard's steps read/write a `ListingDraft`, so this
 * is the bridge that lets "Edit" load the same form a property was created on.
 */
export function listingDraftFromApiProperty(p: ApiProperty): ListingDraft {
  const location = p.location;
  const area = p.landArea;
  const usedBigha = Boolean(area && (area.bigha || area.katha || area.dhur));

  const allMedia = p.media ?? [];

  // The video walkthrough round-trips through the dedicated video field, not
  // the photo gallery.
  const video = allMedia.find((m) => m.type === "VIDEO_WALKTHROUGH");

  // Only genuine gallery images populate the photo uploader. Document /
  // cadastral rows stay out of the gallery entirely — they were never
  // "photos" and showing them there surfaced a phantom extra image on edit.
  // Rows without a type (legacy records created before type was exposed)
  // are kept as photos to avoid dropping real uploads.
  const media: DraftMedia[] = allMedia
    .filter((m) => !m.type || m.type === "IMAGE")
    .map((m) => ({
      url: m.url,
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
    title: p.title,
    propertyType: p.propertyType,
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
    media,
    videoUrl: video?.url ?? "",
  };
}
