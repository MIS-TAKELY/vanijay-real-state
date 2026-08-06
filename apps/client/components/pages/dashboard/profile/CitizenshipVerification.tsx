import { Button, Icon, Input, Label } from "@repo/ui";
import type { ProfileData } from "./constants";

interface CitizenshipVerificationProps {
  profile: ProfileData;
}


export function CitizenshipVerification({
  profile,
}: CitizenshipVerificationProps) {
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
        ? "bg-[#b45309]/10 text-[#b45309]"
        : "bg-surface-container-high text-on-surface-variant";

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-md">
      <div className="mb-md flex items-center justify-between">
        <h2 className="font-headline-md text-base font-semibold text-on-surface">
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
        {/* Citizenship no. (masked) */}
        <div className="flex flex-col gap-xs">
          <Label>Citizenship no.</Label>
          <Input
            type="text"
            defaultValue={profile.citizenshipNo}
            className="mono-stat h-11"
          />
        </div>

        {/* Issue date */}
        <div className="flex flex-col gap-xs">
          <Label>Issue date</Label>
          <Input
            type="date"
            defaultValue={profile.citizenshipIssueDate}
            className="mono-stat h-11"
          />
        </div>
      </div>

      {/* Front/back uploads */}
      <div className="mt-sm grid grid-cols-1 gap-sm sm:grid-cols-2">
        {["Front side", "Back side"].map((side) => (
          <Button
            key={side}
            type="button"
            variant="outline"
            className="flex flex-col items-center justify-center gap-xs rounded-xl border-dashed border-outline-variant bg-surface-container-low py-md text-on-surface-variant hover:border-primary hover:text-primary cursor-pointer h-auto"
          >
            <Icon name="upload_file" className="text-[32px]" />
            <span className="text-label-sm font-medium">{side}</span>
            <span className="text-[11px]">PNG / JPG, max 10MB</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
