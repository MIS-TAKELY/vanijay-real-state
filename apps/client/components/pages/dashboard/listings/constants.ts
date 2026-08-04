/**
 * "My Listings" page constants & mock data (DESIGN.md §5.2).
 *
 * Shapes mirror the real API/Prisma enums (see `packages/db/prisma/schema.prisma`
 * and `lib/api/services/properties/types.ts`) so this skeleton can be wired to
 * live data later without reshaping the components. Display helpers
 * (`TYPE_LABELS`, `VERIFICATION_LABELS`, `TYPE_GRADIENTS`, `formatNPR`,
 * `labelEnum`) are reused from the api types — not redefined here.
 */

import {
  FALLBACK_GRADIENT,
  TYPE_GRADIENTS,
} from "lib/api/services/properties/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** A row in the "My Listings" table — ApiProperty + display-only fields. */
export interface MyListing {
  id: string;
  listingCode: string;
  slug: string;
  title: string;
  propertyType: string; // PropertyType enum
  status: ListingStatus; // PropertyStatus enum
  verificationLevel: string; // VerificationStatus enum
  askingPrice: number;
  /** Tailwind gradient classes for the cover thumb (from TYPE_GRADIENTS). */
  gradient: string;
  views: number;
  inquiries: number;
  /** Pre-formatted "Updated" label, rendered mono. */
  updatedAt: string;
}

export type ListingStatus =
  | "DRAFT"
  | "UNDER_VERIFICATION"
  | "LIVE"
  | "SOLD"
  | "ARCHIVED"
  | "REJECTED";

export type ListingFilter =
  | "ALL"
  | "DRAFT"
  | "UNDER_VERIFICATION"
  | "LIVE"
  | "SOLD"
  | "ARCHIVED";

/* ------------------------------------------------------------------ */
/* Filter tabs (§5.2)                                                  */
/* ------------------------------------------------------------------ */

export interface FilterTab {
  key: ListingFilter;
  label: string;
}

export const LISTING_FILTER_TABS: FilterTab[] = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "UNDER_VERIFICATION", label: "Under Verification" },
  { key: "LIVE", label: "Live" },
  { key: "SOLD", label: "Sold" },
  { key: "ARCHIVED", label: "Archived" },
];

/* ------------------------------------------------------------------ */
/* Status chip styles (colors per §1.2 semantics)                      */
/* ------------------------------------------------------------------ */

export interface StatusStyle {
  dot: string;
  chip: string;
  label: string;
}

/** Concrete fallback so `noUncheckedIndexedAccess` lookups stay defined. */
export const DEFAULT_LISTING_STATUS_STYLE: StatusStyle = {
  dot: "bg-on-surface-variant",
  chip: "bg-surface-container-high text-on-surface-variant",
  label: "—",
};

export const LISTING_STATUS_STYLES: Record<ListingStatus, StatusStyle> = {
  DRAFT: {
    dot: "bg-on-surface-variant",
    chip: "bg-surface-container-high text-on-surface-variant",
    label: "Draft",
  },
  UNDER_VERIFICATION: {
    dot: "bg-[#b45309]",
    chip: "bg-[#b45309]/10 text-[#b45309]",
    label: "Under Verification",
  },
  LIVE: {
    dot: "bg-primary",
    chip: "bg-primary/10 text-primary",
    label: "Live",
  },
  SOLD: {
    dot: "bg-primary",
    chip: "bg-primary text-on-primary",
    label: "Sold",
  },
  ARCHIVED: {
    dot: "bg-on-surface-variant",
    chip: "bg-surface-container text-on-surface-variant",
    label: "Archived",
  },
  REJECTED: {
    dot: "bg-tertiary",
    chip: "bg-tertiary/10 text-tertiary",
    label: "Rejected",
  },
};

/* ------------------------------------------------------------------ */
/* Verification stamp styles                                           */
/* ------------------------------------------------------------------ */

export const VERIFICATION_STAMP_LABELS: Record<string, string> = {
  UNVERIFIED: "Unverified",
  LEVEL_1_BASIC: "L1",
  LEVEL_2_DOC_VERIFIED: "L2",
  LEVEL_3_FIELD_VERIFIED: "L3",
  REJECTED: "Rejected",
};

