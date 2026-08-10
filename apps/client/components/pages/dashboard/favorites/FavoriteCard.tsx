"use client";

import { Button, cn, Icon, toast } from "@repo/ui";
import { PropertyCard } from "components/common/PropertyCard";
import { ApiError } from "lib/api/core/client";
import {
  removeFavorite,
  updateFavoriteNotify,
} from "lib/api/services/favorites";
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
      const updated = await updateFavoriteNotify(
        favorite.propertyId,
        !notify,
      );
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

  const handleRemove = async () => {
    setBusy(true);
    try {
      await removeFavorite(favorite.propertyId);
      setSaved(false);
      onRemoved(favorite.propertyId);
      toast.success("Removed from favorites");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not remove favorite",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <PropertyCard property={card} />

      <div className="absolute right-3 bottom-34 z-10 flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          aria-pressed={notify}
          aria-label="Toggle price-change alerts"
          onClick={() => void toggleNotify()}
          disabled={busy}
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
          onClick={() => void handleRemove()}
          disabled={busy}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface/95 border border-outline-variant text-tertiary shadow-sm hover:bg-error/10 hover:text-error hover:border-error/30 cursor-pointer"
        >
          <Icon name="favorite" filled className="text-body-lg" />
        </Button>
      </div>

      <span className="mono-stat absolute left-3 bottom-34 z-10 rounded bg-surface/90 px-1.5 py-0.5 text-[10px] text-on-surface-variant shadow-sm">
        Saved {timeAgo(favorite.createdAt)}
      </span>
    </div>
  );
}
