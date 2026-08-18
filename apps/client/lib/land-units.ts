/**
 * Land unit conversion — single source of truth for the /convertor tool.
 *
 * Every factor is expressed in SQUARE FEET and mirrors the exact constants the
 * rest of MALPOTH already uses (listing wizard `PRICE_UNITS`, search filters):
 *
 *   • 1 aana        = 342.25  sq ft        (authoritative codebase value)
 *   • 1 ropani      = 16 aana = 5,476     sq ft
 *   • 1 paisa       = 1/4   aana           (aana / 4)
 *   • 1 daam        = 1/16  aana           (aana / 16)
 *   • 1 katha       = 364.5  sq ft        (authoritative codebase value)
 *   • 1 bigha       = 20  katha = 7,290   sq ft
 *   • 1 dhur        = 1/20 katha           (katha / 20)
 *   • 1 sq. m       = 1 / 0.092903 sq ft   (authoritative codebase value)
 *   • 1 sq. yd      = 9            sq ft   (3 ft × 3 ft, exact)
 *   • 1 acre        = 43,560      sq ft   (international, exact)
 *   • 1 hectare     = 10,000 sq. m         (derived from the sq. m factor)
 *   • 1 km²         = 1,000,000 sq. m      (derived from the sq. m factor)
 *
 * Deriving hectare/km² from the codebase's sq. m factor (instead of an
 * independent rounding) keeps every unit on the same basis, so round-trips
 * (e.g. hectare → sq. m) are exact to the displayed precision.
 */

export type UnitGroup = "nepali-ropani" | "nepali-bigha" | "international";

export type UnitKey =
  | "ropani"
  | "aana"
  | "paisa"
  | "daam"
  | "bigha"
  | "katha"
  | "dhur"
  | "sqft"
  | "sqm"
  | "sqyd"
  | "acre"
  | "hectare"
  | "sqkm";

export interface LandUnit {
  key: UnitKey;
  /** Compact display label, e.g. "Sq. ft". */
  label: string;
  /** Full human name, e.g. "Square Foot". */
  full: string;
  group: UnitGroup;
  /** Square feet per single unit. */
  sqFt: number;
  /** Squares of this unit in one of the common parent units (FAQ copy). */
  per?: { parent: UnitKey; value: number };
}

const SQM_SQFT = 1 / 0.092903; // authoritative factor used across the app

export const LAND_UNITS: LandUnit[] = [
  /* ── Nepali Ropani system (hilly regions) ────────────────────────── */
  {
    key: "ropani",
    label: "Ropani",
    full: "Ropani",
    group: "nepali-ropani",
    sqFt: 342.25 * 16,
    per: { parent: "aana", value: 16 },
  },
  {
    key: "aana",
    label: "Aana",
    full: "Aana",
    group: "nepali-ropani",
    sqFt: 342.25,
    per: { parent: "sqft", value: 342.25 },
  },
  {
    key: "paisa",
    label: "Paisa",
    full: "Paisa",
    group: "nepali-ropani",
    sqFt: 342.25 / 4,
    per: { parent: "aana", value: 4 },
  },
  {
    key: "daam",
    label: "Daam",
    full: "Daam",
    group: "nepali-ropani",
    sqFt: 342.25 / 16,
    per: { parent: "aana", value: 16 },
  },

  /* ── Nepali Bigha system (Terai flats) ───────────────────────────── */
  {
    key: "bigha",
    label: "Bigha",
    full: "Bigha",
    group: "nepali-bigha",
    sqFt: 364.5 * 20,
    per: { parent: "katha", value: 20 },
  },
  {
    key: "katha",
    label: "Katha",
    full: "Katha",
    group: "nepali-bigha",
    sqFt: 364.5,
    per: { parent: "sqft", value: 364.5 },
  },
  {
    key: "dhur",
    label: "Dhur",
    full: "Dhur",
    group: "nepali-bigha",
    sqFt: 364.5 / 20,
    per: { parent: "katha", value: 20 },
  },

  /* ── International ───────────────────────────────────────────────── */
  {
    key: "sqft",
    label: "Sq. ft",
    full: "Square Foot",
    group: "international",
    sqFt: 1,
  },
  {
    key: "sqm",
    label: "Sq. m",
    full: "Square Meter",
    group: "international",
    sqFt: SQM_SQFT,
  },
  {
    key: "sqyd",
    label: "Sq. yd",
    full: "Square Yard",
    group: "international",
    sqFt: 9,
  },
  {
    key: "acre",
    label: "Acre",
    full: "Acre",
    group: "international",
    sqFt: 43_560,
  },
  {
    key: "hectare",
    label: "Hectare",
    full: "Hectare",
    group: "international",
    sqFt: SQM_SQFT * 10_000,
  },
  {
    key: "sqkm",
    label: "Km²",
    full: "Square Kilometer",
    group: "international",
    sqFt: SQM_SQFT * 1_000_000,
  },
];

