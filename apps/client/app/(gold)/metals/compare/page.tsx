import type { Metadata } from "next";
import { Suspense } from "react";
import { MetalComparison } from "../../../../components/gold/MetalComparison";

export const metadata: Metadata = {
  title: "Compare Precious Metals | Side-by-Side Analysis | Malpoth",
  description:
    "Compare gold, silver, platinum, palladium, copper, diamond, and steel prices side by side. Real-time rates, performance metrics, and correlation analysis.",
  robots: { index: true, follow: true },
};

export default function ComparePage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 md:py-10">
      <div className="mb-8">
        <p
          className="mb-2 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-gold-deep"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <span className="h-px w-6 bg-gold/60" aria-hidden="true" />
          Side-by-side analysis
        </p>
        <h1
          className="text-3xl font-semibold tracking-tight text-on-surface"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Metal Comparison Tool
        </h1>
      </div>

      <Suspense
        fallback={
          <div
            className="rounded-2xl border border-outline-variant bg-surface p-8 text-center text-sm text-on-surface-variant shadow-sm"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Loading comparison…
          </div>
        }
      >
        <MetalComparison />
      </Suspense>
    </div>
  );
}