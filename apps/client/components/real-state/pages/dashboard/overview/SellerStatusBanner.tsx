"use client";

import { Button, Icon } from "@repo/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchSellerProfile,
  type SellerProfileView,
} from "lib/api/services/seller";

/**
 * Dashboard banner reflecting the seller registration state. Hidden for
 * approved sellers (and legacy users) so the overview stays calm.
 */
export function SellerStatusBanner() {
  const [profile, setProfile] = useState<SellerProfileView | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSellerProfile()
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch(() => {
        // Non-critical surface — stay silent on failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!profile) return null;

  const status = profile.status;

  // Approved sellers don't need a banner.
  if (status === "APPROVED") return null;

  if (status === "SUBMITTED" || status === "UNDER_REVIEW") {
    return (
      <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gold/40 border-t-2 border-t-gold/50 bg-gold/5 px-md py-sm mb-md">
        <div className="flex items-start gap-sm">
          <Icon
            name="progress_activity"
            className="text-[24px] text-gold-deep mt-0.5"
          />
          <div className="flex flex-col">
            <p className="font-body-md text-body-md text-on-surface font-medium">
              Seller application under review
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              We&apos;re reviewing your details — usually within 1–2 business
              days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isRejected = status === "REJECTED";
  const isDraft = status === "DRAFT";

  return (
    <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between rounded-xl border border-primary/30 border-t-2 border-t-primary/40 bg-primary/5 px-md py-sm mb-md">
      <div className="flex items-start gap-sm">
        <Icon
          name="storefront"
          className="text-[24px] text-primary mt-0.5"
        />
        <div className="flex flex-col">
          <p className="font-body-md text-body-md text-on-surface font-medium">
            {isRejected
              ? "Your seller application needs changes"
              : isDraft
                ? "Finish your seller application"
                : "Become a seller to list property"}
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {isRejected
              ? "Update your application and resubmit it for review."
              : isDraft
                ? "Your progress is saved — resume and submit anytime."
                : "Register as an Individual, Agent, or Organization in a few minutes."}
          </p>
        </div>
      </div>
      <Button
        asChild
        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-gold text-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gold/90"
      >
        <Link href="/become-seller">
          {isRejected
            ? "Update application"
            : isDraft
              ? "Resume application"
              : "Become a Seller"}
          <Icon name="arrow_forward" className="text-data-table" />
        </Link>
      </Button>
    </div>
  );
}