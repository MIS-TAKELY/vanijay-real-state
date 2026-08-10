"use client";

import { EmptyState } from "../../../common/dashboard/EmptyState";
import { Button } from "@repo/ui";
import type { FavoriteItem } from "lib/api/services/favorites/types";
import { toCardProps } from "lib/api/services/properties/types";
import Link from "next/link";
import { useState } from "react";
import { FavoriteCard } from "./FavoriteCard";

interface FavoritesGridProps {
  initialItems: FavoriteItem[];
}

export function FavoritesGrid({ initialItems }: FavoritesGridProps) {
  const [items, setItems] = useState<FavoriteItem[]>(initialItems);

  if (items.length === 0) {
    return (
      <EmptyState
        icon="favorite_border"
        title="Save listings to track price drops"
        description="Tap “Save to Favorites” on any listing to favourite it. We'll alert you when its asking price drops."
        action={
          <Button asChild className="rounded-md font-semibold">
            <Link href="/listings">Browse listings</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
      {items.map((favorite) =>
        favorite.property ? (
          <FavoriteCard
            key={favorite.id}
            favorite={favorite}
            card={toCardProps(favorite.property)}
            onRemoved={(propertyId) =>
              setItems((prev) =>
                prev.filter((item) => item.propertyId !== propertyId),
              )
            }
            onUpdated={(updated) =>
              setItems((prev) =>
                prev.map((item) =>
                  item.propertyId === updated.propertyId ? updated : item,
                ),
              )
            }
          />
        ) : null,
      )}
    </div>
  );
}
