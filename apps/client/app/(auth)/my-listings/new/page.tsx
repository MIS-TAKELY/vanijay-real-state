import { Button, Icon } from "@repo/ui";
import { DashboardHeader } from "components/pages/dashboard";
import { ListingWizard } from "components/pages/dashboard/listings/new";
import { ListingsGate } from "components/pages/dashboard/listings/ListingsGate";

export default function NewListingPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="New Listing"
        description="Create a verified property listing in 5 steps. You can save a draft and finish later."
        action={
          <Button asChild variant="outline">
            <a href="/my-listings">
              <Icon name="chevron_left" className="text-data-table" />
              Back to My Listings
            </a>
          </Button>
        }
      />

      <ListingsGate>
        <ListingWizard />
      </ListingsGate>
    </div>
  );
}