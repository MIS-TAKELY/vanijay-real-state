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
import { CallSellerButton } from "components/real-state/common/CallSellerButton";
import { WhatsAppSellerButton } from "components/real-state/common/WhatsAppSellerButton";
import { useMemo, useState } from "react";
import { useCompareStore } from "store/compare";

interface MobilePriceBarProps {
  propertyId: string;
  title?: string;
  pricing: PriceContext;
  location?: string;
}

/**
 * Mobile-only sticky bottom bar:
 * - "Asking Price" label, then highlighted NPR + unit converter beside it
 *   (per-unit by default; "Total" is an opt-in dropdown option)
 * - Bottom line: Full action buttons (Call Seller, WhatsApp)
 *
 * Hidden on sm+ where the sidebar/grid decision card takes over.
 */
export function MobilePriceBar({
  pricing,
  propertyId,
  title,
  location,
}: MobilePriceBarProps) {
  const compareCount = useCompareStore((s) => s.items.length);
  const isBuilding = isBuildingType(pricing.subCategory);
  const showPerUnit =
    !isBuilding && hasPricingArea(pricing) && pricing.askingPrice > 0;

  const [unit, setUnit] = useState(() => priceUnitKey(pricing));
  const isTotal = unit === "total";
  const perUnit = useMemo(
    () => (showPerUnit && !isTotal ? pricePerUnitFor(pricing, unit) : null),
    [pricing, unit, showPerUnit, isTotal],
  );

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant/80 bg-surface/98 shadow-[0_-6px_24px_rgba(0,0,0,0.14)] backdrop-blur-md transition-[bottom] duration-200 sm:hidden",
        compareCount >= 2 ? "bottom-[72px]" : "bottom-0",
      )}
    >
      <div className="flex flex-col gap-2.5 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.875rem)]">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <p className="mono-stat text-lg font-extrabold text-gold-deep leading-none">
            {showPerUnit
              ? isTotal
                ? formatNPR(pricing.askingPrice)
                : perUnit != null
                  ? formatNPR(perUnit)
                  : "—"
              : formatNPR(pricing.askingPrice)}
          </p>

          {showPerUnit && (
            <span className="inline-flex shrink-0 items-baseline gap-1">
              {!isTotal && (
                <span className="text-[11px] font-medium text-on-surface-variant">
                  per
                </span>
              )}
              <span className="relative inline-flex items-center">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  aria-label="Price unit"
                  className="h-6 cursor-pointer appearance-none border-0 bg-transparent py-0 pr-4 pl-0 text-xs font-bold text-navy outline-none"
                >
                  {[
                    { key: "total", label: "Total" },
                    ...PRICE_UNITS.map((u) => ({
                      key: u.key,
                      label: u.label,
                    })),
                  ].map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <Icon
                  name="expand_more"
                  className="pointer-events-none absolute right-0 text-[13px] text-on-surface-variant"
                  aria-hidden
                />
              </span>
            </span>
          )}
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 min-w-0 pt-0.5">
          <CallSellerButton
            propertyId={propertyId}
            variant="default"
            compact
            className="h-10 flex-1 min-w-0 rounded-sm bg-gold text-on-gold font-semibold text-xs shadow-xs hover:bg-gold/90"
          />
          <WhatsAppSellerButton
            propertyId={propertyId}
            title={title}
            price={
              pricing.askingPrice > 0
                ? formatNPR(pricing.askingPrice)
                : undefined
            }
            location={location}
            compact
            className="h-10 flex-1 min-w-0 rounded-sm bg-[#25D366] text-white font-semibold text-xs shadow-xs hover:bg-[#20bd5a]"
          />
        </div>
      </div>
    </div>
  );
}
