/**
 * Document Vault constants & mock data (DESIGN.md §5.3).
 *
 * Shapes mirror the real Prisma model `UserDocument` (see
 * `packages/db/prisma/schema.prisma`) — `DocumentType` / `DocumentStatus`
 * enums, `expiryDate?`, `attachedToPropertyIds[]` — so this skeleton can be
 * wired to live data later without reshaping the components.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type DocumentType =
  | "LALPURJA"
  | "CITIZENSHIP_FRONT"
  | "CITIZENSHIP_BACK"
  | "TAX_CLEARANCE"
  | "SURVEY_NAKSA_MAP"
  | "PAN_CARD"
  | "OTHER";

export type DocumentStatus = "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";

export type DocumentFilter =
  | "ALL"
  | "VERIFIED"
  | "PENDING"
  | "EXPIRING"
  | "EXPIRED";

/** A card in the Document Vault — UserDocument + display-only fields. */
export interface VaultDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  /** File size in MB (mono display). */
  fileSizeMb: number;
  status: DocumentStatus;
  /** Days until expiry; null = no expiry (non-expiring doc types). */
  daysUntilExpiry: number | null;
  /** Count of listings this vault doc is attached to. */
  linkedListings: number;
  /** Pre-formatted "Uploaded" label, rendered mono. */
  uploadedAt: string;
}

/* ------------------------------------------------------------------ */
/* Document type → icon + label (DESIGN.md §5.3)                       */
/* ------------------------------------------------------------------ */

export interface DocumentTypeMeta {
  /** Material Symbols icon name. */
  icon: string;
  label: string;
}

export const DOCUMENT_TYPE_META: Record<DocumentType, DocumentTypeMeta> = {
  LALPURJA: { icon: "article", label: "Lalpurja" },
  CITIZENSHIP_FRONT: { icon: "badge", label: "Citizenship" },
  CITIZENSHIP_BACK: { icon: "badge", label: "Citizenship" },
  TAX_CLEARANCE: { icon: "receipt_long", label: "Tax Clearance" },
  SURVEY_NAKSA_MAP: { icon: "map", label: "Naksa" },
  PAN_CARD: { icon: "credit_card", label: "PAN Card" },
  OTHER: { icon: "description", label: "Other" },
};

/** Concrete fallback so `noUncheckedIndexedAccess` lookups stay defined. */
export const DEFAULT_DOCUMENT_TYPE_META: DocumentTypeMeta = {
  icon: "description",
  label: "Document",
};

/* ------------------------------------------------------------------ */
/* Status chip styles                                                  */
/* ------------------------------------------------------------------ */

export interface DocStatusStyle {
  dot: string;
  chip: string;
  label: string;
}

export const DEFAULT_DOC_STATUS_STYLE: DocStatusStyle = {
  dot: "bg-on-surface-variant",
  chip: "bg-surface-container-high text-on-surface-variant",
  label: "—",
};

export const DOC_STATUS_STYLES: Record<DocumentStatus, DocStatusStyle> = {
  PENDING: {
    dot: "bg-[#b45309]",
    chip: "bg-[#b45309]/10 text-[#b45309]",
    label: "Pending",
  },
  VERIFIED: {
    dot: "bg-primary",
    chip: "bg-primary/10 text-primary",
    label: "Verified",
  },
  REJECTED: {
    dot: "bg-tertiary",
    chip: "bg-tertiary/10 text-tertiary",
    label: "Rejected",
  },
  EXPIRED: {
    dot: "bg-error",
    chip: "bg-error/10 text-error",
    label: "Expired",
  },
};

/* ------------------------------------------------------------------ */
/* Filter tabs (§5.3 grouping tabs)                                    */
/* ------------------------------------------------------------------ */

export interface DocFilterTab {
  key: DocumentFilter;
  label: string;
}

export const DOC_FILTER_TABS: DocFilterTab[] = [
  { key: "ALL", label: "All" },
  { key: "VERIFIED", label: "Verified" },
  { key: "PENDING", label: "Pending" },
  { key: "EXPIRING", label: "Expiring" },
  { key: "EXPIRED", label: "Expired" },
];

/* ------------------------------------------------------------------ */
/* Row menu actions (§5.3 `...` menu)                                  */
/* ------------------------------------------------------------------ */

export interface DocMenuItem {
  icon: string;
  label: string;
  href?: string;
  destructive?: boolean;
}

export const DOC_MENU_ITEMS: DocMenuItem[] = [
  { icon: "visibility", label: "Preview" },
  { icon: "swap_horiz", label: "Replace" },
  { icon: "download", label: "Download" },
  { icon: "delete", label: "Delete", destructive: true },
];

/** Threshold (days) for the amber "expires soon" chip (DESIGN.md §5.3). */
/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

export const VAULT_DOCUMENTS: VaultDocument[] = [
  {
    id: "d1",
    type: "LALPURJA",
    fileName: "lalpurja-bhaisepati.pdf",
    fileSizeMb: 2.4,
    status: "VERIFIED",
    daysUntilExpiry: null,
    linkedListings: 1,
    uploadedAt: "12 Jul 2026",
  },
  {
    id: "d2",
    type: "CITIZENSHIP_FRONT",
    fileName: "citizenship-front.jpg",
    fileSizeMb: 1.1,
    status: "VERIFIED",
    daysUntilExpiry: null,
    linkedListings: 0,
    uploadedAt: "08 Jul 2026",
  },
  {
    id: "d3",
    type: "CITIZENSHIP_BACK",
    fileName: "citizenship-back.jpg",
    fileSizeMb: 1.0,
    status: "VERIFIED",
    daysUntilExpiry: null,
    linkedListings: 0,
    uploadedAt: "08 Jul 2026",
  },
  {
    id: "d4",
    type: "TAX_CLEARANCE",
    fileName: "tax-clearance-fy2081.pdf",
    fileSizeMb: 0.8,
    status: "VERIFIED",
    daysUntilExpiry: 24,
    linkedListings: 1,
    uploadedAt: "01 Aug 2026",
  },
  {
    id: "d5",
    type: "SURVEY_NAKSA_MAP",
    fileName: "naksa-lamjung.pdf",
    fileSizeMb: 3.2,
    status: "PENDING",
    daysUntilExpiry: null,
    linkedListings: 1,
    uploadedAt: "03 Aug 2026",
  },
  {
    id: "d6",
    type: "TAX_CLEARANCE",
    fileName: "tax-clearance-fy2080.pdf",
    fileSizeMb: 0.7,
    status: "EXPIRED",
    daysUntilExpiry: -18,
    linkedListings: 0,
    uploadedAt: "15 Jul 2025",
  },
  {
    id: "d7",
    type: "PAN_CARD",
    fileName: "pan-card-scan.jpg",
    fileSizeMb: 0.9,
    status: "REJECTED",
    daysUntilExpiry: null,
    linkedListings: 0,
    uploadedAt: "20 Jul 2026",
  },
  {
    id: "d8",
    type: "OTHER",
    fileName: "power-of-attorney.pdf",
    fileSizeMb: 1.5,
    status: "VERIFIED",
    daysUntilExpiry: 72,
    linkedListings: 2,
    uploadedAt: "22 Jun 2026",
  },
];

export const EXPIRY_SOON_DAYS = 90;
