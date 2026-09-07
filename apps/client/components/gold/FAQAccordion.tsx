"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@repo/ui";
import type { FAQItem } from "../../constants/gold/faq-data";

interface FAQAccordionProps {
  items: FAQItem[];
  metalName: string;
}

export function FAQAccordion({ items, metalName }: FAQAccordionProps) {
  // FAQPage JSON-LD is emitted server-side by MetalJsonLd so crawlers see it
  // without waiting on client JS (and to avoid duplicate FAQ graphs).
  return (
    <section aria-labelledby="faq-heading">
      <h2
        id="faq-heading"
        className="mb-4 text-xl font-medium tracking-tight text-on-surface sm:mb-6 sm:text-2xl md:text-3xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Frequently Asked Questions
        <span className="ml-3 text-base font-normal text-on-surface-variant">
          About {metalName}
        </span>
      </h2>

      <Accordion type="single" collapsible className="w-full space-y-2">
        {items.map((item, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="rounded-lg border border-outline-variant bg-surface px-4 py-1 shadow-sm data-[state=open]:bg-surface-container/60"
          >
            <AccordionTrigger className="py-3 text-left text-sm font-medium text-on-surface transition-colors hover:text-gold-deep [&>svg]:text-on-surface-variant/50">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1 text-sm leading-relaxed text-on-surface-variant">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}