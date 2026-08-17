import { Button, Icon } from "@repo/ui";
import { DashboardHeader } from "components/real-state/pages/dashboard";
import { SavedSearchList } from "components/real-state/pages/dashboard/saved-searches";
import { ApiError } from "lib/api/core/client";
import { fetchMySavedSearches } from "lib/api/services/saved-searches";
import type { SavedSearchItem } from "lib/api/services/saved-searches/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SavedSearchesPage() {
  let items: SavedSearchItem[] = [];

  try {
    items = await fetchMySavedSearches();
  } catch (error) {
    // Secondary guard (the (auth) layout normally redirects first).
    if (error instanceof ApiError && error.status === 401) {
      redirect("/?auth=signin&redirect=/saved-searches");
    }
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Saved Searches"
        description="Get alerted the moment a new property matches your saved criteria."
        action={
          <Button asChild variant="outline">
            <Link href="/search">
              <Icon name="search" className="text-data-table" />
              New Search
            </Link>
          </Button>
        }
      />

      <SavedSearchList initialItems={items} />
    </div>
  );
}
