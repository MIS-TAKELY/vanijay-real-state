"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Input, Label, Eye, EyeOff } from "@repo/ui";
import { signIn } from "@repo/auth/client";

import logo from "../../../public/logo.webp";
import logoText from "../../../public/logo-text.webp";
// import {  } from "lucide-react";

/** Password field with show/hide eye toggle. */
function PasswordField({
  id,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={onChange}
        className="bg-surface pr-10"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center text-on-surface-variant transition-colors hover:text-on-surface"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function LoginSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg px-gutter">
      <div className="w-full max-w-sm">
        <div className="admin-surface border border-outline-variant rounded-2xl p-lg shadow-sm">
          <div className="mb-md flex flex-col items-center gap-sm text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-1 shadow-md ring-2 ring-gold/40">
              <Image
                src={logo}
                alt="MALPOTH"
                width={56}
                height={56}
                className="size-full rounded-full object-contain"
              />
            </span>
            <div>
              <Image
                src={logoText}
                alt="MALPOTH"
                width={160}
                height={38}
                className="mx-auto h-9 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn.email({ email, password });
      if (res.error) {
        // The auth server rejects non-admin accounts for the console
        // (packages/auth hooks), so the message is surfaced as-is.
        setError(res.error.message || "Sign in failed.");
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setError("Unable to reach the authentication server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-admin-bg px-gutter">
      {/* Subtle dot-grid texture */}
      <div className="pointer-events-none absolute inset-0 topo-bg" />

      <div className="relative w-full max-w-sm animate-fade-in-up">
        {/* Brand header above card */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-1 shadow-lg ring-2 ring-gold/40">
            <Image
              src={logo}
              alt="MALPOTH"
              width={56}
              height={56}
              className="size-full rounded-full object-contain"
            />
          </span>
          <div className="flex flex-col items-center gap-1">
            <Image
              src={logoText}
              alt="MALPOTH"
              width={160}
              height={38}
              className="h-9 w-auto object-contain"
            />
            <p className="text-sm text-on-surface-variant">
              Sign in to the operations console
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="admin-surface border border-outline-variant rounded-2xl p-8 shadow-sm">
          {error && (
            <Alert className="mb-5 border-error/30 bg-error/5 text-error text-sm">
              {error}
            </Alert>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <PasswordField
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" disabled={loading} className="mt-1 w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-[11px] uppercase tracking-widest text-on-surface-variant/60">
          Authorized staff only
        </p>
      </div>
    </div>
  );
}