export const GROUP_LABELS: Record<UnitGroup, string> = {
  "nepali-ropani": "Nepali — Ropani (hill)",
  "nepali-bigha": "Nepali — Bigha (Terai)",
  international: "International",
};

/** Short labels for the traditional Nepali compound-unit systems. */
export const SYSTEM_LABELS: Record<UnitSystem, string> = {
  ROPANI: "Ropani",
  BIGHA: "Bigha",
};

const BY_KEY = new Map(LAND_UNITS.map((u) => [u.key, u]));

function unitSqFt(key: UnitKey): number {
  return BY_KEY.get(key)?.sqFt ?? 1;
}

/**
 * Convert `value` from `from` into `to`. Uses the ratio of the two sq-ft
 * factors so exact relationships (e.g. aana → paisa ×4) stay exact.
 * Returns NaN when the input is not a finite number.
 */
export function convertLand(value: number, from: UnitKey, to: UnitKey): number {
  if (!Number.isFinite(value)) return NaN;
  const ratio = unitSqFt(from) / unitSqFt(to);
  return value * ratio;
}

/** Parse a raw input string into a number (NaN when empty/invalid). */
export function parseLandInput(text: string): number {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return NaN;
  // Allow simple numeric input; strip thousands separators.
  const normalized = trimmed.replace(/,/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Format a number for display with up to 10 significant digits and thousands
 * separators. Trailing zeros are trimmed so exact values import cleanly
 * (5,476 not 5,476.0000). Returns "" for NaN (empty input).
 */
export function formatLandNumber(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "0";

  const abs = Math.abs(value);
  const integerDigits = Math.floor(Math.log10(abs)) + 1;
  // Keep ~10 significant digits; never more than 10 fractional digits.
  const decimals = Math.max(0, Math.min(10, 10 - integerDigits));

  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(rounded);
}

/** Row used by the "same area in every unit" quick-reference table. */
export interface LandUnitValue {
  unit: LandUnit;
  value: number;
}

/** The given sq-ft amount expressed in every supported unit. */
export function landValuesFromSqFt(sqFt: number): LandUnitValue[] {
  return LAND_UNITS.map((u) => ({
    unit: u,
    value: convertLand(sqFt, "sqft", u.key),
  }));
}

/** Common "1 X = Y" facts shown as quick chips — derived from the table. */
export const QUICK_FACTS: Array<{ from: UnitKey; to: UnitKey }> = [
  { from: "ropani", to: "aana" },
  { from: "aana", to: "sqft" },
  { from: "aana", to: "paisa" },
  { from: "katha", to: "sqft" },
  { from: "bigha", to: "katha" },
  { from: "dhur", to: "sqft" },
  { from: "sqm", to: "sqft" },
  { from: "hectare", to: "acre" },
];

/* ------------------------------------------------------------------ */
/*  Composite Nepali land (multi-part entry)                           */
/* ------------------------------------------------------------------ */

export type UnitSystem = "ROPANI" | "BIGHA";

export type LandPartKey =
  | "ropani"
  | "aana"
  | "paisa"
  | "daam"
  | "bigha"
  | "katha"
  | "dhur";

/** Units belonging to the Ropani–Aana–Paisa–Daam system (hill regions). */
export const ROPANI_SYSTEM: LandPartKey[] = ["ropani", "aana", "paisa", "daam"];

/** Units belonging to the Bigha–Katha–Dhur system (Terai flats). */
export const BIGHA_SYSTEM: LandPartKey[] = ["bigha", "katha", "dhur"];

/** Whether a unit belongs to either traditional Nepali system. */
export const isNepaliUnit = (unit: UnitKey): boolean =>
  ROPANI_SYSTEM.includes(unit as LandPartKey) ||
  BIGHA_SYSTEM.includes(unit as LandPartKey);

/** The traditional system a unit belongs to (Bigha wins for its units). */
export function systemOf(unit: UnitKey): UnitSystem {
  return BIGHA_SYSTEM.includes(unit as LandPartKey) ? "BIGHA" : "ROPANI";
}

/** Short labels for the composite part fields. */
export const PART_LABELS: Record<LandPartKey, string> = {
  ropani: "Ropani",
  aana: "Aana",
  paisa: "Paisa",
  daam: "Daam",
  bigha: "Bigha",
  katha: "Katha",
  dhur: "Dhur",
};

/** A set of composite land parts (numbers; omitted parts count as 0). */
export type LandParts = Partial<Record<LandPartKey, number>>;

/**
 * Exact total area (sq ft) of a composite land entry. Mirrors the listing
 * wizard's `landAreaSqFtExact` math — 1 aana = 342.25 sq ft and 1 katha =
 * 364.5 sq ft — so totals always agree with MALPOTH pricing. Fractions are
 * allowed (e.g. 0.5 Aana) and count exactly as entered.
 */
export function partsToSqFt(parts: LandParts): number {
  const totalAana =
    (parts.ropani ?? 0) * 16 +
    (parts.aana ?? 0) +
    (parts.paisa ?? 0) / 4 +
    (parts.daam ?? 0) / 16;
  const totalKatha =
    (parts.bigha ?? 0) * 20 +
    (parts.katha ?? 0) +
    (parts.dhur ?? 0) / 20;
  return totalAana * 342.25 + totalKatha * 364.5;
}

/**
 * Break an area (sq ft) into normalized composite parts for the given system.
 * e.g. 32 Aana of area → 2 Ropani; 5,476 sq ft → 1 Ropani 0 Aana 0 Paisa 0 Daam.
 */
export function decomposeSqFtToParts(
  sqFt: number,
  system: UnitSystem,
): LandParts {
  if (!Number.isFinite(sqFt) || sqFt < 0) {
    return system === "BIGHA"
      ? { bigha: 0, katha: 0, dhur: 0 }
      : { ropani: 0, aana: 0, paisa: 0, daam: 0 };
  }
  if (system === "BIGHA") {
    const totalKatha = sqFt / 364.5;
    const bigha = Math.floor(totalKatha / 20);
    const katha = Math.floor(totalKatha - bigha * 20);
    const dhur = Math.round((totalKatha - bigha * 20 - katha) * 20 * 1e4) / 1e4;
    return { bigha, katha, dhur };
  }
  const totalAana = sqFt / 342.25;
  const ropani = Math.floor(totalAana / 16);
  const aana = Math.floor(totalAana - ropani * 16);
  const paisa = Math.floor((totalAana - ropani * 16 - aana) * 4);
  const daam =
    Math.round((totalAana - ropani * 16 - aana - paisa / 4) * 16 * 1e4) / 1e4;
  return { ropani, aana, paisa, daam };
}
