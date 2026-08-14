import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Precious Metals | Side-by-Side Analysis | Vanijay",
  description: "Compare gold, silver, platinum, palladium, copper, diamond, and steel prices side by side. Real-time rates, performance metrics, and correlation analysis.",
  robots: { index: true, follow: true },
};

export default function ComparePage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-[#E8E6E1] mb-8" style={{ fontFamily: "var(--font-display)" }}>
        Metal Comparison Tool
      </h1>
      <p className="text-white/50 mb-8" style={{ fontFamily: "var(--font-body)" }}>
        Coming soon — select multiple metals to compare prices, performance, and correlations side by side.
      </p>
    </div>
  );
}
