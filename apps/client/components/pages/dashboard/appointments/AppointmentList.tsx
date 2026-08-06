import { Button } from "@repo/ui";
import { EmptyState } from "../../../common/dashboard/EmptyState";
import { AppointmentRow } from "./AppointmentRow";
import { APPOINTMENTS } from "./constants";
import Link from "next/link";

export function AppointmentList() {
  if (APPOINTMENTS.length === 0) {
    return (
      <EmptyState
        icon="event_available"
        title="No appointments booked"
        description="Book a field verification to earn the Level 3 stamp."
        action={
          <Button asChild>
            <Link href="/dashboard/listings">
              Book a verification
            </Link>
          </Button>
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
