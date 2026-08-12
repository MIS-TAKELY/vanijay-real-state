"use client";

import { useEffect, useState } from "react";
import { HorizontalScrollSection } from "../../common/HorizontalScrollSection";
import { fetchFeaturedProperties, toCardPropsFromItem, type CardProperty, type PropertyItem } from "lib/api/services/properties";

function mapToCardProps(p: PropertyItem): CardProperty {
  return { ...toCardPropsFromItem(p), badge: "FEATURED" };
}

export function FeaturedListings() {
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFeaturedProperties(10)
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

  if (loading) {
    return (
      <section className="py-10 md:py-14 bg-surface-container-low relative z-10">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="text-center mb-10">
            <p className="font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
              Handpicked for you
            </p>
            <h2 className="font-headline-md text-headline-md text-primary">
              Featured Listings
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[280px] md:min-w-[320px] max-w-[320px] h-[460px] animate-pulse rounded-2xl bg-surface-container" />
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
    <section className="py-10 md:py-14 bg-surface-container-low relative z-10">
      <div className="max-w-container-max mx-auto px-gutter">
        <HorizontalScrollSection
          eyebrow="Handpicked for you"
          title="Featured Listings"
          items={items.map(mapToCardProps)}
          viewAllHref="/"
          accent="trending"
          cardVariant="common"
        />
      </div>
    </section>
  );
}
