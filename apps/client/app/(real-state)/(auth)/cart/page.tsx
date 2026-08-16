import { DashboardHeader } from "components/real-state/pages/dashboard";
import { CartClient } from "components/real-state/pages/dashboard/cart";
import { ApiError } from "lib/api/core/client";
import { fetchCart } from "lib/api/services/cart";
import type { CartItem } from "lib/api/services/cart/types";
import { redirect } from "next/navigation";

export default async function CartPage() {
  let items: CartItem[] = [];

  try {
    items = await fetchCart();
  } catch (error) {
    // Secondary guard (the (auth) layout normally redirects first).
    if (error instanceof ApiError && error.status === 401) {
      redirect("/?auth=signin&redirect=/cart");
    }
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Saved Cart"
        description="Your shortlisted properties, ready to compare before you inquire."
      />
      <CartClient initialItems={items} />
    </div>
  );
}
