import { buildHreflang } from "lib/i18n";
import { SITE_URL } from "lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | MALPOTH",
  description:
    "The terms and conditions governing your use of MALPOTH — Nepal's verified land and property archive.",
  alternates: {
    canonical: "/legal/terms",
    languages: buildHreflang("/legal/terms"),
  },
  openGraph: {
    title: "Terms of Service | MALPOTH",
    description:
      "The terms and conditions governing your use of MALPOTH.",
    url: `${SITE_URL}/legal/terms`,
    siteName: "MALPOTH",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
    },
  },
};

const sectionClass = "mb-8";
const h2Class =
  "mb-3 font-headline-md text-lg font-semibold tracking-tight text-navy";
const pClass = "mb-3 text-sm leading-relaxed text-on-surface-variant";

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-3xl px-gutter py-12 md:py-16">
      <p className="mb-2 font-label-sm text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
        Legal
      </p>
      <h1 className="mb-2 font-display-lg text-3xl font-semibold tracking-tight text-navy md:text-4xl">
        Terms of Service
      </h1>
      <p className="mb-10 text-xs text-on-surface-variant">
        Last updated: August 2026
      </p>

      <section className={sectionClass}>
        <h2 className={h2Class}>1. Acceptance of Terms</h2>
        <p className={pClass}>
          By accessing or using MALPOTH, you agree to be bound by these Terms
          of Service. If you do not agree, do not use the platform.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>2. The Archive &amp; Listings</h2>
        <p className={pClass}>
          MALPOTH publishes land and property listings that have passed our
          field-verification and cadastral cross-referencing process. While we
          exercise rigorous diligence, listing information is provided for
          informational purposes and does not constitute legal advice. Buyers
          should conduct their own due diligence before any transaction.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>3. Accounts</h2>
        <p className={pClass}>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity under your account. You
          agree to provide accurate information when registering or submitting
          listings.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>4. Seller Obligations</h2>
        <p className={pClass}>
          Sellers warrant that they have the legal right to offer the property
          listed and that all information and documents submitted are accurate.
          MALPOTH reserves the right to reject, unpublish or remove any
          listing that fails verification or violates these terms.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>5. Prohibited Use</h2>
        <p className={pClass}>
          You agree not to scrape, reproduce, or redistribute archive content
          without written permission; submit fraudulent listings; interfere
          with the platform&apos;s operation; or use the service for any
          unlawful purpose.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>6. Limitation of Liability</h2>
        <p className={pClass}>
          To the maximum extent permitted by law, MALPOTH is not liable for
          indirect, incidental or consequential damages arising from your use
          of the platform, including losses resulting from transactions
          between buyers and sellers.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>7. Changes &amp; Contact</h2>
        <p className={pClass}>
          We may update these terms from time to time; continued use of the
          platform constitutes acceptance of the revised terms. Questions can
          be sent to hello@malpoth.com.
        </p>
      </section>
    </main>
  );
}