import { EmptyState } from "../../../common/dashboard/EmptyState";
import { FAVORITE_PROPERTIES } from "./constants";
import { FavoriteCard } from "./FavoriteCard";


export function FavoritesGrid() {
  if (FAVORITE_PROPERTIES.length === 0) {
    return (
      <EmptyState
        icon="favorite_border"
        title="Save listings to track price drops"
        description="Tap the heart on any listing to favourite it. We'll alert you when its asking price drops."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
      {FAVORITE_PROPERTIES.map((property) => (
        <FavoriteCard key={property.id} property={property} />
      ))}
    </div>
  );
}
