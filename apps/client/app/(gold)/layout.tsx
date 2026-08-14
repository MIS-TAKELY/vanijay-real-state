import type { Metadata } from "next";
import "./metals.css";

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
    <div className="metals-app min-h-screen bg-[#0F1114] text-[#E8E6E1]">
      {children}
    </div>
  );
}