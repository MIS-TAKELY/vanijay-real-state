import { Button, Icon } from "@repo/ui";
import Link from "next/link";
import { DashboardHeader } from "components/real-state/pages/dashboard";
import { MyListings } from "components/real-state/pages/dashboard/listings";
import { ListingsGate } from "components/real-state/pages/dashboard/listings/ListingsGate";

export default function MyListingsPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="My Listings"
        description="Manage your verified property archive — drafts, live listings and sold records."
        action={
          <Button
            asChild
            className="bg-gold text-on-gold shadow-sm hover:bg-gold/90"
          >
            <Link href="/my-listings/new">
              <Icon name="add" className="text-data-table" />
              New Listing
            </Link>
          </Button>
        }
      />

      <ListingsGate>
        <MyListings />
      </ListingsGate>
    </div>
  );
}
