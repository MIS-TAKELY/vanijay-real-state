import { Button, Icon } from "@repo/ui";
import { DashboardHeader } from "components/pages/dashboard";
import { ListingWizard } from "components/pages/dashboard/listings/new";
import { ListingsGate } from "components/pages/dashboard/listings/ListingsGate";

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
            ? "Update your listing details. Changes are saved as a draft and you can re-submit for verification."
            : "Create a verified property listing in 5 steps. You can save a draft and finish later."
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