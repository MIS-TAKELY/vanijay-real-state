"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Icon } from "@repo/ui";
import { HorizontalScrollSection } from "../../common/HorizontalScrollSection";
import {
  fetchRecentlyAddedProperties,
  toCardPropsFromItem,
  type CardProperty,
  type PropertyItem,
} from "lib/api/services/properties";

function RecentlyAdded() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const scroll = (direction: "prev" | "next") => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector(
      "[data-card]",
    ) as HTMLElement | null;
    const cardWidth = card ? card.offsetWidth + 16 : 296;
    scrollRef.current.scrollBy({
      left: direction === "next" ? cardWidth : -cardWidth,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRecentlyAddedProperties(10)
      .then((data) => {
        if (!cancelled) {
          setItems(data.items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mapToCardProps = (p: PropertyItem): CardProperty => {
    return toCardPropsFromItem(p);
  };

  if (loading) {
    return (
      <section className="py-6 md:py-14 relative z-10">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex items-end justify-between mb-4 md:mb-6">
            <div>
              <p className="mb-1.5 md:mb-2 flex items-center gap-2 font-label-sm text-[9px] md:text-[11px] uppercase tracking-[0.14em] md:tracking-[0.18em] text-gold-deep font-bold">
                <span className="h-px w-5 md:w-7 bg-gold" aria-hidden />
                Fresh on the market
              </p>
              <h2 className="font-headline-md text-xl md:text-headline-md text-navy font-bold tracking-tight">
                Recently Added
              </h2>
            </div>
          </div>
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 pt-1 md:pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[220px] md:min-w-[280px] h-[300px] md:h-[420px] animate-pulse rounded-2xl bg-surface-container shrink-0"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-14 relative z-10">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex items-end justify-between mb-4 md:mb-6 gap-3">
          <div className="min-w-0">
            <p className="font-label-sm text-[9px] md:text-[11px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
              Fresh on the market
            </p>
            <h2 className="font-headline-md text-xl md:text-headline-md text-primary">
              Recently Added
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous"
              onClick={() => scroll("prev")}
              className="shrink-0 md:size-9"
            >
              <Icon name="chevron_left" className="text-base" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next"
              onClick={() => scroll("next")}
              className="shrink-0 md:size-9"
            >
              <Icon name="chevron_right" className="text-base" />
            </Button>
          </div>
        </div>

        <HorizontalScrollSection
          items={items.map(mapToCardProps)}
          accent="default"
          cardVariant="common"
          bare
        />
      </div>
    </section>
  );
}

export { RecentlyAdded };
