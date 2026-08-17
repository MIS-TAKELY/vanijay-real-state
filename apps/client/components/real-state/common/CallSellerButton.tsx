"use client";

import { Button, Icon, cn, toast } from "@repo/ui";
import { ApiError } from "lib/api/core/client";
import {
  fetchSellerContact,
  trackPropertyPhoneClick,
  type SellerContact,
} from "lib/api/services/analytics";
import { useState } from "react";

interface CallSellerButtonProps {
  /** Real DB id of the listing. */
  propertyId: string;
  variant?: "ghost" | "outline" | "default";
  /** Compact gold pill for the mobile price bar — fits a fixed-height bar. */
  compact?: boolean;
  className?: string;
}

export function CallSellerButton({
  propertyId,
  variant = "outline",
  compact = false,
  className,
}: CallSellerButtonProps) {
  const [contact, setContact] = useState<SellerContact | null>(null);
  const [loading, setLoading] = useState(false);

  const reveal = async () => {
    setLoading(true);
    try {
      const next = await fetchSellerContact(propertyId);
      if (!next?.phoneNumber) {
        toast.error("This seller has not added a contact number yet");
        return;
      }
      setContact(next);
      trackPropertyPhoneClick(propertyId).catch(() => {
        // Silently fail - analytics should not break the UI
      });
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not load seller contact",
      );
    } finally {
      setLoading(false);
    }
  };

  if (contact) {
    return (
      <a
        href={`tel:${contact.phoneNumber}`}
        className={cn(
          compact
            ? "inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-md bg-gold px-4 py-2 font-semibold text-on-gold transition-colors hover:bg-gold/90"
            : "mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-outline-variant px-4 py-2 font-semibold text-on-surface transition-colors hover:bg-surface-container",
          className,
        )}
        onClick={() => trackPropertyPhoneClick(propertyId).catch(() => {})}
      >
        <Icon name="call" className="text-[18px]" />
        {contact.phoneNumber}
      </a>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => void reveal()}
      disabled={loading}
      className={cn(
        compact &&
          "min-h-11 bg-gold font-semibold text-on-gold hover:bg-gold/90",
        className,
      )}
    >
      <Icon name="PhoneCall" className="text-[18px]" />
      {loading ? "Loading…" : compact ? "Call" : "Call Seller"}
    </Button>
  );
}
