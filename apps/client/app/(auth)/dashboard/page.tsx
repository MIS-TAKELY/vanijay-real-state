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
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Overview"
        description="Your archive at a glance — listings, inquiries and verification status."
        action={
          <Button asChild>
            <Link href="/my-listings/new">
              <Icon name="add" className="text-data-table" />
              New Listing
            </Link>
          </Button>
        }
      />

      <GreetingRow name="Aayush" verificationLevel={3} />

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
