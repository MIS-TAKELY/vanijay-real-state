"use client";

import { useEffect, useState } from "react";
import { HorizontalScrollSection } from "../../common/HorizontalScrollSection";
import { fetchTrendingPropertiesGraphql, fetchFeaturedProperties, toCardPropsFromItem, type CardProperty, type PropertyItem } from "lib/api/services/properties";

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
    return (
      <>
        <div className="py-10 md:py-14">
          <div className="max-w-container-max mx-auto px-gutter">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">Featured Properties</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[280px] md:min-w-[320px] h-[460px] animate-pulse rounded-2xl bg-surface-container" />
              ))}
            </div>
          </div>
        </div>
        <div className="py-10 md:py-14 bg-surface-container-low">
          <div className="max-w-container-max mx-auto px-gutter">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">Trending Now</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[280px] md:min-w-[320px] h-[460px] animate-pulse rounded-2xl bg-surface-container" />
              ))}
            </div>
          </div>
        </div>
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
