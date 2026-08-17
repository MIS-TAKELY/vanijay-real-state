"use client";

import { Button, toast } from "@repo/ui";
import { EmptyState } from "components/real-state/layout/dashboard/EmptyState";
import { ApiError } from "lib/api/core/client";
import { removeFromCart, updateCartQuantity } from "lib/api/services/cart";
import type { CartItem } from "lib/api/services/cart/types";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCartStore } from "store/cart";
import { CartRow } from "./CartRow";

const MAX_QTY = 99;

interface CartClientProps {
  initialItems: CartItem[];
}

export function CartClient({ initialItems }: CartClientProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [busy, setBusy] = useState<string | null>(null);
  const refreshCount = useCartStore((state) => state.load);

  const available = useMemo(
    () => items.filter((item) => item.property),
    [items],
  );
  const unavailableCount = items.length - available.length;

  if (!items.length) {
    return (
      <EmptyState
        icon="add_shopping_cart"
        title="Your cart is empty"
        description="Tap “Add to Cart” on any listing to shortlist it here."
        action={
          <Button
            asChild
            className="rounded-md bg-gold font-semibold text-on-gold hover:bg-gold/90"
          >
            <Link href="/">Browse listings</Link>
          </Button>
        }
      />
    );
  }

  const changeQuantity = async (item: CartItem, quantity: number) => {
    if (quantity < 1 || quantity > MAX_QTY) return;
    setBusy(item.propertyId);
    try {
      const updated = await updateCartQuantity(item.propertyId, quantity);
      setItems((prev) =>
        prev.map((row) => (row.propertyId === item.propertyId ? updated : row)),
      );
      void refreshCount();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not update quantity",
      );
    } finally {
      setBusy(null);
    }
  };

  const remove = async (item: CartItem) => {
    setBusy(item.propertyId);
    try {
      await removeFromCart(item.propertyId);
      setItems((prev) =>
        prev.filter((row) => row.propertyId !== item.propertyId),
      );
      void refreshCount();
      toast.success("Removed from cart");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not remove item",
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-lg">
      <div className="space-y-sm">
        {available.map((item) => (
          <CartRow
            key={item.propertyId}
            item={item}
            busy={busy === item.propertyId}
            onQuantity={(quantity) => void changeQuantity(item, quantity)}
            onRemove={() => void remove(item)}
          />
        ))}

        {unavailableCount > 0 && (
          <p className="rounded-lg bg-surface-container p-3 text-sm text-on-surface-variant">
            {unavailableCount} listing{unavailableCount === 1 ? "" : "s"} in
            your cart {unavailableCount === 1 ? "is" : "are"} no longer
            available and will be removed when you update the cart.
          </p>
        )}
      </div>
    </div>
  );
}
