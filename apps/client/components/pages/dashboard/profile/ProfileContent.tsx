import { CitizenshipVerification } from "./CitizenshipVerification";
import { DangerZone } from "./DangerZone";
import { DetailsForm } from "./DetailsForm";
import { IdentityCard } from "./IdentityCard";
import { NotificationPreferences } from "./NotificationPreferences";
import { VerificationPanel } from "./VerificationPanel";
import { PROFILE_DATA } from "./constants";

export function ProfileContent() {
  return (
    <div className="flex flex-col gap-md">
      <IdentityCard profile={PROFILE_DATA} />
      <VerificationPanel profile={PROFILE_DATA} />
      <DetailsForm profile={PROFILE_DATA} />
      <CitizenshipVerification profile={PROFILE_DATA} />
      <NotificationPreferences />
      <DangerZone />
    </div>
  );
}
