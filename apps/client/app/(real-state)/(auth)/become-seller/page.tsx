import { DashboardHeader } from "components/real-state/pages/dashboard";
import { SellerWizard } from "components/real-state/pages/become-seller";

export default function BecomeSellerPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Become a Seller"
        description="Set up your seller account in a few short steps. Your progress is saved automatically, so you can leave and come back anytime."
      />

      <SellerWizard />
    </div>
  );
}