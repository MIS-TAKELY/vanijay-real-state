import { Button, Icon } from "@repo/ui";
import {
  ActivityFeed,
  DashboardHeader,
  GreetingRow,
  ListingsSnapshot,
  StatGrid,
  UpcomingAppointments,
  VerificationBanner,
} from "components/pages/dashboard";

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Overview"
        description="Your archive at a glance — listings, inquiries and verification status."
        action={
          <Button asChild>
            <a href="/dashboard/listings/new">
              <Icon name="add" className="text-[16px]" />
              New Listing
            </a>
          </Button>
        }
      />

      <GreetingRow name="Aayush" verificationLevel={2} roles={["Owner"]} />

      <VerificationBanner show={true} />

      <StatGrid />

      <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
        <ActivityFeed />
        <div className="flex flex-col gap-md">
          <ListingsSnapshot />
          <UpcomingAppointments />
        </div>
      </div>
    </div>
  );
}