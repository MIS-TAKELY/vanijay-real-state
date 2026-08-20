import { SITE_URL } from "lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Land Act Compliance | MALPOTH",
  description:
    "How MALPOTH listings comply with Nepal's land legislation — Lands Act 2021, Civil Code ownership provisions, and cadastral verification standards.",
  alternates: { canonical: "/legal/land-act-compliance" },
  openGraph: {
    title: "Land Act Compliance | MALPOTH",
    description:
      "How MALPOTH listings comply with Nepal's land legislation and cadastral verification standards.",
    url: `${SITE_URL}/legal/land-act-compliance`,
    siteName: "MALPOTH",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const sectionClass = "mb-8";
const h2Class =
  "mb-3 font-headline-md text-lg font-semibold tracking-tight text-navy";
const pClass = "mb-3 text-sm leading-relaxed text-on-surface-variant";

export default function LandActCompliancePage() {
  return (
    <main className="mx-auto max-w-3xl px-gutter py-12 md:py-16">
      <p className="mb-2 font-label-sm text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
        Compliance
      </p>
      <h1 className="mb-2 font-display-lg text-3xl font-semibold tracking-tight text-navy md:text-4xl">
        Land Act Compliance
      </h1>
      <p className="mb-10 text-xs text-on-surface-variant">
        Last updated: August 2026
      </p>

      <section className={sectionClass}>
        <h2 className={h2Class}>Our Verification Standard</h2>
        <p className={pClass}>
          Every listing in the MALPOTH archive is cross-referenced against the
          official cadastral record (Naksa) and the land ownership ledger
          (Malpot) before publication. Listings that cannot be reconciled with
          the official record are not published.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>Lands Act, 2021 (2078)</h2>
        <p className={pClass}>
          We screen listings against the provisions of the Lands Act 2021,
          including restrictions on land fragmentation below minimum plot
          sizes, ceiling limits, and classification of land by use. Where a
          listing involves partial sale, the minimum buyable area shown on the
          listing reflects the statutory minimum for the relevant zone.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>Ownership &amp; Title</h2>
        <p className={pClass}>
          Ownership history is reviewed for disputes, liens and encumbrances.
          Sellers must demonstrate clear title through the ownership
          certificate (Lalpurja) and supporting documentation. Listings with
          unresolved title disputes are excluded from the archive.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>Foreign Ownership Restrictions</h2>
        <p className={pClass}>
          Under Nepali law, foreign nationals are restricted from purchasing
          land. MALPOTH listings are presented in accordance with these
          provisions, and our NRN concierge service advises non-resident
          Nepalis on the applicable rules before any transaction.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>Disclaimer</h2>
        <p className={pClass}>
          This page describes our compliance process and is not legal advice.
          Property transactions in Nepal involve statutory procedures that
          must be completed at the relevant Land Revenue Office. We recommend
          engaging a licensed legal practitioner for transaction-specific
          advice.
        </p>
      </section>
    </main>
  );
}