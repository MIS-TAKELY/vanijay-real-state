"use client";

import { Button, Icon, cn, toast } from "@repo/ui";
import { ApiError } from "lib/api/core/client";
import {
  fetchSellerContact,
  trackPropertyPhoneClick,
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
  const [loading, setLoading] = useState(false);

  const handleCall = async () => {
    setLoading(true);
    try {
      const contact = await fetchSellerContact(propertyId);
      if (!contact?.phoneNumber) {
        toast.error("This seller has not added a contact number yet");
        return;
      }
      trackPropertyPhoneClick(propertyId).catch(() => {
        // Silently fail - analytics should not break the UI
      });
      window.location.href = `tel:${contact.phoneNumber}`;
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

  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => void handleCall()}
      disabled={loading}
      className={cn(
        compact &&
          "min-h-11 bg-gold font-semibold text-on-gold hover:bg-gold/90",
        className,
      )}
    >
      <Icon name="PhoneCall" className="text-[18px]" />
      {loading ? "Connecting…" : compact ? "Call" : "Call Seller"}
    </Button>
  );
}
