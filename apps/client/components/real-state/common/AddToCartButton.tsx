"use client";

import { Button, Icon, cn, toast } from "@repo/ui";
import { ApiError } from "lib/api/core/client";
import { addToCart } from "lib/api/services/cart";
import { useState } from "react";
import { useRequireAuth } from "lib/hooks/use-require-auth";
import { useCartStore } from "store/cart";

interface AddToCartButtonProps {
  /** Real DB id of the listing (see `CardProperty.propertyId`). */
  propertyId: string;
  /** Listing title, used in the success toast. */
  title?: string;
  variant?: "outline" | "default" | "ghost";
  /** Renders only the cart icon — used for the compact action margin on property cards. */
  iconOnly?: boolean;
  className?: string;
}

export function AddToCartButton({
  propertyId,
  title,
  variant = "outline",
  iconOnly = false,
  className,
}: AddToCartButtonProps) {
  const { requireAuth } = useRequireAuth();
  const load = useCartStore((state) => state.load);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleClick = async () => {
    if (!requireAuth()) return;
    setLoading(true);
    try {
      await addToCart(propertyId);
      void load(); // keep the navbar badge in sync
      setAdded(true);
      toast.success(title ? `Added “${title}” to cart` : "Added to cart");
      window.setTimeout(() => setAdded(false), 2500);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not add to cart",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={iconOnly ? "ghost" : variant}
      size={iconOnly ? "icon-xl" : undefined}
      onClick={() => void handleClick()}
      disabled={loading}
      aria-live="polite"
      aria-label={iconOnly ? (added ? "Added to cart" : "Add to cart") : undefined}
      className={cn(className)}
    >
      <Icon
        name={added ? "check" : "add_shopping_cart"}
        className={iconOnly ? "text-[18px]" : "text-data-table"}
      />
      {!iconOnly && (
        <>{loading ? "Adding…" : added ? "Added to Cart" : "Add to Cart"}</>
      )}
    </Button>
  );
}
