import { DashboardHeader } from "components/real-state/pages/dashboard";
import { InquiryList } from "components/real-state/pages/dashboard/inquiries";

export default function InquiriesPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Inquiries"
        description="Messages from buyers across your listings, and inquiries you've sent."
      />

      <InquiryList />
    </div>
  );
}
