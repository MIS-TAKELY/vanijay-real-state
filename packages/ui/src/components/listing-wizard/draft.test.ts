/**
 * Standalone verification of price-per-unit conversion logic + per-type
 * Step 3 validation.
 * Run: tsx packages/ui/src/components/listing-wizard/draft.test.ts
 */

import {
  INITIAL_DRAFT,
  buildCreatePayload,
  builtUpAreaNumber,
  hasPricingArea,
  landAreaSqFtExact,
  listingDraftFromApiProperty,
  priceContextFromDraft,
  pricePerUnit as realPricePerUnit,
  pricePerUnitFor,
  priceUnitKey,
  priceUnitRates,
  validateStep,
  type ListingDraft,
  type PriceContext,
  type WizardProperty,
} from "./draft";
import {
  clearWizardDraft,
  loadWizardDraft,
  saveWizardDraft,
  type WizardDraftStorage,
} from "./draft-storage";

const PRICE_UNITS = [
  { key: "ropani", label: "Ropani", sqFt: 342.25 * 16 },
  { key: "aana", label: "Aana", sqFt: 342.25 },
  { key: "paisa", label: "Paisa", sqFt: 342.25 / 4 },
  { key: "daam", label: "Daam", sqFt: 342.25 / 16 },
  { key: "bigha", label: "Bigha", sqFt: 364.5 * 20 },
  { key: "katha", label: "Katha", sqFt: 364.5 },
  { key: "dhur", label: "Dhur", sqFt: 364.5 / 20 },
] as const;

type UnitSystem = "ROPANI" | "BIGHA";
interface DraftLike {
  unitSystem: UnitSystem;
  units: Record<string, string>;
  askingPrice: string;
}

