import type { Metadata } from "next";
import { KabadiFooter } from "components/kabadi/layout/KabadiFooter";
import { KabadiNavbar } from "components/kabadi/layout/KabadiNavbar";

/** Kabadi stays out of organic search until a deliberate SEO launch. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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
