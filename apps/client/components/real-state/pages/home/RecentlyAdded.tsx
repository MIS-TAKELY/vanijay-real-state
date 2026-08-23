"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Icon } from "@repo/ui";
import { HorizontalScrollSection } from "../../common/HorizontalScrollSection";
import { RailSectionSkeleton } from "./skeletons";
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
    /* Skeleton mirrors the loaded section's exact geometry (header + rail
     * card sizes) so the swap produces zero layout shift. */
    return <RailSectionSkeleton title="Recently Added" count={4} />;
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
