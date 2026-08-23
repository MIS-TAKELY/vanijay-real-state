"use client";

import { useEffect, useState } from "react";
import { HorizontalScrollSection } from "../../common/HorizontalScrollSection";
import { RailSectionSkeleton } from "./skeletons";
import {
  fetchTrendingPropertiesGraphql,
  fetchFeaturedProperties,
  toCardPropsFromItem,
  type CardProperty,
  type PropertyItem,
} from "lib/api/services/properties";

function mapToCardProps(p: PropertyItem): CardProperty {
  return toCardPropsFromItem(p);
}

function mapToTrendingCardProps(p: PropertyItem): CardProperty {
  return { ...toCardPropsFromItem(p), badge: "HOT" };
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
    /* Skeleton mirrors the two loaded rails' exact geometry so the
     * loading → loaded swap produces zero layout shift. */
    return (
      <>
        <RailSectionSkeleton title="Featured Properties" />
        <RailSectionSkeleton title="Trending Now" tinted />
      </>
    );
  }

  return (
    <>
      {similarItems.length > 0 && (
        <HorizontalScrollSection
          eyebrow="Handpicked for you"
          title="Featured Properties"
          items={similarItems.map(mapToCardProps)}
          viewAllHref="/"
          accent="default"
          cardVariant="common"
        />
      )}
      {trendingItems.length > 0 && (
        <HorizontalScrollSection
          title="Trending Now"
          items={trendingItems.map(mapToTrendingCardProps)}
          viewAllHref="/"
          accent="trending"
          cardVariant="common"
        />
      )}
    </>
  );
}
