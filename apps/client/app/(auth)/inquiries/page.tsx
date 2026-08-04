import { DashboardHeader } from "components/pages/dashboard";
import { InquiryList } from "components/pages/dashboard/inquiries";

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
