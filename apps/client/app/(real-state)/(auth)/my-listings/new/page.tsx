import { Button, Icon } from "@repo/ui";
import { DashboardHeader } from "components/real-state/pages/dashboard";
import { ListingWizard } from "components/real-state/pages/dashboard/listings/new";
import { ListingsGate } from "components/real-state/pages/dashboard/listings/ListingsGate";

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  const isEdit = Boolean(slug);

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title={isEdit ? "Edit Listing" : "New Listing"}
        description={
          isEdit
            ? "Update your listing details. Changes go live immediately and reset the listing to unverified until our team re-reviews it."
            : "Create a property listing in 5 steps. It publishes to the public feed immediately as unverified, then our team verifies it."
        }
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
        <ListingWizard editSlug={slug} />
      </ListingsGate>
    </div>
  );
}