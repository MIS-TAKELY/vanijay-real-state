export type VerificationLevel = "L1" | "L2" | "L3";
export type ListingStatus =
  | "DRAFT"
  | "UNDER_VERIFICATION"
  | "LIVE"
  | "FLAGGED"
  | "DISPUTED"
  | "SOLD";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}
export interface NavSection {
  heading: string;
  items: NavItem[];
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: "space_dashboard" },
      { label: "Analytics", href: "/analytics", icon: "insights" },
    ],
  },
  {
    heading: "Marketplace",
    items: [
      { label: "Listings", href: "/listings", icon: "list_alt" },
      { label: "Verifications", href: "/verifications", icon: "verified" },
      { label: "Documents", href: "/documents", icon: "article" },
      { label: "Disputes", href: "/disputes", icon: "warning" },
      { label: "Appointments", href: "/appointments", icon: "event" },
      { label: "Users & Agents", href: "/users", icon: "manage_accounts" },
      { label: "Region Rates", href: "/rates", icon: "public" },
    ],
  },
  {
    heading: "Content (CMS)",
    items: [
      { label: "Real Estate", href: "/cms/real-state", icon: "home" },
      { label: "Gold", href: "/cms/gold", icon: "monitoring" },
      { label: "Scrape / Kabadi", href: "/cms/scrape", icon: "recycling" },
      { label: "Global", href: "/cms/global", icon: "settings" },
    ],
  },
  {
    heading: "System",
    items: [
      { label: "Audit Log", href: "/audit", icon: "receipt_long" },
      { label: "Settings", href: "/settings", icon: "tune" },
    ],
  },
];

export interface StatCardData {
  label: string;
  value: string;
  hint?: string;
  icon: string;
  tone: "primary" | "secondary" | "tertiary" | "amber" | "surface";
}

export const OPERATIONS_STATS: StatCardData[] = [
  { label: "Pending Verification", value: "87", hint: "+12 in 24h", icon: "schedule", tone: "tertiary" },
  { label: "Field Verifications", value: "24", hint: "5 overdue", icon: "verified", tone: "amber" },
  { label: "Disputed Plots", value: "9", hint: "3 flagged today", icon: "warning", tone: "secondary" },
  { label: "Active in Archive", value: "1,842", hint: "↑ 6% this month", icon: "list_alt", tone: "primary" },
];

export interface VerificationRow {
  id: string;
  code: string;
  title: string;
  district: string;
  area: string;
  price: string;
  level: VerificationLevel;
  status: ListingStatus;
  daysPending: number;
  stampLabel: string;
}

export const VERIFICATION_QUEUE: VerificationRow[] = [
  {
    id: "lp-442",
    code: "LOT-442-BHA",
    title: "Residential plot, Bhaisepati heights",
    district: "Lalitpur",
    area: "Ward 10 — 0-4-0-0 Ropani (2,196 sqft)",
    price: "रू 2,45,00,000",
    level: "L2",
    status: "UNDER_VERIFICATION",
    daysPending: 4,
    stampLabel: "L2 Desk",
  },
  {
    id: "lp-318",
    code: "LOT-318-KTM",
    title: "Commercial land, Baudachaur",
    district: "Kathmandu",
    area: "Ward 8 — 0-2-0-0 Ropani (547 sqft)",
    price: "रू 18,90,00,000",
    level: "L1",
    status: "UNDER_VERIFICATION",
    daysPending: 1,
    stampLabel: "L1 Basic",
  },
  {
    id: "lp-501",
    code: "LOT-501-BTL",
    title: "Corner plot, Jhamel link road",
    district: "Bhaktapur",
    area: "Ward 5 — 0-3-0-2 Ropani (1,363 sqft)",
    price: "रू 3,12,00,000",
    level: "L2",
    status: "FLAGGED",
    daysPending: 7,
    stampLabel: "L2 Flagged",
  },
  {
    id: "lp-290",
    code: "LOT-290-PKR",
    title: "Lake-view plot, Lakeside",
    district: "Pokhara",
    area: "Ward 12 — 0-6-0-0 Ropani (2,723 sqft)",
    price: "रू 8,75,00,000",
    level: "L2",
    status: "UNDER_VERIFICATION",
    daysPending: 2,
    stampLabel: "L2 Desk",
  },
  {
    id: "lp-177",
    code: "LOT-177-DHL",
    title: "Heritage-adjacent plot",
    district: "Kathmandu",
    area: "Ward 22 — 0-1-0-0 Ropani (272 sqft)",
    price: "रू 4,50,00,000",
    level: "L1",
    status: "DISPUTED",
    daysPending: 12,
    stampLabel: "L1 Disputed",
  },
];

export interface ActivityItem {
  id: string;
  icon: string;
  label: string;
  detail: string;
  time: string;
  mono: string;
}

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    icon: "verified",
    label: "L3 field verification completed",
    detail: "LOT-442-BHA — surveyor S. Karmacharya",
    time: "2h ago",
    mono: "2082-03-06",
  },
  {
    id: "a2",
    icon: "warning",
    label: "Dispute flag raised",
    detail: "LOT-177-DHL — Guthi encroachment, Ward 22",
    time: "5h ago",
    mono: "2082-03-06 13:11",
  },
  {
    id: "a3",
    icon: "article",
    label: "Document verified",
    detail: "Lalpurja for LOT-290-PKR attached",
    time: "1d ago",
    mono: "2082-03-05",
  },
  {
    id: "a4",
    icon: "schedule",
    label: "Verification overdue",
    detail: "LOT-501-BTL pending >72h",
    time: "1d ago",
    mono: "2082-03-05",
  },
];

/** The full listings index for the Listings table. */
export const LISTINGS: VerificationRow[] = [
  ...VERIFICATION_QUEUE,
  {
    id: "lp-881",
    code: "LOT-881-KTM",
    title: "Apartment block, Thamel",
    district: "Kathmandu",
    area: "Ward 11 — 0-8-0-0 Ropani (3,674 sqft)",
    price: "रू 68,00,00,000",
    level: "L3",
    status: "LIVE",
    daysPending: 0,
    stampLabel: "L3 Field",
  },
  {
    id: "lp-762",
    code: "LOT-762-KTM",
    title: "Duplex, Sanepa",
    district: "Lalitpur",
    area: "Ward 29 — 0-1-0-1 Ropani (340 sqft)",
    price: "रू 12,50,00,000",
    level: "L3",
    status: "SOLD",
    daysPending: 0,
    stampLabel: "L3 Sold",
  },
  {
    id: "lp-003",
    code: "LOT-003-PKR",
    title: "Vacant plot, Lake side",
    district: "Pokhara",
    area: "Ward 9 — 0-5-0-0 Ropani (2,276 sqft)",
    price: "रू 5,20,00,000",
    level: "L1",
    status: "DRAFT",
    daysPending: 14,
    stampLabel: "L1 Draft",
  },
];

/** Status filters surfaced in the Listings table toolbar. */
export const LISTING_STATUS_FILTERS: { label: string; value: ListingStatus }[] =
  [
    { label: "All", value: "LIVE" },
    { label: "Pending", value: "UNDER_VERIFICATION" },
    { label: "Flagged", value: "FLAGGED" },
    { label: "Disputed", value: "DISPUTED" },
    { label: "Live", value: "LIVE" },
    { label: "Sold", value: "SOLD" },
  ];
