"use client";

import {
  Icon,
  PRICE_UNITS,
  formatNPR,
  hasPricingArea,
  isBuildingType,
  pricePerUnitFor,
  priceUnitKey,
  type PriceContext,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { AddToCartButton } from "components/real-state/common/AddToCartButton";
import { CallSellerButton } from "components/real-state/common/CallSellerButton";
import { SaveToFavoritesButton } from "components/real-state/common/SaveToFavoritesButton";
import { useMemo, useState } from "react";
import { useCompareStore } from "store/compare";

interface MobilePriceBarProps {
  propertyId: string;
  title?: string;
  pricing: PriceContext;
}

/**
 * Mobile-only sticky bottom bar:
 * - Top line: Total summary (when per-unit pricing is shown)
 * - Middle: "Asking Price" label, then highlighted NPR + unit converter beside it
 * - Bottom line: Full action buttons (Call Seller, Cart, Favorite)
 *
 * Hidden on sm+ where the sidebar/grid decision card takes over.
 */
export function MobilePriceBar({
  pricing,
  propertyId,
  title,
}: MobilePriceBarProps) {
  const compareCount = useCompareStore((s) => s.items.length);
  const isBuilding = isBuildingType(pricing.subCategory);
  const showPerUnit =
    !isBuilding && hasPricingArea(pricing) && pricing.askingPrice > 0;

  const [unit, setUnit] = useState(() => priceUnitKey(pricing));
  const perUnit = useMemo(
    () => (showPerUnit ? pricePerUnitFor(pricing, unit) : null),
    [pricing, unit, showPerUnit],
  );

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant/80 bg-surface/98 shadow-[0_-6px_24px_rgba(0,0,0,0.14)] backdrop-blur-md transition-[bottom] duration-200 sm:hidden",
        compareCount >= 2 ? "bottom-[72px]" : "bottom-0",
      )}
    >
      <div className="flex flex-col gap-2.5 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.875rem)]">
        {showPerUnit && (
          <p className="text-[11px] font-medium text-on-surface-variant tabular-nums leading-none">
            Total:{" "}
            <span className="font-semibold text-navy">
              {formatNPR(pricing.askingPrice)}
            </span>
          </p>
        )}

        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            Asking Price
          </span>

          <div className="flex items-center justify-between gap-2 min-w-0">
            <p className="mono-stat text-lg font-extrabold text-gold-deep truncate leading-none">
              {showPerUnit
                ? perUnit != null
                  ? formatNPR(perUnit)
                  : "—"
                : formatNPR(pricing.askingPrice)}
            </p>

            {showPerUnit && (
              <div className="relative inline-flex shrink-0 items-center rounded-sm border border-outline-variant bg-surface-container/80 px-2 py-0.5 shadow-2xs">
                <span className="mr-1 text-[11px] font-medium text-on-surface-variant">
                  per
                </span>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  aria-label="Price unit"
                  className="cursor-pointer appearance-none bg-transparent pr-3.5 text-xs font-bold text-navy outline-none"
                >
                  {PRICE_UNITS.map((u) => (
                    <option key={u.key} value={u.key}>
                      {u.label}
                    </option>
                  ))}
                </select>
                <Icon
                  name="expand_more"
                  className="pointer-events-none absolute right-1 text-[13px] text-on-surface-variant"
                  aria-hidden
                />
              </div>
            )}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 min-w-0 pt-0.5">
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
