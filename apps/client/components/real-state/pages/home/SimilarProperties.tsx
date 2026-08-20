"use client";

import { useEffect, useState } from "react";
import { HorizontalScrollSection } from "../../common/HorizontalScrollSection";
import {
  fetchSimilarProperties,
  toCardPropsFromItem,
  type CardProperty,
  type PropertyItem,
} from "lib/api/services/properties";

function mapToCardProps(p: PropertyItem): CardProperty {
  return toCardPropsFromItem(p);
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
      viewAllHref="/"
      accent="default"
      cardVariant="common"
      flush
    />
  );
}
