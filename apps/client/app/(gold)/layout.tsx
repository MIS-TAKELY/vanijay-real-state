import type { Metadata } from "next";
import { MetalsNavbar } from "../../components/gold/MetalsNavbar";

export const metadata: Metadata = {
  title: "Malpoth | Precious Metals Market",
  description:
    "Live NPR prices, trends, and historical data for gold, silver, platinum, palladium, bitcoin, ethereum, and copper.",
};

export default function MetalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <MetalsNavbar />
      {children}
    </div>
  );
}