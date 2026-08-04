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

export const ROAD_TYPES = ["Pitched", "Gravel", "Paved", "Earthen"];

export const FACING_DIRECTIONS = [
  "North",
  "South",
  "East",
  "West",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
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

export interface ReviewChecklistItem {
  label: string;
  state: "ok" | "warn";
  /** Material-style icon name for the row. */
  icon: string;
}

export const REVIEW_CHECKLIST: ReviewChecklistItem[] = [
  { label: "At least 5 photos uploaded", state: "ok", icon: "photo_camera" },
  { label: "Lalpurja document attached", state: "ok", icon: "verified" },
  { label: "Tax clearance attached", state: "warn", icon: "warning" },
  { label: "Field verification (optional, L3)", state: "warn", icon: "gavel" },
];
