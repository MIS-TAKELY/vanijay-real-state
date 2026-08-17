"use client";

import { Button, Icon, Skeleton } from "@repo/ui";
import { useSessionWithServer } from "components/real-state/layout/session-context";
import { PhoneVerificationModal } from "components/real-state/modals/PhoneVerificationModal";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

export function ListingsGate({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSessionWithServer();
  const [modalOpen, setModalOpen] = useState(true);

  if (isPending) {
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

  const sessionUser = session?.user as unknown as
    | { role?: string[]; phoneNumberVerified?: boolean }
    | undefined;
  const roles: Array<string> = Array.isArray(sessionUser?.role)
    ? (sessionUser.role as string[])
    : [];
  const phoneVerified = sessionUser?.phoneNumberVerified === true;
  const canAccess =
    phoneVerified && roles.includes("BUYER") && roles.includes("SELLER");

  if (canAccess) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex flex-col items-center gap-md rounded-2xl border border-outline-variant bg-surface p-xl text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon name="verified" className="text-data-price" />
        </span>
        <h2 className="font-headline-md text-xl font-semibold text-on-surface">
          Verify your number to manage listings
        </h2>
        <p className="max-w-full text-sm leading-6 text-on-surface-variant">
          Adding and viewing your property listings requires a verified WhatsApp
          number. Verify now to unlock the listings section.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-sm">
          <Button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-md"
          >
            <Icon name="chat" className="text-data-table" />
            Verify with WhatsApp
          </Button>
          <Button asChild variant="outline" className="rounded-md">
            <Link href="/dashboard">
              <Icon name="chevron_left" className="text-data-table" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <PhoneVerificationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onVerified={() => {
          setModalOpen(false);
        }}
      />
    </>
  );
}
