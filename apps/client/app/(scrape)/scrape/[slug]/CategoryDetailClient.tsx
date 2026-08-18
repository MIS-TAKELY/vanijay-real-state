"use client";

import { KabadiCategoryView, type KabadiCategoryViewData } from "@repo/ui";
import type { KabadiCategoryData } from "lib/kabadi/api";

/* ── Component ── */

interface CategoryDetailClientProps {
  category: KabadiCategoryData;
  allCategories: KabadiCategoryData[];
}

/**
 * Client wrapper that maps API data to the shared KabadiCategoryView.
 * Read-only mode for the public-facing category page.
 */
export function CategoryDetailClient({
  category,
  allCategories,
}: CategoryDetailClientProps) {
  const viewData: KabadiCategoryViewData = {
    ...category,
    items: category.items.map((i) => ({
      ...i,
      rate: i.rate,
    })),
  };

  const viewAllCategories: KabadiCategoryViewData[] = allCategories.map((c) => ({
    ...c,
    items: c.items.map((i) => ({
      ...i,
      rate: i.rate,
    })),
  }));

  return (
    <KabadiCategoryView
      category={viewData}
      allCategories={viewAllCategories}
      basePath="/scrape"
    />
  );
}
