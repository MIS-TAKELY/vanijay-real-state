"use client";

import { Button, Icon, Skeleton } from "@repo/ui";
import { useSessionWithServer } from "components/real-state/layout/session-context";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  fetchSellerProfile,
  type SellerProfileView,
} from "lib/api/services/seller";

/**
 * Gates the listings section on seller registration status.
 *
 * - APPROVED (or legacy users who already hold the SELLER role with a
 *   verified phone) → render children.
 * - No registration / DRAFT / REJECTED → CTA to (re)start the wizard.
 * - SUBMITTED / UNDER_REVIEW → calm "we're reviewing" notice.
 */
export function ListingsGate({ children }: { children: ReactNode }) {
  const { data: session } = useSessionWithServer();
  const [profile, setProfile] = useState<SellerProfileView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSellerProfile()
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch((e) => {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : "Failed to check your seller status.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-md">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-16 w-full rounded-xl border border-outline-variant bg-surface"
          />
        ))}
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error ?? "Something went wrong. Please refresh and try again."}
      </div>
    );
  }

  const status = profile.status;

  // Approved sellers get straight through.
  if (status === "APPROVED") {
    return <>{children}</>;
  }

  // Legacy users: registered via the old one-shot flow, so they hold the
  // SELLER role but have no SellerProfile. Let them through unchanged.
  const sessionUser = session?.user as unknown as
    | { role?: string[] }
    | undefined;
  const roles: string[] = Array.isArray(sessionUser?.role)
    ? (sessionUser.role as string[])
    : [];
  if (!profile.exists && roles.includes("SELLER")) {
    return <>{children}</>;
  }

  // Pending review — calm notice, no actions needed from the user.
  if (status === "SUBMITTED" || status === "UNDER_REVIEW") {
    return (
      <div className="flex flex-col items-center gap-md rounded-2xl border border-outline-variant bg-surface p-xl text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold-deep">
          <Icon name="progress_activity" className="text-data-price" />
        </span>
        <h2 className="font-headline-md text-xl font-semibold text-on-surface">
          Your seller application is under review
        </h2>
        <p className="max-w-full text-sm leading-6 text-on-surface-variant">
          Our team is reviewing your details. You&apos;ll be able to manage
          listings as soon as your account is approved — usually within 1–2
          business days.
        </p>
        <Button asChild variant="outline" className="rounded-md">
          <Link href="/dashboard">
            <Icon name="chevron_left" className="text-data-table" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  // Not started, draft in progress, or rejected — send (back) to the wizard.
  const isRejected = status === "REJECTED";
  const isDraft = status === "DRAFT";

  return (
    <div className="flex flex-col items-center gap-md rounded-2xl border border-outline-variant bg-surface p-xl text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon name="storefront" className="text-data-price" />
      </span>
      <h2 className="font-headline-md text-xl font-semibold text-on-surface">
        {isRejected
          ? "Your application needs changes"
          : isDraft
            ? "Finish setting up your seller account"
            : "Set up your seller account to manage listings"}
      </h2>
      <p className="max-w-full text-sm leading-6 text-on-surface-variant">
        {isRejected
          ? `Our team sent it back with a note: “${profile.rejectionReason ?? "Please review your details."}” Update your application and resubmit.`
          : isDraft
            ? "Your progress is saved — pick up where you left off and submit your application."
            : "Register as an Individual, Agent, or Organization to unlock the listings section. It only takes a few minutes."}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-sm">
        <Button asChild className="rounded-md">
          <Link href="/become-seller">
            <Icon name="arrow_forward" className="text-data-table" />
            {isRejected
              ? "Update application"
              : isDraft
                ? "Resume application"
                : "Become a Seller"}
          </Link>
        </Button>
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
