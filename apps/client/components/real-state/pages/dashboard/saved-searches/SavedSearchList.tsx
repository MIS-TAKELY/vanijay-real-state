import { EmptyState } from "components/real-state/layout/dashboard/EmptyState";
import { SAVED_SEARCHES } from "./constants";
import { SavedSearchCard } from "./SavedSearchCard";

export function SavedSearchList() {
  if (SAVED_SEARCHES.length === 0) {
    return (
      <EmptyState
        icon="bookmark"
        title="No saved searches yet"
        description="Save a search from the listings page to get alerts when new matching properties are verified."
      />
    );
  }

  return (
    <div className="flex flex-col gap-md">
      {SAVED_SEARCHES.map((search) => (
        <SavedSearchCard key={search.id} search={search} />
      ))}
    </div>
  );
}
