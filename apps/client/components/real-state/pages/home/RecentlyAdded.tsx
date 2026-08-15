"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Icon } from "@repo/ui";
import { HorizontalScrollSection } from "../../common/HorizontalScrollSection";
import { fetchRecentlyAddedProperties, toCardPropsFromItem, type CardProperty, type PropertyItem } from "lib/api/services/properties";

function RecentlyAdded() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const scroll = (direction: "prev" | "next") => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-card]") as HTMLElement | null;
    const cardWidth = card ? card.offsetWidth + 16 : 296;
    scrollRef.current.scrollBy({ left: direction === "next" ? cardWidth : -cardWidth, behavior: "smooth" });
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
      <section className="py-10 md:py-14 relative z-10">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                Fresh on the market
              </p>
              <h2 className="font-headline-md text-headline-md text-primary">
                Recently Added
              </h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[280px] md:min-w-[320px] h-[500px] animate-pulse rounded-2xl bg-surface-container" />
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
    <section className="py-10 md:py-14 relative z-10">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
              Fresh on the market
            </p>
            <h2 className="font-headline-md text-headline-md text-primary">
              Recently Added
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Previous" onClick={() => scroll("prev")} className="shrink-0">
              <Icon name="chevron_left" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Next" onClick={() => scroll("next")} className="shrink-0">
              <Icon name="chevron_right" />
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