const num = (s: string | undefined): number => {
  const n = Number((s ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

function totalSqFtExact(draft: DraftLike): number {
  const u = draft.units;
  if (draft.unitSystem === "ROPANI") {
    const totalAana =
      num(u.ropani) * 16 + num(u.aana) + num(u.paisa) / 4 + num(u.daam) / 16;
    return totalAana * 342.25;
  }
  const totalKatha = num(u.bigha) * 20 + num(u.katha) + num(u.dhur) / 20;
  return totalKatha * 364.5;
}

function totalSqFt(draft: DraftLike): number {
  return Math.round(totalSqFtExact(draft));
}

function askingPriceNumber(draft: DraftLike): number {
  return num(draft.askingPrice);
}

function pricePerUnit(draft: DraftLike, unitKey: string): number | null {
  const sqft = totalSqFtExact(draft);
  const price = askingPriceNumber(draft);
  if (sqft <= 0 || price <= 0) return null;
  const unit = PRICE_UNITS.find((u) => u.key === unitKey);
  if (!unit) return null;
  return (price / sqft) * unit.sqFt;
}

let passed = 0;
let failed = 0;
function assert(
  name: string,
  actual: unknown,
  expected: unknown,
  tolerance = 0.01,
) {
  const isNum = typeof actual === "number" && typeof expected === "number";
  const ok = isNum
    ? Math.abs(actual - expected) < tolerance
    : actual === expected;
  if (ok) {
    console.log("  ✅ " + name);
    passed++;
  } else {
    console.error(
      "  ❌ " + name + ": expected " + expected + ", got " + actual,
    );
    failed++;
  }
}

console.log("\n📐 Area calculation tests");
assert(
  "1 ropani = 5476 sq ft",
  totalSqFt({ unitSystem: "ROPANI", units: { ropani: "1" }, askingPrice: "" }),
  5476,
);
assert(
  "1 aana = 342 sq ft (rounded)",
  totalSqFt({ unitSystem: "ROPANI", units: { aana: "1" }, askingPrice: "" }),
  342,
);
assert(
  "1 daam ≈ 21 sq ft (rounded)",
  totalSqFt({ unitSystem: "ROPANI", units: { daam: "1" }, askingPrice: "" }),
  21,
);
assert(
  "Composite ropani area",
  totalSqFt({
    unitSystem: "ROPANI",
    units: { ropani: "2", aana: "4", paisa: "2", daam: "8" },
    askingPrice: "",
  }),
  12663,
);
assert(
  "1 bigha = 7290 sq ft",
  totalSqFt({ unitSystem: "BIGHA", units: { bigha: "1" }, askingPrice: "" }),
  7290,
);
assert(
  "1 katha ≈ 365 sq ft",
  totalSqFt({ unitSystem: "BIGHA", units: { katha: "1" }, askingPrice: "" }),
  365,
);
assert(
  "1 dhur ≈ 18 sq ft",
  totalSqFt({ unitSystem: "BIGHA", units: { dhur: "1" }, askingPrice: "" }),
  18,
);

console.log("\n💰 Price-per-unit conversion tests");
const oneAana: DraftLike = {
  unitSystem: "ROPANI",
  units: { aana: "1" },
  askingPrice: "342250",
};
assert("Per aana (1 aana land)", pricePerUnit(oneAana, "aana"), 342250);
assert(
  "Per ropani (1 aana land)",
  pricePerUnit(oneAana, "ropani"),
  342250 * 16,
);
assert("Per paisa (1 aana land)", pricePerUnit(oneAana, "paisa"), 342250 / 4);
assert("Per daam (1 aana land)", pricePerUnit(oneAana, "daam"), 342250 / 16);

const oneBigha: DraftLike = {
  unitSystem: "BIGHA",
  units: { bigha: "1" },
  askingPrice: "7290000",
};
assert("Per bigha (1 bigha land)", pricePerUnit(oneBigha, "bigha"), 7290000);
assert(
  "Per katha (1 bigha land)",
  pricePerUnit(oneBigha, "katha"),
  7290000 / 20,
);
assert(
  "Per dhur (1 bigha land)",
  pricePerUnit(oneBigha, "dhur"),
  7290000 / 400,
);

assert(
  "Null when no area",
  pricePerUnit(
    { unitSystem: "ROPANI", units: {}, askingPrice: "1000" },
    "aana",
  ),
  null,
);
assert(
  "Null when no price",
  pricePerUnit(
    { unitSystem: "ROPANI", units: { aana: "1" }, askingPrice: "" },
    "aana",
  ),
  null,
);
assert(
  "Null when zero price",
  pricePerUnit(
    { unitSystem: "ROPANI", units: { aana: "1" }, askingPrice: "0" },
    "aana",
  ),
  null,
);

const realistic: DraftLike = {
  unitSystem: "ROPANI",
  units: { ropani: "3", aana: "8" },
  askingPrice: "24500000",
};
assert(
  "Realistic per aana = 437500",
  pricePerUnit(realistic, "aana") ?? 0,
  437500,
  0.01,
);
assert(
  "Realistic per ropani = 7000000",
  pricePerUnit(realistic, "ropani") ?? 0,
  7000000,
  0.01,
);

console.log("\n♻️ Shared PriceContext conversion (reused by the /slug page)");

// The exact (unrounded) area must reproduce the asking price as the per-dhur
// rate — the old /slug page divided by the rounded totalSqFt (18 vs the true
// 18.225), skewing the rate for small parcels.
const oneDhur: PriceContext = {
  subCategory: "RESIDENTIAL_LAND",
  unitSystem: "BIGHA",
  landParts: { dhur: 1 },
  askingPrice: 123456789,
};
assert(
  "1 dhur exact area = 18.225 sq ft",
  landAreaSqFtExact(oneDhur.landParts, "BIGHA"),
  18.225,
  1e-9,
);
assert(
  "Per dhur = asking price (exact area, no rounding skew)",
  pricePerUnitFor(oneDhur, "dhur"),
  123456789,
);
assert("Default unit for BIGHA land = katha", priceUnitKey(oneDhur), "katha");
assert("hasPricingArea true with area", hasPricingArea(oneDhur), true);
assert(
  "Rates cover every PRICE_UNITS key",
  priceUnitRates(oneDhur).dhur,
  123456789,
);

const noArea: PriceContext = {
  subCategory: "RESIDENTIAL_LAND",
  unitSystem: "ROPANI",
  landParts: {},
  askingPrice: 1000,
};
assert("No area → null rate", pricePerUnitFor(noArea, "aana"), null);
assert("No area → hasPricingArea false", hasPricingArea(noArea), false);
assert("Default unit for ROPANI land = aana", priceUnitKey(noArea), "aana");

// Building types price per sq.ft of built-up area (falling back to land).
const houseCtx: PriceContext = {
  subCategory: "HOUSE",
  unitSystem: "ROPANI",
  landParts: { aana: 1 },
  builtUpAreaSqFt: 2400,
  askingPrice: 48000000,
};
assert("Building default unit = sqft", priceUnitKey(houseCtx), "sqft");
assert(
  "Building per sq.ft of built-up area",
  pricePerUnitFor(houseCtx, "sqft"),
  20000,
);
assert(
  "Building per sq.m",
  pricePerUnitFor(houseCtx, "sqm") ?? 0,
  20000 / 0.092903,
  1,
);

// The wizard draft and the PriceContext adapter agree on identical inputs.
const houseDraftCtx: ListingDraft = {
  ...INITIAL_DRAFT,
  mainCategory: "RESIDENTIAL",
  subCategory: "HOUSE",
  builtUpAreaSqFt: "2400",
  askingPrice: "48000000",
};
assert(
  "priceContextFromDraft matches draft pricePerUnit",
  pricePerUnitFor(priceContextFromDraft(houseDraftCtx), "sqft"),
  realPricePerUnit(houseDraftCtx, "sqft"),
);

console.log("\n🔄 Round-trip consistency check");
const testDraft: DraftLike = {
  unitSystem: "ROPANI",
  units: { ropani: "2", aana: "6", paisa: "3", daam: "5" },
  askingPrice: "18500000",
};
const exactSqFt = totalSqFtExact(testDraft);
for (const u of PRICE_UNITS) {
  const rate = pricePerUnit(testDraft, u.key);
  if (rate == null) continue;
  const reconstructed = rate * (exactSqFt / u.sqFt);
  assert("Round-trip via " + u.key, reconstructed, 18500000, 0.01);
}

console.log(
  "\n🏠 Building-type pricing + per-type validation tests (real draft.ts)",
);

// Built-up area drives price-per-unit for building types.
const houseBase: ListingDraft = {
  ...INITIAL_DRAFT,
  mainCategory: "RESIDENTIAL",
  subCategory: "HOUSE",
  builtUpAreaSqFt: "2400",
  askingPrice: "48000000",
};
assert("builtUpAreaNumber parses input", builtUpAreaNumber(houseBase), 2400);
assert(
  "House priced per sq.ft of built-up area",
  realPricePerUnit(houseBase, "sqft"),
  20000,
);
assert(
  "House per sq.m",
  realPricePerUnit(houseBase, "sqm") ?? 0,
  20000 / 0.092903,
  1,
);

// Land types keep pricing off the land area even when built-up area is set.
const landWithBuiltUp: ListingDraft = {
  ...INITIAL_DRAFT,
  mainCategory: "LAND",
  subCategory: "RESIDENTIAL_LAND",
  units: { aana: "1" },
  askingPrice: "342250",
  builtUpAreaSqFt: "2400",
};
assert(
  "Land type still prices per land area",
  realPricePerUnit(landWithBuiltUp, "aana"),
  342250,
);

// Per-type required-field validation.
const houseNoBuiltUp: ListingDraft = {
  ...INITIAL_DRAFT,
  mainCategory: "RESIDENTIAL",
  subCategory: "HOUSE",
  askingPrice: "1000",
};
assert(
  "House requires built-up area",
  "builtUpAreaSqFt" in validateStep(2, houseNoBuiltUp),
  true,
);

const houseNoLand: ListingDraft = {
  ...INITIAL_DRAFT,
  mainCategory: "RESIDENTIAL",
  subCategory: "HOUSE",
  builtUpAreaSqFt: "1200",
  askingPrice: "1000",
};
assert(
  "House without land does not require land area",
  !("units" in validateStep(2, houseNoLand)),
  true,
);

const apartmentNoFloor: ListingDraft = {
  ...INITIAL_DRAFT,
  mainCategory: "RESIDENTIAL",
  subCategory: "APARTMENT_FLAT",
  builtUpAreaSqFt: "1200",
  askingPrice: "1000",
};
assert(
  "Apartment requires floor number",
  "floorNumber" in validateStep(2, apartmentNoFloor),
  true,
);
const apartmentWithFloor: ListingDraft = {
  ...apartmentNoFloor,
  floorNumber: "4",
};
assert(
  "Apartment with floor number passes",
  !("floorNumber" in validateStep(2, apartmentWithFloor)),
  true,
);

const commercialLandNoFrontage: ListingDraft = {
  ...INITIAL_DRAFT,
  mainCategory: "LAND",
  subCategory: "COMMERCIAL_LAND",
  units: { aana: "1" },
  askingPrice: "1000",
};
assert(
  "Commercial land requires frontage",
  "frontageFt" in validateStep(2, commercialLandNoFrontage),
  true,
);
const commercialLandWithFrontage: ListingDraft = {
  ...commercialLandNoFrontage,
  frontageFt: "60",
};
assert(
  "Commercial land with frontage passes",
  !("frontageFt" in validateStep(2, commercialLandWithFrontage)),
  true,
);

const commercialSpaceNoArea: ListingDraft = {
  ...INITIAL_DRAFT,
  mainCategory: "COMMERCIAL",
  subCategory: "OFFICE",
  frontageFt: "30",
  askingPrice: "1000",
};
assert(
  "Commercial space requires built-up area",
  "builtUpAreaSqFt" in validateStep(2, commercialSpaceNoArea),
  true,
);
const commercialSpaceOk: ListingDraft = {
  ...commercialSpaceNoArea,
  builtUpAreaSqFt: "1800",
};
assert(
  "Commercial space with area + frontage passes",
  !("builtUpAreaSqFt" in validateStep(2, commercialSpaceOk)) &&
    !("frontageFt" in validateStep(2, commercialSpaceOk)),
  true,
);

// Land types still require land area.
const emptyLand: ListingDraft = {
  ...INITIAL_DRAFT,
  mainCategory: "LAND",
  subCategory: "AGRICULTURAL_LAND",
  askingPrice: "1000",
};
assert(
  "Land types still require land area",
  "units" in validateStep(2, emptyLand),
  true,
);

console.log("\n📦 Payload wiring (buildCreatePayload) tests");

const houseDraft: ListingDraft = {
  ...INITIAL_DRAFT,
  mainCategory: "RESIDENTIAL",
  subCategory: "HOUSE",
  builtUpAreaSqFt: "2400",
  propertySubtype: "APARTMENT",
  floorNumber: "4",
  bedrooms: "3",
  bathrooms: "2",
  amenities: ["GARDEN", "ELEVATOR"],
  landClearance: true,
  askingPrice: "48000000",
  units: { aana: "4" },
};
const housePayload = buildCreatePayload(houseDraft);
assert("Payload carries built-up area", housePayload.builtUpAreaSqFt, 2400);
assert("Payload carries subtype", housePayload.propertySubtype, "APARTMENT");
assert("Payload carries floor number", housePayload.floorNumber, 4);
assert("Payload carries bedrooms", housePayload.bedrooms, 3);
assert(
  "Payload carries amenities",
  JSON.stringify(housePayload.amenities),
  JSON.stringify(["GARDEN", "ELEVATOR"]),
);
assert("Payload carries landClearance", housePayload.landClearance, true);
assert("Empty string field becomes null", housePayload.parking, null);
assert(
  "Empty boolean defaults false",
  housePayload.electricityAvailable,
  false,
);

// Per-aana pricing is land-only: a building (even one with a land parcel)
// must never carry a pricePerAana — it would show a bogus rate on the listing
// page (e.g. NPR 19,753,072 / Aana for a 1-paisa parcel under a 12-lakh flat).
assert(
  "Apartment with land parcel sends null pricePerAana",
  housePayload.pricePerAana,
  null,
);
const tinyParcelApartment: ListingDraft = {
  ...INITIAL_DRAFT,
  mainCategory: "RESIDENTIAL",
  subCategory: "HOUSE",
  propertySubtype: "APARTMENT",
  builtUpAreaSqFt: "900",
  askingPrice: "1234567",
  units: { paisa: "1" }, // 0.0625 aana
};
const tinyPayload = buildCreatePayload(tinyParcelApartment);
assert(
  "Apartment with tiny parcel → no per-aana rate",
  tinyPayload.pricePerAana,
  null,
);

// Clearing a field on edit sends null so the DB resets instead of keeping the old value.
const cleared: ListingDraft = {
  ...houseDraft,
  bedrooms: "",
  amenities: [],
  floorNumber: "",
};
const clearedPayload = buildCreatePayload(cleared);
assert("Cleared number field becomes null", clearedPayload.bedrooms, null);
assert(
  "Cleared array becomes []",
  JSON.stringify(clearedPayload.amenities),
  JSON.stringify([]),
);
assert("Cleared floor number becomes null", clearedPayload.floorNumber, null);

// Land types send the building spec fields as null/[]/false (harmless defaults).
const landPayload = buildCreatePayload({
  ...INITIAL_DRAFT,
  mainCategory: "LAND",
  subCategory: "RESIDENTIAL_LAND",
  units: { aana: "1" },
  askingPrice: "1000",
});
assert(
  "Land payload still prices per land area",
  landPayload.pricePerAana,
  1000,
);
assert(
  "Land payload has null built-up area",
  landPayload.builtUpAreaSqFt,
  null,
);

console.log("\n🔁 Round-trip hydration (listingDraftFromApiProperty) tests");

const apiRecord: WizardProperty = {
  title: "Modern Apartment",
  mainCategory: "RESIDENTIAL",
  subCategory: "HOUSE",
  askingPrice: 48000000,
  isCornerPlot: false,
  builtUpAreaSqFt: 2400,
  bedrooms: 3,
  amenities: ["GARDEN"],
  landClearance: true,
  waterSources: [],
  location: {
    province: "Bagmati",
    district: "Kathmandu",
    municipality: "Kathmandu Metropolitan",
    wardNumber: 4,
    areaName: "Thamel",
  },
  landArea: {
    ropani: 1,
    aana: 0,
    paisa: 0,
    daam: 0,
    totalSqFt: 5476,
    totalSqMeters: 508.74,
  },
};
const roundTrip = listingDraftFromApiProperty(apiRecord);
assert(
  "Hydrate built-up area back to string",
  roundTrip.builtUpAreaSqFt,
  "2400",
);
assert("Hydrate bedrooms back to string", roundTrip.bedrooms, "3");
assert(
  "Hydrate amenities array",
  JSON.stringify(roundTrip.amenities),
  JSON.stringify(["GARDEN"]),
);
assert("Hydrate booleans", roundTrip.landClearance, true);
assert("Missing fields default to empty", roundTrip.propertySubtype, "");
assert(
  "Missing arrays default to []",
  JSON.stringify(roundTrip.waterSources),
  JSON.stringify([]),
);

console.log("\n💾 Draft persistence (localStorage) tests");

function fakeStorage(): WizardDraftStorage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

const storage = fakeStorage();
const draftToSave: ListingDraft = {
  ...INITIAL_DRAFT,
  mainCategory: "COMMERCIAL",
  subCategory: "OFFICE",
  title: "Storefront in Baluwatar",
  builtUpAreaSqFt: "1800",
  amenities: ["CCTV"],
};
saveWizardDraft(draftToSave, 2, storage);
const loaded = loadWizardDraft(storage);
assert(
  "Round-trip restores draft",
  loaded != null &&
    JSON.stringify(loaded.draft) === JSON.stringify(draftToSave),
  true,
);
assert("Round-trip restores step", loaded?.step, 2);
assert("Empty storage -> null", loadWizardDraft(fakeStorage()), null);

const bad = fakeStorage();
bad.setItem("lekha.wizard.draft.v1", "not json");
assert("Corrupt JSON -> null", loadWizardDraft(bad), null);
bad.setItem(
  "lekha.wizard.draft.v1",
  JSON.stringify({ version: 99, step: 1, draft: {} }),
);
assert("Wrong version -> null", loadWizardDraft(bad), null);
bad.setItem(
  "lekha.wizard.draft.v1",
  JSON.stringify({ version: 1, step: "two", draft: INITIAL_DRAFT }),
);
assert("Bad step type -> null", loadWizardDraft(bad), null);
bad.setItem(
  "lekha.wizard.draft.v1",
  JSON.stringify({ version: 1, step: 1, draft: { title: 42 } }),
);
assert("Non-draft shape -> null", loadWizardDraft(bad), null);

clearWizardDraft(storage);
assert("clear removes the draft", loadWizardDraft(storage), null);
assert("null storage load -> null", loadWizardDraft(null), null);
saveWizardDraft(draftToSave, 1, null);
clearWizardDraft(null);
assert("null storage save/clear no-op", true, true);

console.log("\n" + "═".repeat(50));
console.log("Results: " + passed + " passed, " + failed + " failed");
if (failed > 0) process.exit(1);
console.log("All price conversion tests passed! ✅\n");
