/**
 * \"My Listings\" page constants (DESIGN.md §5.2).
 *
 * Shapes mirror the real API/Prisma enums (see `packages/db/prisma/schema.prisma`
 * and `lib/api/services/properties/types.ts`). Display helpers
 * (`TYPE_LABELS`, `VERIFICATION_LABELS`, `TYPE_GRADIENTS`, `formatNPR`,
 * `labelEnum`) are reused from the api types — not redefined here.
 */

import type { ApiProperty } from "lib/api/services/properties/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** A row in the "My Listings" table — ApiProperty + display-only fields. */
export interface MyListing {
  id: string;
  listingCode: string;
  slug: string;
  title: string;
  mainCategory: string; // MainCategory enum
  subCategory: string; // SubCategory enum
  status: ListingStatus; // PropertyStatus enum
  verificationLevel: string; // VerificationStatus enum
  askingPrice: number;
  /** Tailwind gradient classes for the cover thumb (from TYPE_GRADIENTS). */
  gradient: string;
  /** Cover image URL from property media (falls back to gradient when absent). */
  thumbnailUrl?: string | null;
  views: number;
  inquiries: number;
  /** Pre-formatted "Updated" label, rendered mono. */
  updatedAt: string;
  /** Source API record — used by row actions (Edit / Duplicate). */
  raw: ApiProperty;
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
/* Listings table columns (§5.2)                                       */
/* ------------------------------------------------------------------ */

/**
 * Single source of truth for the table column set. The responsive class is
 * applied to BOTH the header `<th>` and the matching row `<td>`, so header
 * and body visibility can never drift apart.
 */
export interface ListingTableColumn {
  key: string;
  label: string;
  /** Visibility class shared by the header cell and the row cell. */
  cellClassName?: string;
}

export const LISTING_TABLE_COLUMNS: ListingTableColumn[] = [
  { key: "listing", label: "Listing" },
  { key: "type", label: "Type", cellClassName: "hidden lg:table-cell" },
  { key: "status", label: "Status", cellClassName: "hidden md:table-cell" },
  { key: "verified", label: "Verified", cellClassName: "hidden lg:table-cell" },
  { key: "price", label: "Asking Price" },
  { key: "views", label: "Views", cellClassName: "hidden sm:table-cell" },
  {
    key: "inquiries",
    label: "Inquiries",
    cellClassName: "hidden sm:table-cell",
  },
  { key: "updated", label: "Updated", cellClassName: "hidden md:table-cell" },
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
    dot: "bg-gold",
    chip: "bg-gold/10 text-gold-deep",
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

/**
 * The `...` row menu is rendered by `ListingMenu.tsx`. It wires five actions:
 * Edit (opens the creation wizard in edit mode), View public page (live
 * listings only), Mark sold, Duplicate, and Archive — each backed by the
 * properties API. The action labels/icons live in `ListingMenu` directly so
 * they can reflect per-action pending states.
 */
