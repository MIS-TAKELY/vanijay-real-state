"use client";

import { Button, Icon, Input, Label } from "@repo/ui";
import { useState } from "react";
import { updateProfile } from "lib/api/services/profile";
import type { ProfileData } from "./constants";

interface DetailsFormProps {
  profile: ProfileData;
  onSaved?: (updated: ProfileData) => void;
}

export function DetailsForm({ profile, onSaved }: DetailsFormProps) {
  const [district, setDistrict] = useState(profile.permanentDistrict);
  const [address, setAddress] = useState(profile.permanentAddress);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    district !== profile.permanentDistrict ||
    address !== profile.permanentAddress;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateProfile({
        permanentDistrict: district,
        permanentAddress: address,
      });
      onSaved?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-md">
      <h2 className="mb-md font-headline-md text-base font-semibold text-on-surface">
        Details
      </h2>

      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        {/* Permanent district */}
        <div className="flex flex-col gap-xs">
          <Label htmlFor="pf-district">Permanent district</Label>
          <Input
            id="pf-district"
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="h-11"
          />
        </div>

        {/* Permanent address */}
        <div className="flex flex-col gap-xs">
          <Label htmlFor="pf-address">Permanent address</Label>
          <Input
            id="pf-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="h-11"
          />
        </div>
      </div>

      {error && <p className="mt-sm text-[12px] text-destructive">{error}</p>}

      <div className="mt-md flex justify-end">
        <Button
          type="button"
          disabled={!dirty || saving}
          onClick={handleSave}
          className="gap-1.5"
        >
          {saving ? (
            <>
              <Icon
                name="progress_activity"
                className="animate-spin text-data-table"
              />
              Saving…
            </>
          ) : (
            <>
              <Icon name="save" className="text-data-table" />
              Save changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
