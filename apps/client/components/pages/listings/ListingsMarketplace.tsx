"use client";

import { useEffect, useState } from "react";
import { HorizontalScrollSection, type HorizontalScrollSectionProps } from "../../common/HorizontalScrollSection";
import { fetchTrendingPropertiesGraphql, fetchFeaturedProperties, type PropertyItem } from "lib/api/services/properties";

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
    badge: undefined,
  };
}

function mapToTrendingCardProps(p: PropertyItem): HorizontalScrollSectionProps["items"][number] {
  const coverImage = p.media?.find((m) => m.isCover) || p.media?.[0];
  return {
    id: p.id,
    title: p.title,
    location: p.location?.areaName || p.location?.municipality || "Location TBD",
    price: `NPR ${p.askingPrice.toLocaleString()}`,
    image: coverImage?.url || "",
    listingType: "For Sale" as const,
    href: `/listing/${p.slug}`,
    badge: "HOT" as const,
  };
}

export function ListingsMarketplace() {
  const [trendingItems, setTrendingItems] = useState<PropertyItem[]>([]);
  const [similarItems, setSimilarItems] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Fetch trending properties
    fetchTrendingPropertiesGraphql(10, "7d")
      .then((data) => {
        if (!cancelled) {
          setTrendingItems(data.items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTrendingItems([]);
        }
      });

    // Fetch featured properties for the marketplace
    fetchFeaturedProperties(10)
      .then((data) => {
        if (!cancelled) {
          setSimilarItems(data.items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSimilarItems([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && trendingItems.length === 0 && similarItems.length === 0) {
    return (
      <>
        <div className="py-8">
          <h2 className="font-headline-md text-headline-md text-primary mb-4">Featured Properties</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[280px] h-80 animate-pulse rounded-2xl bg-surface-container" />
            ))}
          </div>
        </div>
        <div className="py-8">
          <h2 className="font-headline-md text-headline-md text-primary mb-4">Trending Now</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[280px] h-80 animate-pulse rounded-2xl bg-surface-container" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {similarItems.length > 0 && (
        <HorizontalScrollSection
          title="Featured Properties"
          items={similarItems.map(mapToCardProps)}
          viewAllHref="/listings"
          accent="default"
        />
      )}
      {trendingItems.length > 0 && (
        <HorizontalScrollSection
          title="Trending Now"
          items={trendingItems.map(mapToTrendingCardProps)}
          viewAllHref="/listings"
          accent="trending"
        />
      )}
    </>
  );
}
