"use client";

import { useSession } from "@repo/auth/client";
import { Button, Icon } from "@repo/ui";
import { PhoneVerificationModal } from "components/real-state/modals/PhoneVerificationModal";
import { useEffect, useState } from "react";

interface VerificationBannerProps {
  show?: boolean;
}

export function VerificationBanner({ show = true }: VerificationBannerProps) {
  const { data: session, isPending } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!show || isPending || !mounted) return null;

  const phoneNumberVerified = session?.user?.phoneNumberVerified === true;
  const hasPhoneNumber = Boolean(session?.user?.phoneNumber);

  if (phoneNumberVerified || !hasPhoneNumber) return null;

  return (
    <>
      <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#b45309]/30 bg-[#b45309]/5 px-md py-sm mb-md">
        <div className="flex items-start gap-sm">
          <Icon
            name="gpp_maybe"
            filled
            className="text-[24px] text-[#b45309] mt-0.5"
          />
          <div className="flex flex-col">
            <p className="font-body-md text-body-md text-on-surface font-medium">
              Complete number verification to list property
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Verify your number to reach Level 2 and unlock listing creation.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#b45309] text-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#92400e]"
        >
          Verify number
          <Icon name="arrow_forward" className="text-data-table" />
        </Button>
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
