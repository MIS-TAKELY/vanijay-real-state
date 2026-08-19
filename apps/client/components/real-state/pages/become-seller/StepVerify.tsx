"use client";

import { authClient } from "@repo/auth/client";
import { Button, Dialog, DialogContent, Icon } from "@repo/ui";
import { useSessionWithServer } from "components/real-state/layout/session-context";
import { PhoneVerificationModal } from "components/real-state/modals/PhoneVerificationModal";
import VerifyEmailOtp from "components/real-state/modals/VerifyEmailOtp";
import { useCallback, useState } from "react";
import type { SellerProfileView } from "lib/api/services/seller";

interface StepVerifyProps {
  requirements: SellerProfileView["requirements"];
  onRequirementsChange: (
    requirements: SellerProfileView["requirements"],
  ) => void;
}

/**
 * Step 2 — confirm the two contact prerequisites (email + phone) before the
 * user fills in their details. Reuses the existing OTP flows.
 */
export function StepVerify({
  requirements,
  onRequirementsChange,
}: StepVerifyProps) {
  const { data: session } = useSessionWithServer();
  const email = session?.user.email ?? "";

  const [emailOtpOpen, setEmailOtpOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const bothVerified =
    requirements.emailVerified && requirements.phoneVerified;

  const handleSendEmailOtp = useCallback(async () => {
    if (!email) return;
    setSendingEmail(true);
    setEmailError(null);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (error) {
        setEmailError(error.message ?? "Couldn't send the code.");
        return;
      }
      setEmailOtpOpen(true);
    } catch {
      setEmailError("Couldn't send the code. Try again.");
    } finally {
      setSendingEmail(false);
    }
  }, [email]);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h3 className="text-lg font-semibold text-on-surface">
          Verify your contact details
        </h3>
        <p className="text-sm text-on-surface-variant">
          We need a verified email and phone number before you can submit your
          seller account.
        </p>
      </div>

      <div className="flex flex-col gap-sm">
        {/* Email row */}
        <div className="flex items-center justify-between gap-sm rounded-xl border border-outline-variant bg-surface p-md">
          <div className="flex items-center gap-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
              <Icon name="mail" className="text-data-table" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-on-surface">Email</span>
              <span className="text-xs text-on-surface-variant">
                {email || "Not set"}
              </span>
            </div>
          </div>
          {requirements.emailVerified ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-primary">
              <Icon name="check_circle" className="text-data-table" />
              Verified
            </span>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendEmailOtp}
              disabled={sendingEmail || !email}
              className="rounded-md"
            >
              {sendingEmail ? "Sending…" : "Verify email"}
            </Button>
          )}
        </div>

        {/* Phone row */}
        <div className="flex items-center justify-between gap-sm rounded-xl border border-outline-variant bg-surface p-md">
          <div className="flex items-center gap-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
              <Icon name="phone" className="text-data-table" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-on-surface">Phone</span>
              <span className="text-xs text-on-surface-variant">
                WhatsApp number
              </span>
            </div>
          </div>
          {requirements.phoneVerified ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-primary">
              <Icon name="check_circle" className="text-data-table" />
              Verified
            </span>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPhoneModalOpen(true)}
              className="rounded-md"
            >
              Verify phone
            </Button>
          )}
        </div>
      </div>

      {emailError && (
        <p className="text-sm font-medium text-destructive">{emailError}</p>
      )}

      {bothVerified && (
        <div className="flex items-center gap-sm rounded-xl border border-primary/30 bg-primary/5 px-md py-sm">
          <Icon name="check_circle" className="text-data-price" />
          <p className="text-sm text-on-surface">
            All set — you can continue to your details.
          </p>
        </div>
      )}

      {/* Email OTP dialog */}
      <Dialog open={emailOtpOpen} onOpenChange={setEmailOtpOpen}>
        <DialogContent className="sm:max-w-[420px] w-full rounded-3xl border bg-background p-6 shadow-2xl">
          <VerifyEmailOtp
            email={email}
            onSuccess={() => {
              setEmailOtpOpen(false);
              onRequirementsChange({ ...requirements, emailVerified: true });
            }}
            onCancel={() => setEmailOtpOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Phone verification modal */}
      <PhoneVerificationModal
        open={phoneModalOpen}
        onOpenChange={setPhoneModalOpen}
        onVerified={() => {
          setPhoneModalOpen(false);
          onRequirementsChange({ ...requirements, phoneVerified: true });
        }}
      />
    </div>
  );
}