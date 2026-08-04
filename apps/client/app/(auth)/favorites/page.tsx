import { DashboardHeader } from "components/pages/dashboard";
import { FavoritesGrid } from "components/pages/dashboard/favorites";

export default function FavoritesPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Favorites"
        description="Tracked listings with price-drop alerts — we'll notify you when a saved property drops in price."
      />

      <FavoritesGrid />
    </div>
  );
}
