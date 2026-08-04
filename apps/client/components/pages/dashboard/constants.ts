/**
 * Dashboard skeleton constants & mock data.
 *
 * These mirror the shapes used across the app (see
 * `lib/api/services/properties/types.ts`) so the skeleton can be wired to
 * real data later without reshaping the components. Everything here is a
 * placeholder for the `/dashboard` overview page described in DESIGN.md §5.1.
 */

import type { ComponentType } from "react";

/* ------------------------------------------------------------------ */
/* Sidebar navigation                                                  */
/* ------------------------------------------------------------------ */

export interface DashboardNavItem {
  label: string;
  href: string;
  /** Material Symbols icon name. */
  icon: string;
  /** Optional count badge (e.g. open inquiries). */
  badge?: string;
}

export interface DashboardNavSection {
  heading: string;
  items: DashboardNavItem[];
}

export const DASHBOARD_NAV_SECTIONS: DashboardNavSection[] = [
  {
    heading: "Overview",
    items: [
      { label: "Overview", href: "/dashboard", icon: "space_dashboard" },
      {
        label: "My Listings",
        href: "/my-listings",
        icon: "list_alt",
        badge: "3",
      },
    ],
  },
  {
    heading: "Records",
    items: [
      { label: "Document Vault", href: "/documents", icon: "folder" },
      {
        label: "Saved Searches",
        href: "/saved-searches",
        icon: "bookmark",
      },
      { label: "Favorites", href: "/favorites", icon: "favorite" },
    ],
  },
  {
    heading: "Activity",
    items: [
      {
        label: "Inquiries",
        href: "/inquiries",
        icon: "forum",
        badge: "5",
      },
      {
        label: "Appointments",
        href: "/appointments",
        icon: "event",
      },
      { label: "My Questions", href: "/questions", icon: "help" },
    ],
  },
  {
    heading: "Account",
    items: [
      {
        label: "Profile & Verification",
        href: "/profile",
        icon: "badge",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Stat cards (overview §5.1)                                          */
/* ------------------------------------------------------------------ */

export interface DashboardStat {
  label: string;
  value: string;
  /** Delta chip text, e.g. "+12%" or "-3%". */
  delta?: string;
  /** Whether the delta is positive (green) or negative (tertiary). */
  deltaPositive?: boolean;
  /** Window label shown under the delta, e.g. "30d". */
  window?: string;
  /** Material Symbols icon name for the card accent. */
  icon: string;
}

export const DASHBOARD_STATS: DashboardStat[] = [
  {
    label: "Active Listings",
    value: "3",
    delta: "+1",
    deltaPositive: true,
    window: "30d",
    icon: "list_alt",
  },
  {
    label: "Total Views",
    value: "1,284",
    delta: "+12%",
    deltaPositive: true,
    window: "30d",
    icon: "visibility",
  },
  {
    label: "Open Inquiries",
    value: "5",
    delta: "+2",
    deltaPositive: true,
    window: "7d",
    icon: "forum",
  },
  {
    label: "Saved-Search Matches",
    value: "9",
    delta: "-3%",
    deltaPositive: false,
    window: "7d",
    icon: "bookmark",
  },
];

/* ------------------------------------------------------------------ */
/* Recent activity feed (overview §5.1 left)                          */
/* ------------------------------------------------------------------ */

export type ActivityType = "inquiry" | "document" | "pricedrop" | "appointment";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  /** ISO-ish timestamp label, rendered mono. */
  timestamp: string;
  /** Relative label, e.g. "2h ago". */
  relative: string;
}

export const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: "a1",
    type: "inquiry",
    message: "New inquiry received on LOT-442-BHA — Bhaisepati land.",
    timestamp: "10:42 AM",
    relative: "2h ago",
  },
  {
    id: "a2",
    type: "document",
    message: "Tax Clearance document verified by archive desk.",
    timestamp: "09:15 AM",
    relative: "4h ago",
  },
  {
    id: "a3",
    type: "pricedrop",
    message: "Price drop on a favourite — Imadol residential plot.",
    timestamp: "Yesterday",
    relative: "1d ago",
  },
  {
    id: "a4",
    type: "appointment",
    message: "Field verification scheduled for BK-1102 — Lamjung.",
    timestamp: "Mon 09:00",
    relative: "2d ago",
  },
];

/** Convenience re-export so callers can type component props inline. */
/* ------------------------------------------------------------------ */
/* Listings snapshot mini-table (overview §5.1 right)                  */
/* ------------------------------------------------------------------ */

export interface SnapshotListing {
  id: string;
  code: string;
  title: string;
  status: "Live" | "Under Verification" | "Draft";
  views: string;
}

export const SNAPSHOT_LISTINGS: SnapshotListing[] = [
  {
    id: "l1",
    code: "LOT-442-BHA",
    title: "Bhaisepati Residential Land",
    status: "Live",
    views: "642",
  },
  {
    id: "l2",
    code: "BK-1102",
    title: "Lamjung Valley Plot",
    status: "Under Verification",
    views: "0",
  },
  {
    id: "l3",
    code: "IMD-073",
    title: "Imadol Corner Plot",
    status: "Draft",
    views: "0",
  },
];

/* ------------------------------------------------------------------ */
/* Upcoming appointments (overview §5.1 right)                        */
/* ------------------------------------------------------------------ */

export interface UpcomingAppointment {
  id: string;
  day: string;
  month: string;
  propertyCode: string;
  propertyArea: string;
  officer: string;
  type: "Field Verification" | "Registry Officer Visit";
  status: "Requested" | "Scheduled" | "Completed" | "Reschedule Needed";
}

export const UPCOMING_APPOINTMENTS: UpcomingAppointment[] = [
  {
    id: "ap1",
    day: "12",
    month: "AUG",
    propertyCode: "BK-1102",
    propertyArea: "Lamjung Valley",
    officer: "Rabi Thapa",
    type: "Field Verification",
    status: "Scheduled",
  },
  {
    id: "ap2",
    day: "15",
    month: "AUG",
    propertyCode: "LOT-442-BHA",
    propertyArea: "Bhaisepati, Lalitpur",
    officer: "Surya K.C.",
    type: "Registry Officer Visit",
    status: "Requested",
  },
];

/* ------------------------------------------------------------------ */
/* Status → styling map (shared across dashboard widgets)             */
/* ------------------------------------------------------------------ */

/** Concrete fallback so `noUncheckedIndexedAccess` lookups stay defined. */
export const DEFAULT_STATUS_STYLE: {
  dot: string;
  chip: string;
  label: string;
} = {
  dot: "bg-on-surface-variant",
  chip: "bg-surface-container-high text-on-surface-variant",
  label: "—",
};

export const STATUS_STYLES: Record<
  string,
  { dot: string; chip: string; label: string }
> = {
  Live: {
    dot: "bg-primary",
    chip: "bg-primary/10 text-primary",
    label: "Live",
  },
  "Under Verification": {
    dot: "bg-[#b45309]",
    chip: "bg-[#b45309]/10 text-[#b45309]",
    label: "Under Verification",
  },
  Draft: {
    dot: "bg-on-surface-variant",
    chip: "bg-surface-container-high text-on-surface-variant",
    label: "Draft",
  },
  Scheduled: {
    dot: "bg-primary",
    chip: "bg-primary/10 text-primary",
    label: "Scheduled",
  },
  Requested: {
    dot: "bg-[#b45309]",
    chip: "bg-[#b45309]/10 text-[#b45309]",
    label: "Requested",
  },
  Completed: {
    dot: "bg-primary",
    chip: "bg-primary/10 text-primary",
    label: "Completed",
  },
  "Reschedule Needed": {
    dot: "bg-tertiary",
    chip: "bg-tertiary/10 text-tertiary",
    label: "Reschedule Needed",
  },
};

/* ------------------------------------------------------------------ */
/* Activity → styling map                                              */
/* ------------------------------------------------------------------ */

export const ACTIVITY_STYLES: Record<
  ActivityType,
  { dot: string; icon: string; label: string }
> = {
  inquiry: {
    dot: "bg-primary",
    icon: "forum",
    label: "Inquiry",
  },
  document: {
    dot: "bg-secondary",
    icon: "verified",
    label: "Document",
  },
  pricedrop: {
    dot: "bg-tertiary",
    icon: "trending_down",
    label: "Price Drop",
  },
  appointment: {
    dot: "bg-[#b45309]",
    icon: "event",
    label: "Appointment",
  },
};

export type { ComponentType };
