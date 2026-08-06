/**
 * "New Listing" creation wizard constants & mock data (DESIGN.md §5.2.1).
 *
 * Icons reference the shared `@repo/ui` `<Icon>` name registry (Lucide),
 * so every glyph here renders through the same source of truth as the rest of
 * the dashboard. Values mirror the real Prisma enums (`PropertyType`,
 * `PropertyStatus`, `UnitSystem` conventions) used in the app.
 */

/* ---------------------------- wizard steps ---------------------------- */

export interface WizardStep {
  id: string;
  title: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: "basics", title: "Basics" },
  { id: "location", title: "Location" },
  { id: "specs", title: "Land & Specs" },
  { id: "media", title: "Media & Documents" },
  { id: "review", title: "Review & Submit" },
];

/* --------------------------- property types ---------------------------- */

export interface WizardPropertyType {
  key: string;
  label: string;
  /** Material Symbols-style icon name resolved by the shared `Icon`. */
  icon: string;
  desc: string;
}

export const PROPERTY_TYPES: WizardPropertyType[] = [
  { key: "RESIDENTIAL_LAND", label: "Residential Land", icon: "terrain", desc: "Plots for homes" },
  { key: "COMMERCIAL_LAND", label: "Commercial Land", icon: "storefront", desc: "Business-zone plots" },
  { key: "AGRICULTURAL_LAND", label: "Agricultural Land", icon: "agriculture", desc: "Farmland & orchards" },
  { key: "RESIDENTIAL_HOUSE", label: "Residential House", icon: "home", desc: "Homes & apartments" },
  { key: "COMMERCIAL_SPACE", label: "Commercial Space", icon: "apartment", desc: "Shops & offices" },
  { key: "HERITAGE_HOME", label: "Heritage Home", icon: "article", desc: "Traditional property" },
];

/* ------------------------------ land units ----------------------------- */

export type UnitSystem = "ROPANI" | "BIGHA";

export interface UnitPart {
  key: string;
  unit: string;
}

/** Ropani-Aana-Paisa-Daam system (hilly regions). */
export const ROPANI_PARTS: UnitPart[] = [
  { key: "ropani", unit: "Ropani" },
  { key: "aana", unit: "Aana" },
  { key: "paisa", unit: "Paisa" },
  { key: "daam", unit: "Daam" },
];

/** Bigha-Katha-Dhur system (Terai flats). */
export const BIGHA_PARTS: UnitPart[] = [
  { key: "bigha", unit: "Bigha" },
  { key: "katha", unit: "Katha" },
  { key: "dhur", unit: "Dhur" },
];

export const UNIT_SYSTEMS: { key: UnitSystem; label: string }[] = [
  { key: "ROPANI", label: "Ropani / Aana" },
  { key: "BIGHA", label: "Bigha / Katha" },
];

/* ------------------------------- road / facing ------------------------- */

/**
 * `value` is the exact Prisma enum member sent to the API; `label` is what
 * the user sees. Keep in sync with `enum RoadType` in
 * packages/db/prisma/schema.prisma.
 */
export const ROAD_TYPES = [
  { value: "PITCHED", label: "Pitched" },
  { value: "GRAVEL", label: "Gravel" },
  { value: "SOIL", label: "Earthen" },
  { value: "BLOCK_PAVED", label: "Block paved" },
  { value: "FOOTPATH", label: "Footpath" },
];

/** Matches `enum FacingDirection` in packages/db/prisma/schema.prisma. */
export const FACING_DIRECTIONS = [
  { value: "NORTH", label: "North" },
  { value: "SOUTH", label: "South" },
  { value: "EAST", label: "East" },
  { value: "WEST", label: "West" },
  { value: "NORTH_EAST", label: "North-East" },
  { value: "NORTH_WEST", label: "North-West" },
  { value: "SOUTH_EAST", label: "South-East" },
  { value: "SOUTH_WEST", label: "South-West" },
];

/* ---------------------- cascaded location mock data -------------------- */

export interface Municipality {
  name: string;
  wards: number; // highest ward number
}

export interface District {
  name: string;
  municipalities: Municipality[];
}

export interface Province {
  name: string;
  districts: District[];
}

export const PROVINCES: Province[] = [
  {
    name: "Bagmati",
    districts: [
      {
        name: "Kathmandu",
        municipalities: [
          { name: "Kathmandu Metropolitan", wards: 32 },
          { name: "Kirtipur Municipality", wards: 19 },
        ],
      },
      {
        name: "Lalitpur",
        municipalities: [{ name: "Lalitpur Metropolitan", wards: 29 }],
      },
      {
        name: "Bhaktapur",
        municipalities: [{ name: "Bhaktapur Municipality", wards: 10 }],
      },
    ],
  },
  {
    name: "Gandaki",
    districts: [
      {
        name: "Kaski",
        municipalities: [{ name: "Pokhara Metropolitan", wards: 33 }],
      },
    ],
  },
  {
    name: "Lumbini",
    districts: [
      {
        name: "Rupandehi",
        municipalities: [{ name: "Siddharthanagar Municipality", wards: 13 }],
      },
    ],
  },
];

/* ---------------------------- review checklist ------------------------- */

// (REVIEW_CHECKLIST was static mock data; StepReview now builds the
// checklist dynamically from the actual wizard draft.)
