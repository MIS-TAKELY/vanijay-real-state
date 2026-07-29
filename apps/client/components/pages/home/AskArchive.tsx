import React from "react";
import { Card, Icon } from "@repo/ui";

const archiveCards = [
  {
    category: "Title Inquiry",
    question: "How do I know if a Guthi land plot is safely transferable?",
    action: "Read Analysis",
  },
  {
    category: "Investment Strategy",
    question: "What is the projected price trend for plots near the new bypass?",
    action: "View Projections",
  },
  {
    category: "Process Transparency",
    question: "What specific field checks are done during Lekhaprati verification?",
    action: "See Methodology",
  },
];

export function AskArchive() {
  return (
    <section className="py-xl max-w-container-max mx-auto px-gutter relative z-10">
      <h2 className="font-headline-md text-headline-md text-primary mb-lg">
        Ask the Archive
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {archiveCards.map((card) => (
          <Card
            key={card.category}
            className="group p-lg border-l-4 border-l-primary hover:shadow-lg transition-[box-shadow] duration-300 cursor-pointer"
          >
            <p className="font-label-sm text-on-surface-variant mb-sm uppercase tracking-wider text-[10px] font-bold">
              {card.category}
            </p>
            <p className="font-body-md font-semibold mb-md leading-snug">
              &quot;{card.question}&quot;
            </p>
            <button className="font-label-sm text-primary flex items-center gap-xs font-bold cursor-pointer">
              {card.action}
              <Icon name="arrow_forward" className="text-[16px] transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </Card>
        ))}
      </div>
    </section>
  );
}
