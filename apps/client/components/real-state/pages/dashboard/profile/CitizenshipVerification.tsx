"use client";

import { Button, Icon, Input, Label } from "@repo/ui";
import { useRef, useState } from "react";
import { submitCitizenshipDoc } from "lib/api/services/profile";
import { uploadFile } from "lib/api/services/uploads";
import type { ProfileData } from "./constants";

interface CitizenshipVerificationProps {
  profile: ProfileData;
  onSaved?: (updated: ProfileData) => void;
}

export function CitizenshipVerification({
  profile,
  onSaved,
}: CitizenshipVerificationProps) {
  const [citizenshipNo, setCitizenshipNo] = useState(profile.citizenshipNo);
  const [issueDate, setIssueDate] = useState(profile.citizenshipIssueDate);
  const [frontUploading, setFrontUploading] = useState(false);
  const [backUploading, setBackUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const statusLabel =
    profile.citizenshipStatus === "verified"
      ? "Verified"
      : profile.citizenshipStatus === "pending"
        ? "Pending"
        : "Not submitted";
  const statusClass =
    profile.citizenshipStatus === "verified"
      ? "bg-primary/10 text-primary"
      : profile.citizenshipStatus === "pending"
        ? "bg-gold/10 text-gold-deep"
        : "bg-surface-container-high text-on-surface-variant";

  async function handleUpload(side: "CITIZENSHIP_FRONT" | "CITIZENSHIP_BACK") {
    const input = side === "CITIZENSHIP_FRONT" ? frontRef : backRef;
    const file = input.current?.files?.[0];
    if (!file) return;

    const setUploading =
      side === "CITIZENSHIP_FRONT" ? setFrontUploading : setBackUploading;
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const asset = await uploadFile(file, "identity");
      await submitCitizenshipDoc({ type: side, fileUrl: asset.secureUrl });
      setSuccess(
        `${side === "CITIZENSHIP_FRONT" ? "Front" : "Back"} side uploaded successfully.`,
      );
      // Clear the input so the same file can be re-selected
      if (input.current) input.current.value = "";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to upload ${side === "CITIZENSHIP_FRONT" ? "front" : "back"} side`,
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveDetails() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await submitCitizenshipDoc({
        type: "CITIZENSHIP_FRONT",
        fileUrl: "",
        citizenshipNo,
        citizenshipIssueDate: issueDate,
      });
      onSaved?.(updated);
      setSuccess("Citizenship details saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save citizenship details",
      );
    } finally {
      setSaving(false);
    }
  }

  const dirty =
    citizenshipNo !== profile.citizenshipNo ||
    issueDate !== profile.citizenshipIssueDate;

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-md">
      <div className="mb-md flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 font-headline-md text-base font-bold tracking-tight text-navy">
          <span className="h-4 w-1 rounded-full bg-gold" aria-hidden />
          Citizenship Verification
        </h2>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium ${statusClass}`}
        >
          <Icon
            name={
              profile.citizenshipStatus === "verified"
                ? "verified"
                : profile.citizenshipStatus === "pending"
                  ? "schedule"
                  : "gpp_maybe"
            }
            filled={profile.citizenshipStatus === "verified"}
            className="text-[14px]"
          />
          {statusLabel}
        </span>
      </div>

      <div className="mb-sm flex items-start gap-sm rounded-lg bg-surface-container-low p-sm">
        <Icon
          name="lock"
          className="mt-0.5 text-body-lg text-on-surface-variant"
        />
        <p className="text-[12px] leading-snug text-on-surface-variant">
          Sensitive data — your citizenship number is encrypted at rest and
          accessible only to the admin verification team.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        {/* Citizenship no. */}
        <div className="flex flex-col gap-xs">
          <Label>Citizenship no.</Label>
          <Input
            type="text"
            value={citizenshipNo}
            onChange={(e) => setCitizenshipNo(e.target.value)}
            className="mono-stat h-11"
          />
        </div>

        {/* Issue date */}
        <div className="flex flex-col gap-xs">
          <Label>Issue date</Label>
          <Input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="mono-stat h-11"
          />
        </div>
      </div>

      {/* Save details button */}
      {dirty && (
        <div className="mt-sm flex justify-end">
          <Button
            type="button"
            disabled={saving}
            onClick={handleSaveDetails}
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
                Save details
              </>
            )}
          </Button>
        </div>
      )}

      {/* Front/back uploads */}
      <div className="mt-sm grid grid-cols-1 gap-sm sm:grid-cols-2">
        {/* Front side */}
        <div className="relative">
          <input
            ref={frontRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={() => handleUpload("CITIZENSHIP_FRONT")}
          />
          <Button
            type="button"
            variant="outline"
            disabled={
              frontUploading || profile.citizenshipStatus === "verified"
            }
            onClick={() => frontRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-xs rounded-xl border-dashed border-outline-variant bg-surface-container-low py-md text-on-surface-variant hover:border-gold/60 hover:text-gold-deep cursor-pointer h-auto"
          >
            {frontUploading ? (
              <Icon
                name="progress_activity"
                className="animate-spin text-data-price"
              />
            ) : (
              <Icon name="upload_file" className="text-data-price" />
            )}
            <span className="text-label-sm font-medium">
              {frontUploading ? "Uploading…" : "Front side"}
            </span>
            <span className="text-[11px]">PNG / JPG, max 10MB</span>
          </Button>
        </div>

        {/* Back side */}
        <div className="relative">
          <input
            ref={backRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={() => handleUpload("CITIZENSHIP_BACK")}
          />
          <Button
            type="button"
            variant="outline"
            disabled={backUploading || profile.citizenshipStatus === "verified"}
            onClick={() => backRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-xs rounded-xl border-dashed border-outline-variant bg-surface-container-low py-md text-on-surface-variant hover:border-gold/60 hover:text-gold-deep cursor-pointer h-auto"
          >
            {backUploading ? (
              <Icon
                name="progress_activity"
                className="animate-spin text-data-price"
              />
            ) : (
              <Icon name="upload_file" className="text-data-price" />
            )}
            <span className="text-label-sm font-medium">
              {backUploading ? "Uploading…" : "Back side"}
            </span>
            <span className="text-[11px]">PNG / JPG, max 10MB</span>
          </Button>
        </div>
      </div>

      {error && <p className="mt-sm text-[12px] text-destructive">{error}</p>}
      {success && <p className="mt-sm text-[12px] text-primary">{success}</p>}
    </div>
  );
}
