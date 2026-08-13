"use client";

import { fetchProfile, ProfileData } from "lib/api/services/profile";
import { useEffect, useState } from "react";
import { CitizenshipVerification } from "./CitizenshipVerification";
import { DangerZone } from "./DangerZone";
import { DetailsForm } from "./DetailsForm";
import { IdentityCard } from "./IdentityCard";
import { NotificationPreferences } from "./NotificationPreferences";
import { VerificationPanel } from "./VerificationPanel";

export function ProfileContent() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch((err) => console.error("Failed to load profile", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        {loading ? "Loading profile…" : "Failed to load profile."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md">
      <IdentityCard profile={profile} />
      <VerificationPanel profile={profile} />
      <DetailsForm profile={profile} onSaved={(updated) => setProfile(updated)} />
      <CitizenshipVerification profile={profile} onSaved={(updated) => setProfile(updated)} />
      <NotificationPreferences />
      <DangerZone />
    </div>
  );
}
