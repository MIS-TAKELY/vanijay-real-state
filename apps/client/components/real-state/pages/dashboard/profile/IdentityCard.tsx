import { Button, Icon } from "@repo/ui";
import type { ProfileData } from "./constants";

interface IdentityCardProps {
  profile: ProfileData;
}

export function IdentityCard({ profile }: IdentityCardProps) {
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-md">
      <h2 className="mb-md flex items-center gap-2.5 font-headline-md text-base font-bold tracking-tight text-navy">
        <span className="h-4 w-1 rounded-full bg-gold" aria-hidden />
        Identity
      </h2>

      <div className="flex flex-col gap-md sm:flex-row sm:items-center">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-xs">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-navy text-gold shadow-sm">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="mono-stat text-2xl font-bold">{initials}</span>
              )}
            </div>
            <Button
              type="button"
              size="icon"
              aria-label="Upload avatar"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-on-primary shadow-sm hover:bg-primary/90"
            >
              <Icon name="photo_camera" className="text-data-table" />
            </Button>
          </div>
        </div>

        {/* Name + email + phone */}
        <div className="flex flex-1 flex-col gap-xs">
          <div className="flex items-center gap-1.5">
            <h3 className="font-headline-md text-lg font-semibold text-on-surface">
              {profile.name}
            </h3>
            {profile.emailVerified ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                <Icon name="verified" filled className="text-label-sm" />
                Verified
              </span>
            ) : null}
          </div>

          <p className="text-sm text-on-surface-variant">{profile.email}</p>

          <div className="flex items-center gap-sm">
            <span className="mono-stat text-sm text-on-surface">
              {profile.phone}
            </span>
            {profile.phoneVerified ? (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary">
                <Icon name="verified" filled className="text-label-sm" />
                Verified
              </span>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="inline-flex items-center gap-0.5 rounded-md border-outline-variant px-2 py-0.5 text-[11px] font-medium text-on-surface hover:border-primary hover:text-primary h-auto"
              >
                <Icon name="phone" className="text-label-sm" />
                Verify
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
