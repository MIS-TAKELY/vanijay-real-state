import { Badge, cn, Icon } from "@repo/ui";
import {
  USER_ROLE_LABELS,
  VERIFICATION_LEVELS,
  type ProfileData,
} from "./constants";

interface VerificationPanelProps {
  profile: ProfileData;
}

export function VerificationPanel({ profile }: VerificationPanelProps) {
  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-md">
      <h2 className="mb-md flex items-center gap-2.5 font-headline-md text-base font-bold tracking-tight text-navy">
        <span className="h-4 w-1 rounded-full bg-gold" aria-hidden />
        Roles & Verification
      </h2>

      {/* Roles */}
      <div className="mb-md flex flex-col gap-xs">
        <span className="font-label-sm text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
          Current roles
        </span>
        <div className="flex flex-wrap gap-1.5">
          {profile.roles.map((role) => (
            <Badge
              key={role}
              variant="outline"
              className="border-outline-variant text-on-surface"
            >
              {USER_ROLE_LABELS[role] ?? role}
            </Badge>
          ))}
        </div>
      </div>

      {/* Verification level progress */}
      <div className="flex flex-col gap-xs">
        <span className="font-label-sm text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
          Verification level
        </span>
        <div className="flex flex-col gap-sm">
          {VERIFICATION_LEVELS.map((meta) => {
            const reached = profile.verificationLevel >= meta.level;
            const isCurrent = profile.verificationLevel === meta.level;
            return (
              <div
                key={meta.level}
                className={cn(
                  "flex items-start gap-sm rounded-xl border p-sm transition-colors",
                  reached
                    ? "border-primary/40 bg-primary/5"
                    : "border-outline-variant bg-surface-container-low",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    reached
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant",
                  )}
                >
                  {reached ? (
                    <Icon name="check" className="text-body-lg" />
                  ) : (
                    <span className="mono-stat text-sm font-bold">
                      {meta.level}
                    </span>
                  )}
                </span>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      reached ? "text-on-surface" : "text-on-surface-variant",
                    )}
                  >
                    {meta.label}
                    {isCurrent ? (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-on-primary">
                        Current
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[12px] text-on-surface-variant">
                    {meta.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
