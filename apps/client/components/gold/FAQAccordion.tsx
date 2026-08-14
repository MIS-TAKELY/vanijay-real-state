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
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section aria-labelledby="faq-heading">
      <h2
        id="faq-heading"
        className="mb-6 text-2xl font-medium tracking-tight md:text-3xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Frequently Asked Questions
        <span className="ml-3 text-base font-normal text-white/30">
          About {metalName}
        </span>
      </h2>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Accordion type="single" collapsible className="w-full space-y-2">
        {items.map((item, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="border-b border-white/[0.06] bg-[#1A1D23]/50 px-4 py-1 rounded-lg data-[state=open]:bg-[#1A1D23]"
          >
            <AccordionTrigger className="text-left text-sm font-medium text-[#E8E6E1] hover:text-[#C9A84C] transition-colors py-3 [&>svg]:text-white/30">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-white/60 pb-4 pt-1">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
