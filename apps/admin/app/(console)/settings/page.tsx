"use client";

import { useEffect, useState } from "react";
import { Button, Input, Label, Textarea, toast, Icon, Eye, EyeOff, Skeleton } from "@repo/ui";
import { PageHeader } from "components/ui/PageHeader";
import { ApiError, adminUpdateEmail, getSettings, updateSettings } from "lib/api";
import { useSession } from "@repo/auth/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function authFetch(path: string, init: RequestInit = {}) {
  return fetch(`${API_BASE}/api/auth${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
    ...init,
  });
}

/** Password input with an eye-toggle embedded in the field, via lucide-react Eye / EyeOff. */
function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative w-full max-w-xs">
      <Input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        className="bg-surface pr-10"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible(!visible)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-on-surface-variant transition-colors hover:text-on-surface"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

/** Inline error message shown below a field, announced to screen readers. */
function FieldError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
      <Icon name="error" className="text-[14px] shrink-0" />
      {message}
    </p>
  );
}

export default function SettingsPage() {
  const { data: session, isPending, refetch } = useSession();
  const user = session?.user;

  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Display name
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Email
  const [emailValue, setEmailValue] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [displayEmail, setDisplayEmail] = useState<string | null>(null);

  // Password
  const [pwSaving, setPwSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState<string | null>(null);

  // Seed the editable fields + profile display from the session once it loads.
  // The functional updates keep any optimistic value set after a save.
  useEffect(() => {
    if (!user) return;
    setNameValue((v) => (v === "" && user.name ? user.name : v));
    setEmailValue((v) => (v === "" && user.email ? user.email : v));
    setDisplayName((d) => d ?? user.name ?? "");
    setDisplayEmail((d) => d ?? user.email ?? "");
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        setSettings(await getSettings());
      } catch {
        /* use defaults */
      }
      setLoading(false);
    })();
  }, []);

  async function saveSettings() {
    setSaving(true);
    try {
      await updateSettings(settings);
      toast.success("Settings saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function updateName() {
    if (!user) return;
    const name = nameValue.trim();
    if (!name) {
      setNameError("Name cannot be empty");
      return;
    }
    setNameSaving(true);
    setNameError(null);
    try {
      const res = await authFetch("/update-user", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed");
      // Update the UI in place — no full page reload, no blank flash.
      setDisplayName(name);
      setNameValue(name);
      toast.success("Display name updated");
      void refetch();
    } catch {
      toast.error("Failed to update name");
    } finally {
      setNameSaving(false);
    }
  }

  async function updateEmail() {
    if (!user) return;
    const trimmed = emailValue.trim();
    if (!trimmed) {
      setEmailError("Email cannot be empty");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailSaving(true);
    setEmailError(null);
    try {
      await adminUpdateEmail(trimmed);
      // Update the UI in place — no full page reload, no blank flash.
      setDisplayEmail(trimmed);
      setEmailValue(trimmed);
      toast.success("Email updated successfully");
      void refetch();
    } catch (error) {
      const detail = error instanceof ApiError ? (error.details as { message?: string } | undefined)?.message : undefined;
      setEmailError(typeof detail === "string" ? detail : "Failed to update email");
    } finally {
      setEmailSaving(false);
    }
  }

  async function changePassword() {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError("All password fields are required");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match");
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    setPwSaving(true);
    setPwError(null);
    try {
      const res = await authFetch("/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: pwForm.current,
          newPassword: pwForm.next,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Password changed successfully");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch {
      setPwError("Failed to change password — check your current password");
    } finally {
      setPwSaving(false);
    }
  }

  if (loading && isPending) {
    return (
      <div className="space-y-lg">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="admin-surface overflow-hidden rounded-2xl border border-outline-variant">
          <Skeleton className="h-16 w-full rounded-none" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full max-w-xs" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        <div className="admin-surface overflow-hidden rounded-2xl border border-outline-variant">
          <Skeleton className="h-16 w-full rounded-none" />
          <div className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full max-w-2xl" />
            <div className="flex justify-end">
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        icon="tune"
        title="Settings"
        description="Platform configuration and your admin account."
      />
      <section className="mt-lg space-y-lg">
        {/* --- Admin account --- */}
        <div className="admin-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          {/* Card header */}
          <div className="flex items-center gap-3 border-b border-outline-variant bg-surface-container-low px-6 py-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon name="manage_accounts" className="text-[18px]" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-on-surface leading-tight">Admin Account</h2>
              <p className="text-[11px] text-on-surface-variant">Manage your profile and credentials</p>
            </div>
          </div>

          {user ? (
            <div className="divide-y divide-outline-variant/60">
              {/* Profile avatar row */}
              <div className="flex items-center gap-4 px-6 py-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary font-headline-md text-lg font-bold ring-4 ring-primary/15 shadow-sm">
                  {(displayName || user.name || "A").charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-on-surface">{displayName || user.name}</p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">{displayEmail || user.email}</p>
                </div>
              </div>

              {/* Display name section */}
              <div className="px-6 py-5">
                <Label htmlFor="admin-name" className="mb-3 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Display Name
                </Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex w-full max-w-xs flex-col gap-1.5">
                    <Input
                      id="admin-name"
                      autoComplete="name"
                      value={nameValue}
                      onChange={(e) => {
                        setNameValue(e.target.value);
                        if (nameError) setNameError(null);
                      }}
                      disabled={nameSaving}
                      aria-invalid={!!nameError}
                      className="bg-surface"
                    />
                    <FieldError message={nameError ?? ""} />
                  </div>
                  <Button size="sm" disabled={nameSaving} className="w-fit shrink-0" onClick={updateName}>
                    {nameSaving ? (
                      <>
                        <Icon name="progress_activity" className="animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Update name"
                    )}
                  </Button>
                </div>
              </div>

              {/* Email section */}
              <div className="px-6 py-5">
                <Label htmlFor="admin-email" className="mb-3 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Email Address
                </Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex w-full max-w-xs flex-col gap-1.5">
                    <Input
                      id="admin-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={emailValue}
                      onChange={(e) => {
                        setEmailValue(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      disabled={emailSaving}
                      aria-invalid={!!emailError}
                      className="bg-surface"
                    />
                    <FieldError message={emailError ?? ""} />
                    <p className="text-[11px] text-on-surface-variant">
                      Your admin account email is updated immediately.
                    </p>
                  </div>
                  <Button size="sm" disabled={emailSaving} className="w-fit shrink-0" onClick={updateEmail}>
                    {emailSaving ? (
                      <>
                        <Icon name="progress_activity" className="animate-spin" />
                        Updating…
                      </>
                    ) : (
                      "Update email"
                    )}
                  </Button>
                </div>
              </div>

              {/* Change password section */}
              <div className="px-6 py-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Change Password
                </p>
                <div className="flex max-w-xs flex-col gap-3">
                  <PasswordInput
                    placeholder="Current password"
                    autoComplete="current-password"
                    value={pwForm.current}
                    disabled={pwSaving}
                    onChange={(e) => {
                      setPwForm({ ...pwForm, current: e.target.value });
                      if (pwError) setPwError(null);
                    }}
                  />
                  <PasswordInput
                    placeholder="New password"
                    autoComplete="new-password"
                    value={pwForm.next}
                    disabled={pwSaving}
                    onChange={(e) => {
                      setPwForm({ ...pwForm, next: e.target.value });
                      if (pwError) setPwError(null);
                    }}
                  />
                  <PasswordInput
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    value={pwForm.confirm}
                    disabled={pwSaving}
                    onChange={(e) => {
                      setPwForm({ ...pwForm, confirm: e.target.value });
                      if (pwError) setPwError(null);
                    }}
                  />
                  <FieldError message={pwError ?? ""} />
                  <Button size="sm" disabled={pwSaving} className="mt-1 w-fit" onClick={changePassword}>
                    {pwSaving ? (
                      <>
                        <Icon name="progress_activity" className="animate-spin" />
                        Changing…
                      </>
                    ) : (
                      "Change password"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="px-6 py-5 text-sm text-on-surface-variant">Loading user info…</p>
          )}
        </div>

        {/* --- Platform settings --- */}
        <div className="admin-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          {/* Card header */}
          <div className="flex items-center gap-3 border-b border-outline-variant bg-surface-container-low px-6 py-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <Icon name="tune" className="text-[18px]" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-on-surface leading-tight">Platform Configuration</h2>
              <p className="text-[11px] text-on-surface-variant">Global settings for the platform</p>
            </div>
          </div>

          <div className="divide-y divide-outline-variant/60">
            <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Platform Name</Label>
                <Input
                  value={String(settings.platformName ?? "Lekhaprati")}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  disabled={saving}
                  className="bg-surface"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Support Email</Label>
                <Input
                  value={String(settings.supportEmail ?? "hello@lekhaprati.com")}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  disabled={saving}
                  className="bg-surface"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Default Currency</Label>
                <Input
                  value={String(settings.defaultCurrency ?? "NPR")}
                  onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                  disabled={saving}
                  className="w-32 bg-surface"
                />
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Maintenance Notice</Label>
                <Textarea
                  rows={3}
                  value={String(settings.maintenanceNotice ?? "")}
                  onChange={(e) => setSettings({ ...settings, maintenanceNotice: e.target.value })}
                  disabled={saving}
                  className="max-w-2xl bg-surface"
                />
                <p className="text-[11px] text-on-surface-variant">Displayed to users when the platform is under maintenance.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 bg-surface-container-low/50 px-6 py-4">
              <Button size="sm" disabled={saving} onClick={saveSettings}>
                {saving ? (
                  <>
                    <Icon name="progress_activity" className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save settings"
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
