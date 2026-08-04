import { Icon } from "@repo/ui";
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
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Citizenship no.
          </label>
          <input
            type="text"
            defaultValue={profile.citizenshipNo}
            className="mono-stat h-11 rounded-md border border-outline bg-surface px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>

        {/* Issue date */}
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Issue date
          </label>
          <input
            type="date"
            defaultValue={profile.citizenshipIssueDate}
            className="mono-stat h-11 rounded-md border border-outline bg-surface px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>
      </div>

      {/* Front/back uploads */}
      <div className="mt-sm grid grid-cols-1 gap-sm sm:grid-cols-2">
        {["Front side", "Back side"].map((side) => (
          <button
            key={side}
            type="button"
            className="flex flex-col items-center justify-center gap-xs rounded-xl border border-dashed border-outline-variant bg-surface-container-low py-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            <Icon name="upload_file" className="text-[32px]" />
            <span className="text-label-sm font-medium">{side}</span>
            <span className="text-[11px]">PNG / JPG, max 10MB</span>
          </button>
        ))}
      </div>
    </div>
  );
}
