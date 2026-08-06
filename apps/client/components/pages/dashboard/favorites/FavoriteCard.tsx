"use client";

import { Button, cn, Icon } from "@repo/ui";
import { PropertyCard } from "components/common/PropertyCard";
import { useState } from "react";
import type { FavoriteProperty } from "./constants";

interface FavoriteCardProps {
  property: FavoriteProperty;
}

export function FavoriteCard({ property }: FavoriteCardProps) {
  const [notify, setNotify] = useState(property.notifyOnPriceChange);
  const [saved, setSaved] = useState(true);

  if (!saved) return null;

  return (
    <div className="relative">
      <PropertyCard property={property} />

      {property.priceDrop ? (
        <span className="pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-md bg-tertiary px-2 py-1 text-[10px] font-bold uppercase tracking-[0.6px] text-on-tertiary shadow-sm">
          <Icon name="trending_down" filled className="text-[12px]" />
          {property.priceDrop}
        </span>
      ) : null}

      <div className="absolute right-3 bottom-34 z-10 flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          aria-pressed={notify}
          aria-label="Toggle price-change alerts"
          onClick={() => setNotify((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium shadow-sm cursor-pointer border-outline-variant",
            notify
              ? "bg-primary text-on-primary"
              : "bg-surface/95 text-on-surface-variant",
          )}
        >
          <Icon
            name={notify ? "notifications_active" : "notifications_off"}
            filled={notify}
            className="text-[14px]"
          />
          {notify ? "Alerts on" : "Alerts off"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove from favorites"
          onClick={() => setSaved(false)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface/95 border border-outline-variant text-tertiary shadow-sm hover:bg-error/10 hover:text-error hover:border-error/30 cursor-pointer"
        >
          <Icon name="favorite" filled className="text-body-lg" />
        </Button>
      </div>

      <span className="mono-stat absolute left-3 bottom-34 z-10 rounded bg-surface/90 px-1.5 py-0.5 text-[10px] text-on-surface-variant shadow-sm">
        Saved {property.savedAt}
      </span>
    </div>
  );
}
