"use client";

import { Button, cn, Icon, toast } from "@repo/ui";
import { ApiError } from "lib/api/core/client";
import {
  addFavorite,
  fetchFavoriteStatus,
  removeFavorite,
} from "lib/api/services/favorites";
import type { FavoriteStatus } from "lib/api/services/favorites/types";
import { useEffect, useState } from "react";
import { useRequireAuth } from "lib/hooks/use-require-auth";

interface SaveToFavoritesButtonProps {
  /** Real DB id of the listing. */
  propertyId: string;
  variant?: "ghost" | "outline" | "default";
  /** Renders only the heart icon — used as a media overlay on property cards. */
  iconOnly?: boolean;
  /** Fired with the new state after a successful toggle (keeps parents in sync). */
  onChange?: (isFavorite: boolean) => void;
  className?: string;
}

export function SaveToFavoritesButton({
  propertyId,
  variant = "ghost",
  iconOnly = false,
  onChange,
  className,
}: SaveToFavoritesButtonProps) {
  const { isSignedIn, sessionReady, requireAuth } = useRequireAuth();
  const [status, setStatus] = useState<FavoriteStatus>({
    isFavorite: false,
    notifyOnPriceChange: true,
  });
  const [loading, setLoading] = useState(false);

  // Load the current saved state once the session resolves (only for signed-in
  // users — guests start as "not saved" and get sent to sign-in on click).
  useEffect(() => {
    if (!sessionReady) return;
    if (!isSignedIn) return;
    let cancelled = false;
    fetchFavoriteStatus(propertyId)
      .then((next) => {
        if (!cancelled) setStatus(next);
      })
      .catch(() => {
        if (!cancelled)
          setStatus({ isFavorite: false, notifyOnPriceChange: true });
      });
    return () => {
      cancelled = true;
    };
  }, [propertyId, isSignedIn, sessionReady]);

  const toggle = async () => {
    if (!requireAuth()) return;
    setLoading(true);
    try {
      if (status.isFavorite) {
        await removeFavorite(propertyId);
        setStatus({ isFavorite: false, notifyOnPriceChange: true });
        onChange?.(false);
        toast.success("Removed from favorites");
      } else {
        const saved = await addFavorite(propertyId, true);
        setStatus({
          isFavorite: true,
          notifyOnPriceChange: saved.notifyOnPriceChange,
        });
        onChange?.(true);
        toast.success("Saved to favorites");
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not update favorites",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={iconOnly ? "ghost" : variant}
      size={iconOnly ? "icon" : "default"}
      onClick={() => void toggle()}
      disabled={loading}
      aria-pressed={status.isFavorite}
      aria-label={
        iconOnly
          ? status.isFavorite
            ? "Remove from favorites"
            : "Save to favorites"
          : undefined
      }
      aria-live="polite"
      className={cn(
        className,
        iconOnly && status.isFavorite && "text-tertiary",
      )}
    >
      <Icon
        name="favorite"
        filled={status.isFavorite}
        className={cn("text-[18px]", iconOnly && "text-[20px]")}
      />
      {!iconOnly &&
        (loading
          ? "Saving…"
          : status.isFavorite
            ? "Saved to Favorites"
            : "Save to Favorites")}
    </Button>
  );
}
