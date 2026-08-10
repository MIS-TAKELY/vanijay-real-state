"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@repo/ui";
import { HorizontalScrollSection, type HorizontalScrollSectionProps } from "../../common/HorizontalScrollSection";
import { fetchTrendingPropertiesGraphql, type PropertyItem } from "lib/api/services/properties";

function mapToCardProps(p: PropertyItem): HorizontalScrollSectionProps["items"][number] {
  const coverImage = p.media?.find((m) => m.isCover) || p.media?.[0];
  return {
    id: p.id,
    title: p.title,
    location: p.location?.areaName || p.location?.municipality || "Location TBD",
    price: `NPR ${p.askingPrice.toLocaleString()}`,
    image: coverImage?.url || "",
    listingType: "For Sale" as const,
    href: `/listing/${p.slug}`,
    badge: "TRENDING",
  };
}

export function TrendingProperties() {
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTrendingPropertiesGraphql(10, "7d")
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
      <section className="py-xl relative z-10">
        <div className="max-w-container-max mx-auto px-gutter">
          <h2 className="font-headline-md text-headline-md text-primary mb-lg">Trending Properties</h2>
          <div className="flex gap-md overflow-x-auto pb-lg pt-2 no-scrollbar snap-x">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[280px] md:min-w-[320px] max-w-[320px] h-80 animate-pulse rounded-2xl bg-surface-container" />
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
    <section className="py-xl relative z-10">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-md mb-lg">
          <div>
            <p className="font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant font-bold mb-xs">
              Most Popular
            </p>
            <h2 className="font-headline-md text-headline-md text-primary">
              Trending Properties
            </h2>
          </div>
          <Link
            href="/listings"
            className="hidden sm:inline-flex items-center gap-xs font-label-sm text-sm text-primary font-semibold hover:underline underline-offset-4 cursor-pointer"
          >
            View all listings
            <Icon name="arrow_forward" className="text-data-table" />
          </Link>
        </div>
        <HorizontalScrollSection
          title="Trending Now"
          items={items.map(mapToCardProps)}
          viewAllHref="/listings"
          accent="trending"
        />
      </div>
    </section>
  );
}
