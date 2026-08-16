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

export interface UpdateProfileInput {
  name?: string;
  permanentDistrict?: string;
  permanentAddress?: string;
  preferredLanguage?: PreferredLanguage;
  preferredContactMethod?: ContactMethod;
  bio?: string;
  licenseNumber?: string;
}

export interface CitizenshipDocInput {
  type: "CITIZENSHIP_FRONT" | "CITIZENSHIP_BACK";
  fileUrl?: string;
  citizenshipNo?: string;
  citizenshipIssueDate?: string;
}
