import React from "react";
import { Icon } from "@repo/ui";

const browseCards = [
  {
    title: "Browse Land",
    description: "Filter by area, soil quality, and future infrastructure plans.",
    icon: "arrow_forward",
    variant: "default" as const,
  },
  {
    title: "Browse Buildings",
    description:
      "Pre-inspected commercial and residential assets with full history.",
    icon: "arrow_forward",
    variant: "default" as const,
  },
  {
    title: "What's My Land Worth?",
    description:
      "Get an archival-grade valuation based on verified transaction data.",
    icon: "analytics",
    variant: "primary" as const,
  },
];

export function BrowseByIntent() {
  return (
    <section className="py-xl max-w-container-max mx-auto px-gutter relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {browseCards.map((card) => (
          <a
            key={card.title}
            className={`group relative p-lg rounded-2xl transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 block cursor-pointer ${
              card.variant === "primary"
                ? "bg-primary text-on-primary shadow-lg hover:shadow-xl hover:bg-primary/95"
                : "bg-surface border border-outline-variant hover:border-primary/60 hover:shadow-lg"
            }`}
            href="#"
          >
            <h3
              className={`font-headline-md text-headline-md mb-sm ${
                card.variant === "primary" ? "text-primary-fixed" : "text-primary"
              }`}
            >
              {card.title}
            </h3>
            <p
              className={`font-body-md mb-lg ${
                card.variant === "primary"
                  ? "text-primary-fixed-dim"
                  : "text-on-surface-variant"
              }`}
            >
              {card.description}
            </p>
            <Icon
              name={card.icon}
              className={`absolute bottom-lg right-lg group-hover:translate-x-1 transition-transform duration-300 ${
                card.variant === "primary" ? "text-primary-fixed" : "text-primary"
              }`}
            />
          </a>
        ))}
      </div>
    </section>
  );
}
