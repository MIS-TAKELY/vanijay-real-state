import type { ApiProperty } from "../properties/types";

/** One saved listing from `GET /api/v1/favorites`. */
export interface FavoriteItem {
  id: string;
  propertyId: string;
  notifyOnPriceChange: boolean;
  createdAt: string;
  /** Null when the underlying listing was deleted. */
  property: ApiProperty | null;
}

/** Response of `GET /api/v1/favorites/status/:propertyId`. */
export interface FavoriteStatus {
  isFavorite: boolean;
  notifyOnPriceChange: boolean;
}