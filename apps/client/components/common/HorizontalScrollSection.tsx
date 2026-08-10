"use client";

import { Button, Icon } from "@repo/ui";
import { useRef } from "react";
import {
  PropertyHorizontalCard,
  type PropertyHorizontalCardProps,
} from "./PropertyHorizontalCard";

export interface HorizontalScrollSectionProps {
  eyebrow?: string;
  title: string;
  items: PropertyHorizontalCardProps[];
  viewAllHref?: string;
  accent?: "default" | "primary-left" | "trending";
}

export function HorizontalScrollSection({
  eyebrow,
  title,
  items,
  viewAllHref = "#",
  accent = "default",
}: HorizontalScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: "prev" | "next") => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector(
      "[data-card]",
    ) as HTMLElement | null;
    const cardWidth = card ? card.offsetWidth + 16 : 336;
    scrollRef.current.scrollBy({
      left: direction === "next" ? cardWidth : -cardWidth,
      behavior: "smooth",
    });
  };

  const cardClassName =
    accent === "primary-left"
      ? "border-l-4 border-l-primary border-outline-variant"
      : accent === "trending"
        ? "border-l-4 border-l-destructive border-outline-variant"
        : "border border-outline-variant";

  return (
    <section
      className={`py-10 md:py-14 relative z-10 ${accent === "trending" ? "bg-surface-container-low" : ""}`}
    >
      <div className="max-w-container-max mx-auto px-gutter">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-center gap-2">
            {eyebrow && (
              <p className="font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                {eyebrow}
              </p>
            )}
            <h2 className="font-headline-md text-headline-md text-primary">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={viewAllHref}
              className="hidden sm:inline-flex items-center gap-1 font-label-sm text-sm text-primary font-semibold hover:underline underline-offset-4"
            >
              View All
              <Icon name="arrow_forward" className="text-data-table" />
            </a>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label={`Previous ${title}`}
                onClick={() => scrollByCard("prev")}
                className="shrink-0"
              >
                <Icon name="chevron_left" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={`Next ${title}`}
                onClick={() => scrollByCard("next")}
                className="shrink-0"
              >
                <Icon name="chevron_right" />
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 pt-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "x mandatory",
          }}
        >
          {items.map((item) => (
            <PropertyHorizontalCard key={item.id} {...item} className={cardClassName} />
          ))}
        </div>
      </div>
    </section>
  );
}
