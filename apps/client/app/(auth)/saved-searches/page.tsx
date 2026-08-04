import { Button, Icon } from "@repo/ui";
import { DashboardHeader } from "components/pages/dashboard";
import { SavedSearchList } from "components/pages/dashboard/saved-searches";
import Link from "next/link";

export default function SavedSearchesPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Saved Searches"
        description="Get alerted the moment a new property matches your saved criteria."
        action={
          <Button asChild variant="outline">
            <Link href="/listings">
              <Icon name="search" className="text-data-table" />
              New Search
            </Link>
          </Button>
        }
      />

      <SavedSearchList />
    </div>
  );
}
