/**
 * Appointments constants & mock data (DESIGN.md §5.6).
 *
 * Shapes mirror the real Prisma model `OfficerAppointment` (see
 * `packages/db/prisma/schema.prisma`) — `AppointmentStatus` enum,
 * `scheduledFor`, `officerName`, `outcomeNotes` — so this skeleton can be
 * wired to live data later without reshaping the components.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type AppointmentStatus =
  | "REQUESTED"
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULE_NEEDED";

export type AppointmentType = "FIELD_VERIFICATION" | "REGISTRY_OFFICER_VISIT";

/** An appointment row — OfficerAppointment + display-only fields. */
export interface Appointment {
  id: string;
  /** Day of month, rendered mono. */
  day: string;
  /** Month abbreviation, rendered mono. */
  month: string;
  propertyCode: string;
  propertyArea: string;
  type: AppointmentType;
  officerName: string;
  status: AppointmentStatus;
  /** Outcome notes shown when a completed row is expanded. */
  outcomeNotes: string | null;
  /** Pre-formatted time label, rendered mono. */
  time: string;
}

/* ------------------------------------------------------------------ */
/* Type labels                                                         */
/* ------------------------------------------------------------------ */

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  FIELD_VERIFICATION: "Field Verification",
  REGISTRY_OFFICER_VISIT: "Registry Officer Visit",
};

export const DEFAULT_APPOINTMENT_TYPE_LABEL = "Appointment";

/* ------------------------------------------------------------------ */
/* Status chip styles                                                  */
/* ------------------------------------------------------------------ */

export interface ApptStatusStyle {
  dot: string;
  chip: string;
  label: string;
}

export const DEFAULT_APPT_STATUS_STYLE: ApptStatusStyle = {
  dot: "bg-on-surface-variant",
  chip: "bg-surface-container-high text-on-surface-variant",
  label: "—",
};

export const APPOINTMENT_STATUS_STYLES: Record<
  AppointmentStatus,
  ApptStatusStyle
> = {
  REQUESTED: {
    dot: "bg-[#b45309]",
    chip: "bg-[#b45309]/10 text-[#b45309]",
    label: "Requested",
  },
  SCHEDULED: {
    dot: "bg-primary",
    chip: "bg-primary/10 text-primary",
    label: "Scheduled",
  },
  COMPLETED: {
    dot: "bg-primary",
    chip: "bg-primary text-on-primary",
    label: "Completed",
  },
  CANCELLED: {
    dot: "bg-on-surface-variant",
    chip: "bg-surface-container text-on-surface-variant",
    label: "Cancelled",
  },
  RESCHEDULE_NEEDED: {
    dot: "bg-tertiary",
    chip: "bg-tertiary/10 text-tertiary",
    label: "Reschedule Needed",
  },
};

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

export const APPOINTMENTS: Appointment[] = [
  {
    id: "ap1",
    day: "12",
    month: "AUG",
    propertyCode: "BK-1102",
    propertyArea: "Lamjung Valley",
    type: "FIELD_VERIFICATION",
    officerName: "Rabi Thapa",
    status: "SCHEDULED",
    outcomeNotes: null,
    time: "09:00 AM",
  },
  {
    id: "ap2",
    day: "15",
    month: "AUG",
    propertyCode: "LOT-442-BHA",
    propertyArea: "Bhaisepati, Lalitpur",
    type: "REGISTRY_OFFICER_VISIT",
    officerName: "Surya K.C.",
    status: "REQUESTED",
    outcomeNotes: null,
    time: "—",
  },
  {
    id: "ap3",
    day: "28",
    month: "JUL",
    propertyCode: "KTM-209",
    propertyArea: "Durbar Marg, Kathmandu",
    type: "FIELD_VERIFICATION",
    officerName: "Rabi Thapa",
    status: "COMPLETED",
    outcomeNotes:
      "Boundaries measured and matched against the naksa. Road access confirmed at 20ft pitched. No encroachment detected. Recommended for Level 3 stamp.",
    time: "10:30 AM",
  },
  {
    id: "ap4",
    day: "20",
    month: "JUL",
    propertyCode: "LAL-318",
    propertyArea: "Pulchowk, Lalitpur",
    type: "REGISTRY_OFFICER_VISIT",
    officerName: "Surya K.C.",
    status: "RESCHEDULE_NEEDED",
    outcomeNotes: null,
    time: "—",
  },
];
