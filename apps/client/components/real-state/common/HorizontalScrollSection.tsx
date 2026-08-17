"use client";

import { Button, Icon, cn } from "@repo/ui";
import { useRef } from "react";
import {
  PropertyHorizontalCard,
  type PropertyHorizontalCardProps,
} from "./PropertyHorizontalCard";
import { PropertyCard } from "./PropertyCard";
import type { CardProperty } from "lib/api/services/properties/types";

export type ScrollCardVariant = "horizontal" | "common";

export interface HorizontalScrollSectionProps {
  eyebrow?: string;
  title?: string;
  items: PropertyHorizontalCardProps[] | CardProperty[];
  viewAllHref?: string;
  accent?: "default" | "primary-left" | "trending";
  /** Which card renders in the rail: the slim `PropertyHorizontalCard` or the
   *  rich `PropertyCard` used by the listings feed. */
  cardVariant?: ScrollCardVariant;
  /** When true, only the scroll row is rendered (no section wrapper or header).
   *  `title`, `eyebrow`, and `viewAllHref` are ignored in this mode. */
  bare?: boolean;
}

export function HorizontalScrollSection({
  eyebrow,
  title,
  items,
  viewAllHref = "#",
  accent = "default",
  cardVariant = "horizontal",
  bare = false,
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

  // Rich card accent + rail sizing (the slim card already carries its own
  // width via min/max classes, so only the left accent border is layered on).
  const commonCardClassName = cn(
    "w-[220px] min-w-[220px] max-w-[220px] sm:w-[240px] sm:min-w-[240px] sm:max-w-[240px] md:min-w-[250px] md:max-w-[280px] md:w-auto shrink-0 snap-start",
    accent === "primary-left"
      ? "border-l-4 border-l-primary"
      : accent === "trending"
        ? "border-l-4 border-l-destructive"
        : "",
  );

  const scrollRow = (
    <div
      ref={scrollRef}
      className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3 md:pb-4 pt-1 md:pt-2"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        scrollSnapType: "x mandatory",
      }}
    >
      {cardVariant === "common"
        ? (items as CardProperty[]).map((item) => (
            <PropertyCard
              key={item.id}
              property={item}
              className={commonCardClassName}
            />
          ))
        : (items as PropertyHorizontalCardProps[]).map((item) => (
            <PropertyHorizontalCard
              key={item.id}
              {...item}
              className={cardClassName}
            />
          ))}
    </div>
  );

  // Bare mode — only render the scroll row (caller provides its own section/header)
  if (bare) {
    return scrollRow;
  }

  return (
    <section
      className={`py-6 md:py-14 relative z-10 ${accent === "trending" ? "" : ""}`}
    >
      <div className="max-w-container-max mx-auto px-gutter">
        {/* Header */}
        <div className="flex items-end justify-between mb-4 md:mb-6 gap-3">
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-1.5 md:mb-2 flex items-center gap-2 font-label-sm text-[9px] md:text-[11px] uppercase tracking-[0.14em] md:tracking-[0.18em] text-gold-deep font-bold">
                <span className="h-px w-5 md:w-7 bg-gold" aria-hidden />
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-headline-md text-xl md:text-headline-md text-navy font-bold tracking-tight">
                {title}
              </h2>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 md:gap-4">
            <a
              href={viewAllHref}
              className="hidden sm:inline-flex items-center gap-1 font-label-sm text-sm text-gold-deep font-semibold hover:text-navy hover:underline underline-offset-4"
            >
              View All
              <Icon name="arrow_forward" className="text-data-table" />
            </a>
            <div className="flex items-center gap-1.5 md:gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`Previous ${title ?? "items"}`}
                onClick={() => scrollByCard("prev")}
                className="shrink-0 md:size-9"
              >
                <Icon name="chevron_left" className="text-base" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`Next ${title ?? "items"}`}
                onClick={() => scrollByCard("next")}
                className="shrink-0 md:size-9"
              >
                <Icon name="chevron_right" className="text-base" />
              </Button>
            </div>
          </div>
        </div>

        {scrollRow}
      </div>
    </section>
  );
}
