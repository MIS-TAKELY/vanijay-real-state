import { Button, Icon } from "@repo/ui";
import Link from "next/link";
import { DashboardHeader } from "components/pages/dashboard";
import { MyListings } from "components/pages/dashboard/listings";

export default function MyListingsPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="My Listings"
        description="Manage your verified property archive — drafts, live listings and sold records."
        action={
          <Button asChild>
            <Link href="/my-listings/new">
              <Icon name="add" className="text-data-table" />
              New Listing
            </Link>
          </Button>
        }
      />

      <MyListings />
    </div>
  );
}
