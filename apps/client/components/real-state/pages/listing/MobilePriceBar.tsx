"use client";

import { cn } from "@repo/ui";
import { AddToCartButton } from "components/real-state/common/AddToCartButton";
import { CallSellerButton } from "components/real-state/common/CallSellerButton";
import { SaveToFavoritesButton } from "components/real-state/common/SaveToFavoritesButton";
import { useCompareStore } from "store/compare";

interface MobilePriceBarProps {
  /** Formatted asking price, e.g. "NPR 85,00,000". */
  askingPrice: string;
  propertyId: string;
  title?: string;
}

/**
 * Mobile-only sticky bottom bar: 2-row layout
 * - Row 1: Asking Price
 * - Row 2: Primary CTAs (Call Seller, Add to Cart, Save to Favorites)
 *
 * Hidden on lg+ where the sticky decision card takes over.
 */
export function MobilePriceBar({
  askingPrice,
  propertyId,
  title,
}: MobilePriceBarProps) {
  const compareCount = useCompareStore((s) => s.items.length);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-surface/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md transition-[bottom] duration-200 lg:hidden",
        compareCount >= 2 ? "bottom-[72px]" : "bottom-0",
      )}
    >
      <div className="flex flex-col gap-2 px-4 pt-2.5 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        {/* Row 1: Asking Price */}
        <div className="flex items-center justify-between min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Asking Price
          </span>
          <p className="mono-stat text-base font-bold text-gold-deep truncate">
            {askingPrice}
          </p>
        </div>

        {/* Row 2: CTAs (Call, Cart, Fav) */}
        <div className="flex items-center gap-2 min-w-0">
          <CallSellerButton
            propertyId={propertyId}
            variant="default"
            className="h-10 flex-1 min-w-0 rounded-sm bg-gold text-on-gold font-semibold text-xs shadow-xs hover:bg-gold/90"
          />
          <AddToCartButton
            propertyId={propertyId}
            title={title}
            variant="outline"
            compact
            className="h-10 shrink-0 rounded-sm border-outline-variant px-3 text-xs font-semibold"
          />
          <SaveToFavoritesButton
            propertyId={propertyId}
            variant="outline"
            compact
            className="h-10 shrink-0 rounded-sm border-outline-variant px-3 text-xs font-semibold"
          />
        </div>
      </div>
    </div>
  );
}
