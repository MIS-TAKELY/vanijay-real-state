import { DashboardHeader } from "components/real-state/pages/dashboard";
import { ProfileContent } from "components/real-state/pages/dashboard/profile";

export default function ProfilePage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Profile & Verification"
        description="Manage your identity, verification level, and notification preferences."
      />

      <ProfileContent />
    </div>
  );
}
