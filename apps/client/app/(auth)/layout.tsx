import { DashboardSidebar } from "components/pages/dashboard";
import { Container } from "@repo/ui";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container className="flex flex-col md:flex-row md:gap-lg py-md md:py-lg">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </Container>
  );
}
