import type { ApiProperty } from "../properties/types";

/** One saved listing row from `GET /api/v1/cart`. */
export interface CartItem {
  id: string;
  propertyId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  /** Null when the underlying listing was deleted. */
  property: ApiProperty | null;
  /** quantity × asking price; null when the property is missing. */
  subtotal: number | null;
}

/** Response of `GET /api/v1/cart/count` (sum of quantities). */
export interface CartCount {
  count: number;
}