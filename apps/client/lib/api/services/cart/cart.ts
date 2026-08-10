import { apiFetch } from "../../core/client";
import { API_ENDPOINTS } from "../../core/endpoints";
import type { CartCount, CartItem } from "./types";

/** All listings in the signed-in user's cart. */
export function fetchCart(): Promise<CartItem[]> {
  return apiFetch<CartItem[]>(API_ENDPOINTS.cart.base);
}

/** Total number of items in the cart (sum of quantities). */
export function fetchCartCount(): Promise<CartCount> {
  return apiFetch<CartCount>(API_ENDPOINTS.cart.count);
}

/** Add a listing to the cart. Re-adding increments the existing quantity. */
export function addToCart(
  propertyId: string,
  quantity = 1,
): Promise<CartItem> {
  return apiFetch<CartItem>(API_ENDPOINTS.cart.base, {
    method: "POST",
    body: { propertyId, quantity },
  });
}

export function updateCartQuantity(
  propertyId: string,
  quantity: number,
): Promise<CartItem> {
  return apiFetch<CartItem>(API_ENDPOINTS.cart.byProperty(propertyId), {
    method: "PATCH",
    body: { quantity },
  });
}

export function removeFromCart(
  propertyId: string,
): Promise<{ removed: boolean }> {
  return apiFetch<{ removed: boolean }>(
    API_ENDPOINTS.cart.byProperty(propertyId),
    { method: "DELETE" },
  );
}