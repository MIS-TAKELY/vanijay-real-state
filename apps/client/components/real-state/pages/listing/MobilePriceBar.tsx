"use client";

import { cn } from "@repo/ui";
import { CallSellerButton } from "components/real-state/common/CallSellerButton";
import { SaveToFavoritesButton } from "components/real-state/common/SaveToFavoritesButton";
import { useCompareStore } from "store/compare";

interface MobilePriceBarProps {
  /** Formatted asking price, e.g. "NPR 85,00,000". */
  askingPrice: string;
  propertyId: string;
}

/**
 * Mobile-only sticky bottom bar: price + primary actions so a buyer never has
 * to scroll past description/specs/location to reach the money CTA.
 *
 * Hidden on lg+ where the sticky decision card takes over. The compare bar
 * (`CompareBar`) is also fixed to the bottom at z-50, so when the compare
 * tray is active (2+ items) this bar raises itself above it.
 */
export function MobilePriceBar({
  askingPrice,
  propertyId,
}: MobilePriceBarProps) {
  const compareCount = useCompareStore((s) => s.items.length);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-surface/95 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-[bottom] duration-200 lg:hidden",
        compareCount >= 2 ? "bottom-[72px]" : "bottom-0",
      )}
    >
      <div className="flex items-center gap-2 px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3">
        <p className="mono-stat min-w-0 flex-1 truncate text-base font-bold text-gold-deep">
          {askingPrice}
        </p>
        <SaveToFavoritesButton
          propertyId={propertyId}
          iconOnly
          size="icon-xl"
          variant="ghost"
          className="shrink-0"
        />
        <CallSellerButton propertyId={propertyId} compact className="shrink-0" />
      </div>
    </div>
  );
}
