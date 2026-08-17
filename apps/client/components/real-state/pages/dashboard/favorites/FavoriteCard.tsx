"use client";

import { Button, cn, Icon, toast } from "@repo/ui";
import { PropertyCard } from "components/real-state/common/PropertyCard";
import { ApiError } from "lib/api/core/client";
import { updateFavoriteNotify } from "lib/api/services/favorites";
import type { FavoriteItem } from "lib/api/services/favorites/types";
import type { CardProperty } from "lib/api/services/properties/types";
import { useState } from "react";

interface FavoriteCardProps {
  favorite: FavoriteItem;
  card: CardProperty;
  onRemoved: (propertyId: string) => void;
  onUpdated: (favorite: FavoriteItem) => void;
}

/** "3d ago"-style relative time for the saved stamp. */
function timeAgo(iso: string): string {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000),
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function FavoriteCard({
  favorite,
  card,
  onRemoved,
  onUpdated,
}: FavoriteCardProps) {
  const [notify, setNotify] = useState(favorite.notifyOnPriceChange);
  const [saved, setSaved] = useState(true);
  const [busy, setBusy] = useState(false);

  if (!saved) return null;

  const toggleNotify = async () => {
    setBusy(true);
    try {
      const updated = await updateFavoriteNotify(favorite.propertyId, !notify);
      setNotify(updated.notifyOnPriceChange);
      onUpdated(updated);
      toast.success(
        updated.notifyOnPriceChange
          ? "Price-change alerts on"
          : "Price-change alerts off",
      );
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not update alerts",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <PropertyCard
        property={card}
        onFavoriteChange={(isFavorite) => {
          if (!isFavorite) {
            setSaved(false);
            onRemoved(favorite.propertyId);
          }
        }}
      />

      <div className="flex items-center justify-between gap-2 rounded-xl border border-outline-variant border-t-2 border-t-gold/30 bg-surface-container-low px-3 py-2">
        <span className="mono-stat text-[11px] text-on-surface-variant">
          Saved {timeAgo(favorite.createdAt)}
        </span>

        <Button
          type="button"
          variant="ghost"
          aria-pressed={notify}
          aria-label="Toggle price-change alerts"
          onClick={() => void toggleNotify()}
          disabled={busy}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium shadow-sm cursor-pointer border",
            notify
              ? "border-gold/50 bg-gold text-on-gold"
              : "border-outline-variant bg-surface text-on-surface-variant",
          )}
        >
          <Icon
            name={notify ? "notifications_active" : "notifications_off"}
            filled={notify}
            className="text-[14px]"
          />
          {notify ? "Alerts on" : "Alerts off"}
        </Button>
      </div>
    </div>
  );
}
