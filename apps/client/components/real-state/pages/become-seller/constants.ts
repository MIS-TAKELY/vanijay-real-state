import type { SellerAccountType, SellerSubType } from "lib/api/services/seller";

export interface SubTypeOption {
  value: SellerSubType;
  label: string;
  hint: string;
}

export interface AccountTypeOption {
  value: SellerAccountType;
  label: string;
  description: string;
  icon: string;
  subTypes: SubTypeOption[];
}

export const ACCOUNT_TYPES: AccountTypeOption[] = [
  {
    value: "INDIVIDUAL",
    label: "Individual",
    description:
      "You own or represent the owner of a property you want to list.",
    icon: "manage_accounts",
    subTypes: [
      { value: "OWNER", label: "Owner", hint: "I own the property" },
      { value: "SELLER", label: "Seller", hint: "I'm selling on behalf of the owner" },
      { value: "LANDLORD", label: "Landlord", hint: "I rent out my property" },
    ],
  },
  {
    value: "AGENT",
    label: "Agent",
    description:
      "You are a broker or run a real estate agency listing client properties.",
    icon: "handshake",
    subTypes: [
      { value: "BROKER", label: "Broker", hint: "Independent property broker" },
      { value: "REAL_ESTATE_AGENCY", label: "Real Estate Agency", hint: "Registered agency" },
    ],
  },
  {
    value: "ORGANIZATION",
    label: "Organization",
    description:
      "A developer, company, institute, or corporate owner listing properties.",
    icon: "business_center",
    subTypes: [
      { value: "DEVELOPER", label: "Developer", hint: "Housing / project developer" },
      { value: "REAL_ESTATE_COMPANY", label: "Real Estate Company", hint: "Registered company" },
      { value: "INSTITUTE", label: "Institute", hint: "Bank, co-op, or institution" },
      { value: "CORPORATE_OWNER", label: "Corporate Owner", hint: "Company-owned property" },
    ],
  },
];

export function getAccountType(value: SellerAccountType | null) {
  return ACCOUNT_TYPES.find((t) => t.value === value) ?? null;
}

export function getSubTypeLabel(
  accountType: SellerAccountType | null,
  subType: SellerSubType | null,
): string {
  const type = getAccountType(accountType);
  return type?.subTypes.find((s) => s.value === subType)?.label ?? "";
}

/** Versioned ownership declaration shown to Individual sellers. */
export const OWNERSHIP_DECLARATION_TEXT =
  "I declare that I am the lawful owner of the property I am listing, or I " +
  "have written authorization from the owner to list it on their behalf. I " +
  "understand that providing false ownership information may result in my " +
  "account being suspended and my listings removed.";

/** Wizard step order. */
export const WIZARD_STEPS = [
  { id: "type", label: "Account type" },
  { id: "verify", label: "Verify contact" },
  { id: "details", label: "Your details" },
  { id: "declaration", label: "Declaration" },
  { id: "review", label: "Review" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];