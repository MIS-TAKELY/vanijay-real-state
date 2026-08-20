import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui";

/**
 * Server-rendered FAQ for the NRN Concierge page. Answers the fan-out
 * questions AI engines ask about NRN land purchase ("can NRN buy land in
 * Nepal", "buy land in Nepal from abroad", "NRN power of attorney").
 * Mirrored as FAQPage JSON-LD by the page — both built from NRN_FAQ_ITEMS.
 */

export const NRN_FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "Can Non-Resident Nepalis buy land in Nepal?",
    a: "Yes. Under Nepal's Non-Resident Nepali Act, NRN citizens and Foreign Citizens of Nepali Origin (FCNO) may acquire land within prescribed limits. Our concierge desk verifies your eligibility under the Act before any transaction begins.",
  },
  {
    q: "Do I need to travel to Nepal to complete the purchase?",
    a: "No. You execute a Power of Attorney at the nearest Nepali embassy or consulate, and our concierge team completes title verification, escrow settlement and title transfer on your behalf, with legal representation at every step.",
  },
  {
    q: "What documents do I need to buy land as an NRN?",
    a: "Four documents: a valid NRN identity card confirming your NRN or FCNO status, your current passport, proof of funds from a bank or financial institution, and a Power of Attorney executed at a Nepali embassy or consulate. We provide the POA template.",
  },
  {
    q: "How is the land title verified before purchase?",
    a: "The ownership certificate (Lalpurja) is cross-referenced against the Land Revenue Office master ledger and the official cadastral map (Naksa). On-site surveyors then field-verify the boundaries. Plots with unresolved title disputes, liens or encumbrances never enter the archive.",
  },
  {
    q: "What are the stages of a remote land purchase?",
    a: "Four stages: (1) Selection — identify cadastral-cleared, surveyed lots in the digital archive; (2) Verification — title search and field verification of maps by on-site surveyors; (3) POA Filing — execute Power of Attorney at the nearest Nepali embassy; (4) Settlement — secure escrow and title transfer with legal representation.",
  },
];

export function Faq() {
  return (
    <section className="border-t border-outline-variant bg-surface">
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        <div className="mx-auto max-w-3xl">
          <p className="font-label-sm mb-xs text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface-variant">
            Common questions
          </p>
          <h2 className="font-headline-md mb-sm text-2xl font-semibold tracking-tight text-primary md:text-3xl">
            NRN Land Purchase — Frequently Asked Questions
          </h2>
          <p className="mb-lg text-sm leading-relaxed text-on-surface-variant">
            Direct answers to the most common questions about buying land in
            Nepal as a Non-Resident Nepali.
          </p>
          <Accordion type="single" collapsible>
            {NRN_FAQ_ITEMS.map((item, idx) => (
              <AccordionItem
                key={item.q}
                value={`nrn-faq-${idx}`}
                className="border-outline-variant"
              >
                <AccordionTrigger className="font-semibold text-on-surface hover:text-primary">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="leading-relaxed text-on-surface-variant">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
