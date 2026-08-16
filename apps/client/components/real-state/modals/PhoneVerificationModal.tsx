"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui";
import { authClient } from "@repo/auth/client";
import { checkPhoneRegistered, registerSeller } from "lib/api/services/seller";
import { Loader2, MessageCircle, Phone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PhoneVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 90;

export function PhoneVerificationModal({
  open,
  onOpenChange,
  onVerified,
}: PhoneVerificationModalProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);

  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [step, secondsLeft]);

  // Reset the flow whenever the modal is (re)opened.
  useEffect(() => {
    if (open) {
      setPhone("");
      setOtp("");
      setStep("phone");
      setError(null);
      setSecondsLeft(COUNTDOWN_SECONDS);
    }
  }, [open]);

  const isComplete = otp.length === OTP_LENGTH;

  const handleSend = useCallback(async () => {
    const normalized = phone.trim();
    if (!normalized || sending) return;

    setSending(true);
    setError(null);
    try {
      // If the number is already registered to an account, don't send an OTP —
      // surface the error right here instead of failing after entering the code.
      const { registered } = await checkPhoneRegistered(normalized);
      if (registered) {
        setError(
          "This number is already registered to an account. Please use a different number.",
        );
        return;
      }

      // Sends the OTP through the WhatsApp gateway (see packages/auth).
      const { error: sendError } = await authClient.phoneNumber.sendOtp({
        phoneNumber: normalized,
      });
      if (sendError) {
        setError(sendError.message ?? "Couldn't send the verification code.");
        return;
      }
      setStep("otp");
      setSecondsLeft(COUNTDOWN_SECONDS);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSending(false);
    }
  }, [phone, sending]);

  const handleVerify = useCallback(async () => {
    if (!isComplete || verifying) return;
    const normalized = phone.trim();

    setVerifying(true);
    setError(null);
    try {
      // updatePhoneNumber attaches the number to the logged-in user and marks
      // it verified, creating a fresh session for them.
      const { error: verifyError } = await authClient.phoneNumber.verify({
        phoneNumber: normalized,
        code: otp,
        updatePhoneNumber: true,
      });
      if (verifyError) {
        setError(verifyError.message ?? "Invalid or expired code. Try again.");
        setOtp("");
        return;
      }

      // Registering as a seller makes the user a registered buyer AND seller,
      // which unlocks the full listings section.
      await registerSeller({ agreedToTerms: true });
      await authClient.getSession();

      successTimeoutRef.current = setTimeout(onVerified, 700);
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  }, [isComplete, verifying, phone, otp, onVerified]);

  const handleResend = useCallback(async () => {
    if (secondsLeft > 0 || isResending) return;

    setIsResending(true);
    setError(null);
    try {
      const { error: sendError } = await authClient.phoneNumber.sendOtp({
        phoneNumber: phone.trim(),
      });
      if (sendError) {
        setError(sendError.message ?? "Couldn't resend the code.");
        return;
      }
      setOtp("");
      setSecondsLeft(COUNTDOWN_SECONDS);
    } catch {
      setError("Couldn't resend the code. Try again.");
    } finally {
      setIsResending(false);
    }
  }, [secondsLeft, isResending, phone]);

  const isOtpLocked = step === "otp";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        // Never dismiss mid-verification so an in-progress code isn't lost.
        if (!v && isOtpLocked) return;
        onOpenChange(v);
      }}
    >
      <DialogContent
        className="sm:max-w-[460px] w-full p-6 sm:p-7 gap-6 rounded-3xl border bg-background shadow-2xl overflow-hidden"
        onOpenAutoFocus={(e) => {
          if (isOtpLocked) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (isOtpLocked) e.preventDefault();
        }}
        onFocusOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isOtpLocked) e.preventDefault();
        }}
      >
        {step === "phone" ? (
          <>
            <DialogHeader className="flex flex-col items-center text-center space-y-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                <Phone className="h-7 w-7" />
              </span>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                Verify your number
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-muted-foreground">
                Adding and viewing listings requires a verified phone number.
                We&apos;ll send a one-time code to your WhatsApp.
              </DialogDescription>
            </DialogHeader>

            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="phone-number"
                  className="text-sm font-medium text-foreground"
                >
                  WhatsApp number
                </label>
                <Input
                  id="phone-number"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="e.g. +977 98XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-xl bg-muted/30 px-3"
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                disabled={!phone.trim() || sending}
                className="h-11 w-full rounded-xl font-semibold shadow-md"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    Send code on WhatsApp
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader className="flex flex-col items-center text-center space-y-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                <MessageCircle className="h-7 w-7" />
              </span>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                Enter the code
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                We sent a 6-digit code to{" "}
                <span className="font-mono font-semibold">{phone.trim()}</span>{" "}
                on WhatsApp.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4">
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={OTP_LENGTH}
                containerClassName="justify-center"
              >
                <InputOTPGroup>
                  {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}

              <Button
                type="button"
                onClick={() => void handleVerify()}
                disabled={!isComplete || verifying}
                className="h-12 w-full rounded-xl bg-primary text-xs font-bold tracking-widest text-primary-foreground uppercase shadow-md transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none"
              >
                {verifying ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify & Unlock Listings"
                )}
              </Button>

              {/* Timer + Resend */}
              <div className="flex w-full items-center justify-between border-t border-border/50 pt-4">
                <span className="text-xs font-bold tabular-nums text-muted-foreground">
                  {Math.floor(secondsLeft / 60)}:
                  {String(secondsLeft % 60).padStart(2, "0")}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void handleResend()}
                  disabled={secondsLeft > 0 || isResending}
                  className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-primary hover:bg-transparent hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isResending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Resend code"
                  )}
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError(null);
                }}
                className="text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                Use a different number
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
