import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui";
import { about_stats } from "constants/varibles-constants";
import Link from "next/link";

/**
 * Server-rendered, AI-extractable text block for the homepage.
 *
 * The rest of the homepage is carousel/cards with no crawlable prose; this
 * section gives AI answer engines (and search engines) a self-contained
 * definition of MALPOTH, the verification methodology, the archive stats and
 * an FAQ. The FAQ is also emitted as FAQPage JSON-LD by the homepage — both
 * are built from HOME_FAQ_ITEMS so they never drift.
 */

export const HOME_FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "What is MALPOTH?",
    a: "MALPOTH is Nepal's archive of record for land and property — a marketplace where every listing is field-verified and cross-referenced against the official cadastral record (Naksa) and the Malpot land ownership ledger before publication. It covers land, homes, commercial and industrial property across 74 districts of Nepal.",
  },
  {
    q: "How does MALPOTH verify property listings?",
    a: "Every listing is cross-referenced against the official cadastral record (Naksa) and the Malpot land ownership ledger, then field-verified by our survey team. Ownership history is reviewed for disputes, liens and encumbrances. Listings that cannot be reconciled with the official record are not published.",
  },
  {
    q: "Which areas of Nepal does MALPOTH cover?",
    a: "MALPOTH indexes property across 74 districts, from 77 Land Revenue Offices — including Kathmandu, Lalitpur and Bhaktapur in the Kathmandu Valley, Pokhara in Gandaki, and districts across the Terai plains.",
  },
  {
    q: "Can foreigners buy land in Nepal?",
    a: "Under Nepali law, foreign nationals are restricted from purchasing land. Non-Resident Nepalis (NRN citizens) and Foreign Citizens of Nepali Origin (FCNO) may acquire land within prescribed limits under the Non-Resident Nepali Act. MALPOTH's NRN Concierge service handles the full remote purchase process.",
  },
  {
    q: "What land measurement units are used in Nepal?",
    a: "Nepal uses two traditional systems: Ropani-Aana-Paisa-Daam in the hills (1 Ropani = 16 Aana, 1 Aana = 342.25 sq ft) and Bigha-Katha-Dhur in the Terai (1 Bigha = 20 Katha, 1 Katha = 364.5 sq ft). MALPOTH provides a free land unit converter for exact conversions to square feet, square meters, acres and hectares.",
  },
];

const VERIFICATION_STEPS: Array<{ title: string; desc: string }> = [
  {
    title: "Cadastral cross-reference",
    desc: "The plot is reconciled against the official cadastral map (Naksa) held at the Land Revenue Office.",
  },
  {
    title: "Malpot ledger check",
    desc: "Ownership is traced through the Malpot land ownership ledger — disputes, liens and encumbrances screened out.",
  },
  {
    title: "Field verification",
    desc: "On-site surveyors verify boundaries, road access and physical condition before the listing enters the archive.",
  },
];


export function AboutArchive() {
  return (
    <section className="border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        {/* Definition block — the extractable answer to "What is MALPOTH?" */}
        <div className="max-w-3xl">
          <p className="font-label-sm mb-xs text-[11px] font-bold uppercase tracking-[0.8px] text-gold-deep">
            The archive of record
          </p>
          <h2 className="font-display mb-sm text-2xl font-semibold tracking-tight text-navy md:text-3xl">
            What is MALPOTH?
          </h2>
          <p className="text-base leading-relaxed text-on-surface-variant">
            MALPOTH is Nepal&apos;s archive of record for land and property
            &mdash; a marketplace where every listing is field-verified and
            cross-referenced against the official cadastral record (Naksa) and
            the Malpot land ownership ledger before publication. It covers
            land, homes, commercial and industrial property across 74 districts
            of Nepal, with zero title disputes.
          </p>
        </div>

        {/* Archive stats — citable numbers */}
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {about_stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-outline-variant bg-surface p-4 text-center"
            >
              <p className="mono-stat text-2xl font-bold text-navy md:text-3xl">
                {s.value}
              </p>
              <p className="font-label-sm mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-on-surface-variant">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Verification methodology */}
          <div>
            <h3 className="font-headline-md mb-4 text-lg font-semibold tracking-tight text-navy">
              How every listing is verified
            </h3>
            <ol className="space-y-4">
              {VERIFICATION_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="mono-stat flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold-soft/30 text-sm font-bold text-gold-deep">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-on-surface-variant">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-on-surface-variant">
              Read the full standard on our{" "}
              <Link
                href="/legal/land-act-compliance"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Land Act Compliance
              </Link>{" "}
              page, or learn{" "}
              <Link
                href="/about"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                about MALPOTH
              </Link>
              .
            </p>
          </div>

          {/* FAQ — visible content mirrored by FAQPage JSON-LD */}
          <div>
            <h3 className="font-headline-md mb-4 text-lg font-semibold tracking-tight text-navy">
              Frequently asked questions
            </h3>
            <Accordion type="single" collapsible>
              {HOME_FAQ_ITEMS.map((item, idx) => (
                <AccordionItem
                  key={item.q}
                  value={`home-faq-${idx}`}
                  className="border-outline-variant"
                >
                  <AccordionTrigger className="text-sm font-semibold text-on-surface hover:text-primary">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-on-surface-variant">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
