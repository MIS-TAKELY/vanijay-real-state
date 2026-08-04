import { Icon } from "@repo/ui";

interface VerificationBannerProps {
  show?: boolean;
  href?: string;
}

export function VerificationBanner({
  show = true,
  href = "/documents",
}: VerificationBannerProps) {
  if (!show) return null;

  return (
    <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#b45309]/30 bg-[#b45309]/5 px-md py-sm mb-md">
      <div className="flex items-start gap-sm">
        <Icon
          name="gpp_maybe"
          filled
          className="text-[24px] text-[#b45309] mt-0.5"
        />
        <div className="flex flex-col">
          <p className="font-body-md text-body-md text-on-surface font-medium">
            Complete identity verification to list property
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Upload your citizenship to reach Level 2 and unlock listing
            creation.
          </p>
        </div>
      </div>
      <a
        href={href}
        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#b45309] text-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#92400e]"
      >
        Upload citizenship
        <Icon name="arrow_forward" className="text-data-table" />
      </a>
    </div>
  );
}
