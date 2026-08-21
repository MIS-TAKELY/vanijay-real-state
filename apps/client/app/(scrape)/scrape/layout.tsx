import { KabadiFooter } from "components/kabadi/layout/KabadiFooter";
import { KabadiNavbar } from "components/kabadi/layout/KabadiNavbar";

export default function KabadiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <KabadiNavbar />
      <main>{children}</main>
      <KabadiFooter />
    </div>
  );
}
