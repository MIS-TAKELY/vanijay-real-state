"use client";

import { Button, Icon } from "@repo/ui";
import Link from "next/link";
import type { SellerProfileView } from "lib/api/services/seller";
import { getAccountType, getSubTypeLabel } from "./constants";

interface SellerSubmittedProps {
  profile: SellerProfileView;
}

/**
 * Shown after submission (or when revisiting with an already-submitted /
 * approved registration). Calm, single-column status card.
 */
export function SellerSubmitted({ profile }: SellerSubmittedProps) {
  const approved = profile.status === "APPROVED";
  const type = getAccountType(profile.accountType);
  const subTypeLabel = getSubTypeLabel(profile.accountType, profile.subType);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-md rounded-2xl border border-outline-variant bg-surface p-xl text-center">
      <span
        className={
          approved
            ? "flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
            : "flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold-deep"
        }
      >
        <Icon
          name={approved ? "verified" : "progress_activity"}
          className="text-[32px]"
        />
      </span>

      <h2 className="font-headline-md text-2xl font-semibold text-on-surface">
        {approved ? "You're a seller!" : "Application submitted"}
      </h2>

      <p className="max-w-md text-sm leading-6 text-on-surface-variant">
        {approved
          ? "Your seller account is active. You can now create and manage property listings."
          : "Thanks! Our team will review your application. We'll let you know once it's approved — this usually takes 1–2 business days."}
      </p>

      <div className="flex flex-col gap-xs rounded-xl border border-outline-variant bg-surface-container/40 px-md py-sm text-left">
        <p className="text-xs text-on-surface-variant">Account type</p>
        <p className="text-sm font-medium text-on-surface">
          {type?.label ?? "—"}
          {subTypeLabel ? ` · ${subTypeLabel}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-sm">
        {approved ? (
          <Button
            asChild
            className="rounded-md bg-gold text-on-gold hover:bg-gold/90"
          >
            <Link href="/my-listings/new">
              <Icon name="add" className="text-data-table" />
              Create your first listing
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="outline" className="rounded-md">
          <Link href="/dashboard">
            <Icon name="chevron_left" className="text-data-table" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}