"use client";

import { useEffect, useState } from "react";
import { Button, Input, Label, Textarea, toast, Icon, Eye, EyeOff } from "@repo/ui";
import { PageHeader } from "components/ui/PageHeader";
import { getSettings, updateSettings } from "lib/api";
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
  className,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={"pr-10 " + (className || "")}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible(!visible)}
        className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center text-on-surface-variant hover:text-on-surface"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailForm, setEmailForm] = useState({ current: "", next: "" });

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
    const nameInput = document.getElementById("admin-name") as HTMLInputElement | null;
    const name = nameInput?.value.trim() ?? "";
    if (!name) {
      toast.error("Name cannot be empty");
      return;
    }
    setNameSaving(true);
    try {
      const res = await authFetch("/update-user", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Display name updated");
      window.location.reload();
    } catch {
      toast.error("Failed to update name");
    } finally {
      setNameSaving(false);
    }
  }

  async function updateEmail() {
    if (!user) return;
    const trimmed = emailForm.next.trim();
    if (!trimmed) {
      toast.error("Email cannot be empty");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setEmailSaving(true);
    try {
      const res = await authFetch("/change-email", {
        method: "POST",
        body: JSON.stringify({
          currentEmail: user.email,
          newEmail: trimmed,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Verification email sent to the new address to confirm the change");
      setEmailForm({ current: "", next: "" });
    } catch {
      toast.error("Failed to update email");
    } finally {
      setEmailSaving(false);
    }
  }

  async function changePassword() {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      toast.error("All password fields are required");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.next.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPwSaving(true);
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
      toast.error("Failed to change password — check your current password");
    } finally {
      setPwSaving(false);
    }
  }

  if (loading && isPending) {
    return <p className="mt-lg text-on-surface-variant">Loading…</p>;
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
        <div className="admin-surface border border-outline-variant rounded-xl p-md">
          <h2 className="mb-sm font-headline-md text-lg font-semibold text-on-surface">
            Admin Account
          </h2>
          {user ? (
            <div className="flex flex-col gap-md">
              <div className="flex items-center gap-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary font-headline-md font-bold">
                  {user.name?.charAt(0).toUpperCase() || "A"}
                </span>
                <div>
                  <p className="font-body-md text-on-surface">{user.name}</p>
                  <p className="font-label-sm text-[11px] text-on-surface-variant">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-col gap-sm">
                <Label htmlFor="admin-name">Display Name</Label>
                <Input
                  id="admin-name"
                  defaultValue={user.name || ""}
                  className="max-w-xs bg-surface"
                />
                <Button size="sm" disabled={nameSaving} className="w-fit" onClick={updateName}>
                  {nameSaving ? "Saving…" : "Update name"}
                </Button>
              </div>
              <div className="flex flex-col gap-sm">
                <Label>New Email Address</Label>
                <Input
                  type="email"
                  placeholder="new@example.com"
                  value={emailForm.next}
                  onChange={(e) => setEmailForm({ ...emailForm, next: e.target.value })}
                  className="max-w-xs bg-surface"
                />
                <p className="font-label-sm text-[11px] text-on-surface-variant">
                  A verification email will be sent to confirm the change.
                </p>
                <Button size="sm" disabled={emailSaving} className="w-fit" variant="outline" onClick={updateEmail}>
                  {emailSaving ? "Sending…" : "Update email"}
                </Button>
              </div>
              <div className="flex flex-col gap-sm">
                <Label>Change Password</Label>
                <div className="flex flex-col gap-xs">
                  <PasswordInput
                    placeholder="Current password"
                    value={pwForm.current}
                    onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                    className="max-w-xs bg-surface"
                  />
                  <PasswordInput
                    placeholder="New password"
                    value={pwForm.next}
                    onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                    className="max-w-xs bg-surface"
                  />
                  <PasswordInput
                    placeholder="Confirm new password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    className="max-w-xs bg-surface"
                  />
                </div>
                <Button size="sm" disabled={pwSaving} className="w-fit" variant="outline" onClick={changePassword}>
                  {pwSaving ? "Changing…" : "Change password"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-on-surface-variant">Loading user info…</p>
          )}
        </div>

        {/* --- Platform settings --- */}
        <div className="admin-surface border border-outline-variant rounded-xl p-md">
          <h2 className="mb-sm font-headline-md text-lg font-semibold text-on-surface">
            Platform Configuration
          </h2>
          <div className="flex flex-col gap-md">
            <div className="flex flex-col gap-sm">
              <Label>Platform Name</Label>
              <Input
                value={String(settings.platformName ?? "Lekhaprati")}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="max-w-xs bg-surface"
              />
            </div>
            <div className="flex flex-col gap-sm">
              <Label>Support Email</Label>
              <Input
                value={String(settings.supportEmail ?? "hello@lekhaprati.com")}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="max-w-xs bg-surface"
              />
            </div>
            <div className="flex flex-col gap-sm">
              <Label>Maintenance Notice</Label>
              <Textarea
                rows={3}
                value={String(settings.maintenanceNotice ?? "")}
                onChange={(e) => setSettings({ ...settings, maintenanceNotice: e.target.value })}
                className="max-w-2xl bg-surface"
              />
            </div>
            <div className="flex flex-col gap-sm">
              <Label>Default Currency</Label>
              <Input
                value={String(settings.defaultCurrency ?? "NPR")}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                className="w-32 bg-surface"
              />
            </div>
            <div className="flex gap-xs border-t border-outline-variant pt-md">
              <Button size="sm" disabled={saving} onClick={saveSettings}>
                {saving ? "Saving…" : "Save settings"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
