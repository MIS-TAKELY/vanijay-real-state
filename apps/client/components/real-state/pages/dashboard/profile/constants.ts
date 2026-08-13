/**
 * Profile & Verification constants & mock data (DESIGN.md §5.8).
 *
 * Shapes mirror the real Prisma models `User` + `UserProfile` (see
 * `packages/db/prisma/schema.prisma`) — `UserRole[]`, `phoneNumber`,
 * `phoneNumberVerified`, `emailVerified`, `citizenshipNo`,
 * `preferredLanguage` ("en"|"ne"), `preferredContactMethod`
 * ("PHONE"|"WHATSAPP"|"VIBER") — so this skeleton can be wired to live data
 * later without reshaping the components.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type UserRole =
  | "BUYER"
  | "SELLER"
  | "AGENCY_AGENT"
  | "AGENCY_ADMIN"
  | "SURVEYOR_AGENT"
  | "ADMIN";

export type VerificationLevel = 0 | 1 | 2 | 3;

export type ContactMethod = "PHONE" | "WHATSAPP" | "VIBER";

export type PreferredLanguage = "en" | "ne";

/** The current user's profile (User + UserProfile fields). */
export interface ProfileData {
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  avatarUrl: string | null;
  roles: UserRole[];
  verificationLevel: VerificationLevel;
  permanentDistrict: string;
  permanentAddress: string;
  preferredLanguage: PreferredLanguage;
  preferredContactMethod: ContactMethod;
  citizenshipNo: string;
  citizenshipIssueDate: string;
  citizenshipStatus: "verified" | "pending" | "none";
  licenseNumber: string | null;
}

/* ------------------------------------------------------------------ */
/* Role labels                                                         */
/* ------------------------------------------------------------------ */

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  BUYER: "Buyer",
  SELLER: "Seller",
  AGENCY_AGENT: "Agency Agent",
  AGENCY_ADMIN: "Agency Admin",
  SURVEYOR_AGENT: "Surveyor Agent",
  ADMIN: "Admin",
};

/* ------------------------------------------------------------------ */
/* Verification level definitions                                      */
/* ------------------------------------------------------------------ */

export interface VerificationLevelMeta {
  level: 1 | 2 | 3;
  label: string;
  description: string;
}

export const VERIFICATION_LEVELS: VerificationLevelMeta[] = [
  {
    level: 1,
    label: "Level 1 — Basic",
    description: "Email + phone verified",
  },
  {
    level: 2,
    label: "Level 2 — Document Verified",
    description: "Citizenship uploaded & checked",
  },
  {
    level: 3,
    label: "Level 3 — Field Verified",
    description: "Surveyor visited the plot",
  },
];

/* ------------------------------------------------------------------ */
/* Contact method + language options                                   */
/* ------------------------------------------------------------------ */

export const CONTACT_METHODS: { key: ContactMethod; label: string }[] = [
  { key: "PHONE", label: "Phone" },
  { key: "WHATSAPP", label: "WhatsApp" },
  { key: "VIBER", label: "Viber" },
];

export const LANGUAGES: { key: PreferredLanguage; label: string }[] = [
  { key: "en", label: "English" },
  { key: "ne", label: "नेपाली" },
];

/* ------------------------------------------------------------------ */
/* Notification preferences matrix (§5.8)                              */
/* ------------------------------------------------------------------ */

export interface NotificationRow {
  key: string;
  label: string;
}

export const NOTIFICATION_ROWS: NotificationRow[] = [
  { key: "price_drops", label: "Price drops" },
  { key: "new_matches", label: "New matches" },
  { key: "document_expiry", label: "Document expiry" },
  { key: "messages", label: "Messages" },
  { key: "appointments", label: "Appointments" },
  { key: "weekly_digest", label: "Weekly digest" },
];

export const NOTIFICATION_CHANNELS = ["in_app", "email"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  in_app: "In-app",
  email: "Email",
};


