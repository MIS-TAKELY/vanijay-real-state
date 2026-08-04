import { DashboardHeader } from "components/pages/dashboard";
import { AppointmentList } from "components/pages/dashboard/appointments";

export default function AppointmentsPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Appointments"
        description="Field verifications and registry officer visits scheduled for your listings."
      />

      <AppointmentList />
    </div>
  );
}
