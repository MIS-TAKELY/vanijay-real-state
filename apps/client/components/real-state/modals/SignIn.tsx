"use client";

import { authClient, signIn, signUp } from "@repo/auth/client";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from "@repo/ui";
import {
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuthModalStore } from "store/auth-modal";
import VerifyEmailOtp from "./VerifyEmailOtp";

interface SignInModalProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}
const fieldLabel =
  "text-xs font-semibold text-foreground uppercase tracking-wider";
const fieldInput =
  "pl-10 h-11 rounded-xl bg-muted/30 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-200";
const fieldIcon =
  "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground";

const SignIn = ({ trigger, defaultOpen = false }: SignInModalProps) => {
  const { isOpen, open: openModal, close: closeModal } = useAuthModalStore();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Support defaultOpen prop for backward compatibility
  useEffect(() => {
    if (defaultOpen) openModal();
  }, [defaultOpen, openModal]);

  // Surface an auth error carried over from the URL (e.g. a Google sign-in
  // rejected because the email domain isn't allowlisted) once the modal opens.
  useEffect(() => {
    if (isOpen) {
      const err = useAuthModalStore.getState().error;
      if (err) {
        setError(err);
        useAuthModalStore.getState().clearError();
      }
    }
  }, [isOpen]);

  const completeAuth = () => {
    const redirectTo = useAuthModalStore.getState().redirect;
    closeModal();
    router.push(redirectTo || "/dashboard");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const redirectTo = useAuthModalStore.getState().redirect;
      const targetPath = redirectTo || "/dashboard";
      const callbackURL = new URL(
        targetPath,
        window.location.origin,
      ).toString();
      // If the auth server rejects the Google account (e.g. email domain not
      // on the client allowlist), send the user back here with the error
      // visible instead of dumping them on the API's error page.
      const errorCallbackURL = new URL(
        "/?auth=signin&error=google-domain-not-allowed",
        window.location.origin,
      ).toString();
      await signIn.social({
        provider: "google",
        callbackURL,
        errorCallbackURL,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await signUp.email({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        if (signUpError) {
          setError(signUpError.message || "Sign up failed");
          return;
        }
        // On successful sign up, switch to sign in mode or close
        setMode("signin");
        setFormData({ name: "", email: "", password: "" });
      } else {
        const { error: signInError } = await signIn.email({
          email: formData.email,
          password: formData.password,
          ...(rememberMe && { rememberMe: true }),
        });
        if (signInError) {
          const msg = (signInError.message ?? "").toLowerCase();
          if (
            (msg.includes("email") && msg.includes("verified")) ||
            msg === "email not verified"
          ) {
            // Auto-send an OTP to the user's email
            try {
              await authClient.emailOtp.sendVerificationOtp({
                email: formData.email,
                type: "email-verification",
              });
            } catch {}
            setOtpEmail(formData.email);
            setShowOtpModal(true);
            return;
          }
          setError(signInError.message || "Sign in failed");
          return;
        }
        // The auth server rejects ofor the customer app
        // (packages/auth hooks), so a successful sign-in here is always a
        // non-admin user — the server error above surfaces otherwise.
        completeAuth();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (v) openModal();
        else closeModal();
      }}
    >
      <DialogTrigger asChild>
        {trigger || <Button variant="default">Sign In</Button>}
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[460px] w-full p-6 sm:p-7 gap-6 rounded-3xl border bg-background shadow-2xl overflow-hidden"
        // Prevent Radix from re-focusing the trigger when switching to OTP view.
        onOpenAutoFocus={(e) => {
          if (showOtpModal) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (showOtpModal) e.preventDefault();
        }}
        onFocusOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (showOtpModal) e.preventDefault();
        }}
      >
        {showOtpModal ? (
          /* ─── OTP Verification View ─── */
          <VerifyEmailOtp
            email={otpEmail}
            onSuccess={async () => {
              // Email verified — auto sign-in with saved credentials
              const { error: retryError } = await signIn.email({
                email: formData.email,
                password: formData.password,
                ...(rememberMe && { rememberMe: true }),
              });
              if (!retryError) {
                setShowOtpModal(false);
                completeAuth();
              } else {
                // If re-sign-in fails for some reason, go back to sign-in form
                setShowOtpModal(false);
                setError(
                  retryError.message || "Sign in failed after verification.",
                );
              }
            }}
            onCancel={() => {
              setShowOtpModal(false);
              setError(null);
            }}
          />
        ) : (
          /* ─── Sign-In / Sign-Up View ─── */
          <>
            {/* Top Header */}
            <DialogHeader className="flex flex-col items-center text-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <Building2 className="h-6 w-6" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {mode === "signin" ? "Welcome back" : "Create an account"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to access your saved properties, searches, and inquiries."
                  : "Register to get personalized recommendations and save listings."}
              </DialogDescription>
            </DialogHeader>

            {/* Error Message — announced to screen readers */}
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            {/* Google OAuth Button */}
            <div className="flex flex-col gap-4">
              <Button
                type="button"
                variant="ghost"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
                className="relative h-11 w-full flex items-center justify-center gap-3 rounded-xl border bg-background font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-xs cursor-pointer"
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </Button>

              {/* Divider */}
              <div
                className="relative flex items-center justify-center my-1"
                role="separator"
                aria-orientation="horizontal"
              >
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Or continue with email
                </div>
              </div>
            </div>

            {/* Email & Password Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              aria-busy={isLoading}
              className="space-y-4"
            >
              {/* Name field — only for signup */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label htmlFor="signup-name" className={fieldLabel}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User aria-hidden="true" className={fieldIcon} />
                    <Input
                      id="signup-name"
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={fieldInput}
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1.5">
                <label htmlFor="auth-email" className={fieldLabel}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail aria-hidden="true" className={fieldIcon} />
                  <Input
                    id="auth-email"
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={error ? "true" : undefined}
                    className={fieldInput}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="auth-password" className={fieldLabel}>
                    Password
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      className="text-xs text-primary font-medium hover:underline transition-all duration-200 cursor-pointer"
                      onClick={() => console.log("Forgot password clicked")}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock aria-hidden="true" className={fieldIcon} />
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    required
                    value={formData.password}
                    onChange={handleChange}
                    aria-invalid={error ? "true" : undefined}
                    className={fieldInput}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors duration-200 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Remember me — only for signin */}
              {mode === "signin" && (
                <div className="flex items-center justify-between pt-1">
                  <Label
                    htmlFor="remember-me"
                    className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none transition-colors duration-200 hover:text-foreground"
                  >
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(v) => setRememberMe(!!v)}
                    />
                    Remember me on this device
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl font-semibold transition-all duration-200 shadow-md mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {mode === "signin" ? "Signing in…" : "Creating account…"}
                  </span>
                ) : mode === "signin" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Footer Mode Switcher */}
            <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border">
              {mode === "signin" ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 font-semibold text-primary hover:underline transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                    }}
                  >
                    Sign up
                  </Button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 font-semibold text-primary hover:underline transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setMode("signin");
                      setError(null);
                    }}
                  >
                    Sign in
                  </Button>
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

SignIn.displayName = "SignIn";

export default SignIn;
