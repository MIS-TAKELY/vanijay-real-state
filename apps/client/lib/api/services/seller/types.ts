export type SellerAccountType = "INDIVIDUAL" | "AGENT" | "ORGANIZATION";

export type SellerSubType =
  | "OWNER"
  | "SELLER"
  | "LANDLORD"
  | "BROKER"
  | "REAL_ESTATE_AGENCY"
  | "DEVELOPER"
  | "REAL_ESTATE_COMPANY"
  | "INSTITUTE"
  | "CORPORATE_OWNER";

export type SellerRegistrationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface SellerProfileView {
  exists: boolean;
  status: SellerRegistrationStatus | null;
  accountType: SellerAccountType | null;
  subType: SellerSubType | null;

  // Individual
  fullName: string;
  ownershipDeclared: boolean;

  // Agent / Organization
  businessName: string;
  representativeName: string;
  hasBusinessRegistration: boolean;
  registrationNumber: string;
  businessEmail: string;
  businessPhone: string;
  website: string;
  officeDistrict: string;
  officeAddress: string;
  officeLocation: Record<string, unknown> | null;

  // Lifecycle
  submittedAt: string | null;
  rejectionReason: string | null;

  requirements: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
}

export interface SaveSellerProfileInput {
  accountType: SellerAccountType;
  subType: SellerSubType;

  fullName?: string;
  ownershipDeclared?: boolean;

  businessName?: string;
  representativeName?: string;
  hasBusinessRegistration?: boolean;
  registrationNumber?: string;
  businessEmail?: string;
  businessPhone?: string;
  website?: string;
  officeDistrict?: string;
  officeAddress?: string;
  officeLocation?: Record<string, unknown>;
}

export interface SubmitSellerProfileResult extends SellerProfileView {
  approved: boolean;
}