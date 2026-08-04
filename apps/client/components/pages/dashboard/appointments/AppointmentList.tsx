import { EmptyState } from "../../../common/dashboard/EmptyState";
import { AppointmentRow } from "./AppointmentRow";
import { APPOINTMENTS } from "./constants";

export function AppointmentList() {
  if (APPOINTMENTS.length === 0) {
    return (
      <EmptyState
        icon="event_available"
        title="No appointments booked"
        description="Book a field verification to earn the Level 3 stamp."
        action={
          <a
            href="/dashboard/listings"
            className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 transition-colors"
          >
            Book a verification
          </a>
        }
      />
    );
  }

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface">
      {APPOINTMENTS.map((appt) => (
        <AppointmentRow key={appt.id} appointment={appt} />
      ))}
    </div>
  );
}
