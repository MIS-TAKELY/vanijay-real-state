"use client";

import { useEffect, useState } from "react";
import { HorizontalScrollSection, type HorizontalScrollSectionProps } from "../../common/HorizontalScrollSection";
import { fetchSimilarProperties, type PropertyItem } from "lib/api/services/properties";

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
    beds: undefined,
    baths: undefined,
    sqft: undefined,
    alt: p.title,
  };
}

export function SimilarProperties({ propertyId }: { propertyId: string }) {
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;
    
    let cancelled = false;
    setLoading(true);
    fetchSimilarProperties(propertyId, 10)
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
  }, [propertyId]);

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <HorizontalScrollSection
      title="Similar Properties"
      items={items.map(mapToCardProps)}
      viewAllHref="/listings"
      accent="default"
    />
  );
}
