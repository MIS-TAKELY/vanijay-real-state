import { DashboardHeader } from "components/pages/dashboard";
import { FavoritesGrid } from "components/pages/dashboard/favorites";
import { ApiError } from "lib/api/core/client";
import { fetchMyFavorites } from "lib/api/services/favorites";
import type { FavoriteItem } from "lib/api/services/favorites/types";
import { redirect } from "next/navigation";

export default async function FavoritesPage() {
  let items: FavoriteItem[] = [];

  try {
    items = await fetchMyFavorites();
  } catch (error) {
    // Secondary guard (the (auth) layout normally redirects first).
    if (error instanceof ApiError && error.status === 401) {
      redirect("/?auth=signin&redirect=/favorites");
    }
  }

  const savedCount = items.filter((item) => item.property).length;

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Favorites"
        description={
          savedCount > 0
            ? `${savedCount} saved listing${savedCount === 1 ? "" : "s"} — we'll notify you when a saved property drops in price.`
            : "Tracked listings with price-drop alerts — we'll notify you when a saved property drops in price."
        }
      />

      <FavoritesGrid initialItems={items} />
    </div>
  );
}
