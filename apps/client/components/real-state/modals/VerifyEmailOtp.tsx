"use client";

import { Button, InputOTP, InputOTPGroup, InputOTPSlot } from "@repo/ui";
import { authClient } from "@repo/auth/client";
import { Loader2, Shield } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface VerifyEmailOtpProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 120;

function CountdownRing({
  secondsLeft,
  total,
}: {
  secondsLeft: number;
  total: number;
}) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = secondsLeft / total;
  const dashOffset = circumference * (1 - progress);
  const isLow = secondsLeft <= 30;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="44" height="44" className="-rotate-90" aria-hidden="true">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          strokeWidth="3"
          className="stroke-border/60"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className={`transition-[stroke-dashoffset,stroke] duration-1000 ease-linear motion-reduce:transition-none ${
            isLow ? "stroke-destructive" : "stroke-primary"
          }`}
        />
      </svg>
      <span
        className={`absolute text-[11px] font-bold tabular-nums ${
          isLow ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {Math.floor(secondsLeft / 60)}:
        {String(secondsLeft % 60).padStart(2, "0")}
      </span>
    </div>
  );
}

export default function VerifyEmailOtp({
  email,
  onSuccess,
  onCancel,
}: VerifyEmailOtpProps) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const isComplete = otp.length === OTP_LENGTH;

  useEffect(() => {
    if (secondsLeft <= 0 || success) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft, success]);

  const handleVerify = useCallback(async () => {
    if (!isComplete || isVerifying || success) return;

    setIsVerifying(true);
    setError(null);

    try {
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (verifyError) {
        setError(verifyError.message ?? "Invalid or expired code. Try again.");
        setHasAutoSubmitted(false);
        setOtp("");
        return;
      }

      setSuccess(true);
      successTimeoutRef.current = setTimeout(onSuccess, 1200);
    } catch {
      setError("Verification failed. Please try again.");
      setHasAutoSubmitted(false);
    } finally {
      setIsVerifying(false);
    }
  }, [email, otp, isComplete, isVerifying, success, onSuccess]);

  const handleResend = useCallback(async () => {
    if (secondsLeft > 0 || isResending) return;

    setIsResending(true);
    setError(null);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      setSecondsLeft(COUNTDOWN_SECONDS);
      setOtp("");
      setHasAutoSubmitted(false);
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  }, [secondsLeft, isResending, email]);

  useEffect(() => {
    if (isComplete && !isVerifying && !success && !hasAutoSubmitted) {
      setHasAutoSubmitted(true);
      handleVerify();
    }
  }, [isComplete, isVerifying, success, hasAutoSubmitted, handleVerify]);

  useEffect(() => {
    if (!isComplete) {
      setHasAutoSubmitted(false);
    }
  }, [isComplete]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Icon */}
      <div className="relative">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 motion-reduce:transition-none ${
            success
              ? "bg-emerald-100 text-emerald-600 scale-110"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Shield className="h-7 w-7" />
        </div>
        {!success && (
          <span className="absolute inset-0 rounded-2xl bg-primary/5 animate-ping opacity-30" />
        )}
      </div>

      {/* Heading */}
      <div className="w-full space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Verify Your Identity
        </h2>
        <p className="mx-auto text-sm leading-relaxed text-muted-foreground">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-foreground break-all">
            {email}
          </span>
        </p>
      </div>

      {/* Card */}
      <div
        className={`relative w-full space-y-5 rounded-2xl border bg-card p-5 sm:p-6 text-left shadow-sm transition-all duration-500 motion-reduce:transition-none ${
          success
            ? "border-emerald-300 bg-emerald-50/50 shadow-emerald-100/30"
            : error
              ? "border-destructive/30 bg-destructive/[0.02]"
              : "border-border/70"
        }`}
      >
        {success && (
          <div className="pointer-events-none absolute -top-3 right-4 select-none animate-[fadeIn_0.4s_ease-out]">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-400 bg-emerald-50 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-700 uppercase shadow-sm">
              <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
              </svg>
              Verified
            </span>
          </div>
        )}

        {/* OTP Inputs – fixed size so they never overflow */}
        {/* OTP Inputs */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">
            6-Digit Access Code
          </label>

          <div className="flex justify-center">
            <InputOTP
              maxLength={OTP_LENGTH}
              value={otp}
              onChange={setOtp}
              disabled={success || isVerifying}
            >
              <InputOTPGroup className="gap-2 sm:gap-2.5">
                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="
              h-11 w-11 sm:h-12 sm:w-12
              rounded-xl
              border
              text-base sm:text-lg
              font-bold
              shadow-sm
              first:rounded-xl last:rounded-xl
              data-[active=true]:ring-2 data-[active=true]:ring-primary/20
            "
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {/* Error */}
        <div aria-live="polite" role="status">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive animate-[fadeIn_0.2s_ease-out]">
              <svg
                className="h-4 w-4 shrink-0"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 1a7 7 0 100 14A7 7 0 008 1zM7.25 5a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Verify Button */}
        <Button
          id="verify-otp-btn"
          type="button"
          onClick={handleVerify}
          disabled={!isComplete || isVerifying || success}
          className="h-12 w-full cursor-pointer rounded-xl bg-primary text-xs font-bold tracking-widest text-primary-foreground uppercase shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
        >
          {isVerifying ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </span>
          ) : success ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
              </svg>
              Verified Successfully
            </span>
          ) : (
            "Verify Code"
          )}
        </Button>

        {/* Timer + Resend */}
        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <CountdownRing secondsLeft={secondsLeft} total={COUNTDOWN_SECONDS} />
          <Button
            type="button"
            id="resend-otp-btn"
            variant="ghost"
            onClick={handleResend}
            disabled={secondsLeft > 0 || isResending}
            className="group flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-primary hover:bg-transparent hover:text-primary/80 active:text-primary/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isResending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 8a7 7 0 1114 0A7 7 0 011 8z" />
                  <path d="M8 4.5V8l2.5 1.5" />
                </svg>
                Resend Code
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Back */}
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        className="group flex items-center gap-1.5 cursor-pointer text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
      >
        <svg
          className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M15 8a.75.75 0 01-.75.75H4.56l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 1.06L4.56 7.25h9.69A.75.75 0 0115 8z"
            clipRule="evenodd"
          />
        </svg>
        Back to sign in
      </Button>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
