"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Icon, Input, Label } from "@repo/ui";
import { signIn } from "@repo/auth/client";

export function LoginSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg px-gutter">
      <div className="w-full max-w-sm">
        <div className="admin-surface border border-outline-variant rounded-xl p-lg">
          <div className="mb-md flex flex-col items-center gap-sm text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary">
              <span className="font-headline-md text-[28px]">L</span>
            </span>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                Lekhaprati Admin
              </h1>
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
      if (!res.error) {
        router.replace(next);
        router.refresh();
      } else {
        setError(res.error.message || "Sign in failed.");
      }
    } catch {
      setError("Unable to reach the authentication server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg px-gutter">
      <div className="w-full max-w-sm">
        <div className="admin-surface border border-outline-variant rounded-xl p-lg">
          <div className="mb-md flex flex-col items-center gap-sm text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary">
              <Icon name="account_balance" className="text-[28px]" />
            </span>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                Lekhaprati Admin
              </h1>
              <p className="mt-1 font-body-sm text-sm text-on-surface-variant">
                Sign in to the operations console.
              </p>
            </div>
          </div>

          {error && (
            <Alert className="mb-md border-error/40 text-error">
              {error}
            </Alert>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-md">
            <div className="flex flex-col gap-sm">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface"
              />
            </div>
            <div className="flex flex-col gap-sm">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-surface"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
        <p className="mt-md text-center font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
          Authorized staff only
        </p>
      </div>
    </div>
  );
}
