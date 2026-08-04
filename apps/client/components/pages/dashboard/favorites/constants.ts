/**
 * Favorites constants & mock data (DESIGN.md §5.4).
 *
 * The card shape extends `CardProperty` (from `lib/api/services/properties/types.ts`)
 * so the existing public `PropertyCard` can be reused directly, layered with
 * the favorite-specific controls (`notifyOnPriceChange`, price-drop chip,
 * remove heart). `notifyOnPriceChange` mirrors the real `Favorite` Prisma model.
 */

import {
  FALLBACK_GRADIENT,
  TYPE_GRADIENTS,
  type CardProperty,
} from "lib/api/services/properties/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface FavoriteProperty extends CardProperty {
  /** Whether the user opted in to price-change alerts (Favorite.notifyOnPriceChange). */
  notifyOnPriceChange: boolean;
  /** Price-drop label, e.g. "-8%"; null = no drop since save. */
  priceDrop: string | null;
  /** Pre-formatted "Saved" label, rendered mono. */
  savedAt: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

export const FAVORITE_PROPERTIES: FavoriteProperty[] = [
  {
    id: "bhaisepati-residential-land",
    listingCode: "LOT-442-BHA",
    title: "Bhaisepati Residential Land",
    price: "NPR 2,45,00,000",
    location: "Bhaisepati, Lalitpur",
    gradient: TYPE_GRADIENTS.RESIDENTIAL_LAND ?? FALLBACK_GRADIENT,
    meta: ["0-4-0-0 Ropani", "South facing", "20ft Pitched Road"],
    notifyOnPriceChange: true,
    priceDrop: "-8%",
    savedAt: "3d ago",
  },
  {
    id: "durbarmarg-commercial-space",
    listingCode: "KTM-209",
    title: "Durbar Marg Commercial Space",
    price: "NPR 8,95,00,000",
    location: "Durbar Marg, Kathmandu",
    gradient: TYPE_GRADIENTS.COMMERCIAL_SPACE ?? FALLBACK_GRADIENT,
    meta: ["1,200 sqft", "Main road frontage", "Corner unit"],
    notifyOnPriceChange: true,
    priceDrop: null,
    savedAt: "1w ago",
  },
  {
    id: "pulchowk-heritage-home",
    listingCode: "LAL-318",
    title: "Pulchowk Heritage Home",
    price: "NPR 6,20,00,000",
    location: "Pulchowk, Lalitpur",
    gradient: TYPE_GRADIENTS.HERITAGE_HOME ?? FALLBACK_GRADIENT,
    meta: ["3 storey", "South facing", "Traditional brick"],
    notifyOnPriceChange: false,
    priceDrop: null,
    savedAt: "2w ago",
  },
  {
    id: "pokhara-lakeside-house",
    listingCode: "PKR-551",
    title: "Pokhara Lakeside House",
    price: "NPR 4,10,00,000",
    location: "Lakeside, Pokhara",
    gradient: TYPE_GRADIENTS.RESIDENTIAL_HOUSE ?? FALLBACK_GRADIENT,
    meta: ["4 bedrooms", "Lake view", "20ft road"],
    notifyOnPriceChange: true,
    priceDrop: "-3%",
    savedAt: "1mo ago",
  },
];