/* ------------------------------------------------------------------ */
/* Row menu actions (§5.2 `...` menu)                                  */
/* ------------------------------------------------------------------ */

export interface ListingMenuItem {
  /** Material Symbols icon name. */
  icon: string;
  label: string;
  /** Route or anchor; when omitted the item is an action callback. */
  href?: string;
  /** Destructive items render in `text-error`. */
  destructive?: boolean;
}

export const LISTING_MENU_ITEMS: ListingMenuItem[] = [
  { icon: "edit", label: "Edit", href: "#" },
  { icon: "open_in_new", label: "View public page", href: "#" },
  { icon: "sell", label: "Mark sold" },
  { icon: "content_copy", label: "Duplicate" },
  { icon: "archive", label: "Archive", destructive: true },
];

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

export const MY_LISTINGS: MyListing[] = [
  {
    id: "l1",
    listingCode: "LOT-442-BHA",
    slug: "bhaisepati-residential-land",
    title: "Bhaisepati Residential Land",
    propertyType: "RESIDENTIAL_LAND",
    status: "LIVE",
    verificationLevel: "LEVEL_3_FIELD_VERIFIED",
    askingPrice: 24500000,
    gradient: TYPE_GRADIENTS.RESIDENTIAL_LAND ?? FALLBACK_GRADIENT,
    views: 642,
    inquiries: 5,
    updatedAt: "2h ago",
  },
  {
    id: "l2",
    listingCode: "BK-1102",
    slug: "lamjung-valley-plot",
    title: "Lamjung Valley Plot",
    propertyType: "AGRICULTURAL_LAND",
    status: "UNDER_VERIFICATION",
    verificationLevel: "LEVEL_1_BASIC",
    askingPrice: 12800000,
    gradient: TYPE_GRADIENTS.AGRICULTURAL_LAND ?? FALLBACK_GRADIENT,
    views: 0,
    inquiries: 0,
    updatedAt: "1d ago",
  },
  {
    id: "l3",
    listingCode: "IMD-073",
    slug: "imadol-corner-plot",
    title: "Imadol Corner Plot",
    propertyType: "RESIDENTIAL_LAND",
    status: "DRAFT",
    verificationLevel: "UNVERIFIED",
    askingPrice: 18500000,
    gradient: TYPE_GRADIENTS.RESIDENTIAL_LAND ?? FALLBACK_GRADIENT,
    views: 0,
    inquiries: 0,
    updatedAt: "3d ago",
  },
  {
    id: "l4",
    listingCode: "KTM-209",
    slug: "durbarmarg-commercial-space",
    title: "Durbar Marg Commercial Space",
    propertyType: "COMMERCIAL_SPACE",
    status: "LIVE",
    verificationLevel: "LEVEL_2_DOC_VERIFIED",
    askingPrice: 89500000,
    gradient: TYPE_GRADIENTS.COMMERCIAL_SPACE ?? FALLBACK_GRADIENT,
    views: 1284,
    inquiries: 12,
    updatedAt: "5h ago",
  },
  {
    id: "l5",
    listingCode: "LAL-318",
    slug: "pulchowk-heritage-home",
    title: "Pulchowk Heritage Home",
    propertyType: "HERITAGE_HOME",
    status: "SOLD",
    verificationLevel: "LEVEL_3_FIELD_VERIFIED",
    askingPrice: 62000000,
    gradient: TYPE_GRADIENTS.HERITAGE_HOME ?? FALLBACK_GRADIENT,
    views: 3104,
    inquiries: 28,
    updatedAt: "2w ago",
  },
  {
    id: "l6",
    listingCode: "PKR-551",
    slug: "pokhara-lakeside-house",
    title: "Pokhara Lakeside House",
    propertyType: "RESIDENTIAL_HOUSE",
    status: "ARCHIVED",
    verificationLevel: "LEVEL_2_DOC_VERIFIED",
    askingPrice: 41000000,
    gradient: TYPE_GRADIENTS.RESIDENTIAL_HOUSE ?? FALLBACK_GRADIENT,
    views: 870,
    inquiries: 3,
    updatedAt: "1mo ago",
  },
];

