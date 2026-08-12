"use client";

import { Button, Icon, toast } from "@repo/ui";
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
  className?: string;
}

export function SaveToFavoritesButton({
  propertyId,
  variant = "ghost",
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
        if (!cancelled) setStatus({ isFavorite: false, notifyOnPriceChange: true });
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
        toast.success("Removed from favorites");
      } else {
        const saved = await addFavorite(propertyId, true);
        setStatus({
          isFavorite: true,
          notifyOnPriceChange: saved.notifyOnPriceChange,
        });
        toast.success("Saved to favorites");
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not update favorites",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      // variant={status.isFavorite ? "default" : variant}
      variant={variant}
      onClick={() => void toggle()}
      disabled={loading}
      aria-pressed={status.isFavorite}
      aria-live="polite"
      className={className}
    >
      <Icon name="favorite" filled={status.isFavorite} className="text-[18px]" />
      {loading
        ? "Saving…"
        : status.isFavorite
          ? "Saved to Favorites"
          : "Save to Favorites"}
    </Button>
  );
}