import { SITE_URL } from "lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MALPOTH",
  description:
    "How MALPOTH collects, uses and protects your personal information when you browse verified land and property listings in Nepal.",
  alternates: { canonical: "/legal/privacy" },
  openGraph: {
    title: "Privacy Policy | MALPOTH",
    description:
      "How MALPOTH collects, uses and protects your personal information.",
    url: `${SITE_URL}/legal/privacy`,
    siteName: "MALPOTH",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const sectionClass = "mb-8";
const h2Class =
  "mb-3 font-headline-md text-lg font-semibold tracking-tight text-navy";
const pClass = "mb-3 text-sm leading-relaxed text-on-surface-variant";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-gutter py-12 md:py-16">
      <p className="mb-2 font-label-sm text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
        Legal
      </p>
      <h1 className="mb-2 font-display-lg text-3xl font-semibold tracking-tight text-navy md:text-4xl">
        Privacy Policy
      </h1>
      <p className="mb-10 text-xs text-on-surface-variant">
        Last updated: August 2026
      </p>

      <section className={sectionClass}>
        <h2 className={h2Class}>1. Information We Collect</h2>
        <p className={pClass}>
          When you use MALPOTH, we may collect information you provide
          directly — such as your name, email address and phone number when
          you create an account, save a search, or inquire about a listing —
          as well as usage data such as pages visited, listings viewed and
          device information, which we use to improve the archive.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>2. How We Use Your Information</h2>
        <p className={pClass}>
          We use your information to operate and improve the platform, respond
          to inquiries, notify you about listings that match your saved
          searches, verify seller identities, and comply with legal
          obligations. We do not sell your personal information to third
          parties.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>3. Data Sharing</h2>
        <p className={pClass}>
          Listing details you submit as a seller are published on the platform
          as part of the public archive. We share personal data only with
          service providers that help us operate the platform (hosting,
          authentication, email delivery) and when required by law.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>4. Cookies</h2>
        <p className={pClass}>
          We use essential cookies to keep you signed in and to remember your
          preferences. Analytics cookies help us understand how the archive is
          used. You can control cookies through your browser settings.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>5. Data Retention &amp; Security</h2>
        <p className={pClass}>
          We retain personal data only as long as necessary for the purposes
          described above or as required by law. Data is stored using
          industry-standard encryption and access controls.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>6. Your Rights</h2>
        <p className={pClass}>
          You may request access to, correction of, or deletion of your
          personal information at any time by contacting us at
          info@malpoth.com.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>7. Contact</h2>
        <p className={pClass}>
          Questions about this policy can be sent to info@malpoth.com or by
          post to MALPOTH, Durbar Marg, Kathmandu, Nepal.
        </p>
      </section>
    </main>
  );
}