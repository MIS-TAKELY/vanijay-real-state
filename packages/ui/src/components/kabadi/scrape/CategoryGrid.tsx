"use client";

import Link from "next/link";
import {
  ArrowRight,
  Box,
  Cpu,
  Hammer,
  Newspaper,
  Recycle,
  Refrigerator,
} from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { EditableField } from "./EditableField";
import { formatRate } from "./helpers";
import type { ScrapeCategorySummary, ScrapeItemSummary, OnSectionFieldChange } from "./types";

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  newspaper: Newspaper,
  recycling: Recycle,
  hammer: Hammer,
  cpu: Cpu,
  refrigerator: Refrigerator,
  bottle: Box,
};

interface CategoryGridProps {
  categories: ScrapeCategorySummary[];
  items?: ScrapeItemSummary[];
  editable?: boolean;
  onFieldChange?: OnSectionFieldChange;
}

export function CategoryGrid({
  categories,
  items,
  editable = false,
  onFieldChange,
}: CategoryGridProps) {
  const allItems: ScrapeItemSummary[] = items && items.length > 0
    ? items
    : categories.flatMap((c) => c.items ?? []);

  return (
    <section
      id="categories"
      className="scroll-mt-24 border-b border-border py-16 md:py-24"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div className="max-w-2xl">
          <p className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Categories
          </p>
          <EditableField
            tag="h2"
            value="Six kinds of kabadi, all with honest prices"
            onChange={(v) => onFieldChange?.("categoryGrid", "heading", v)}
            editable={editable}
            className="mt-2 font-display-lg text-3xl tracking-tight text-foreground sm:text-4xl"
          />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.icon ?? ""] ?? Recycle;
            const categoryItems = allItems.filter(
              (i) => i.category === cat.slug,
            );
            const popularSample = categoryItems.find((i) => i.popular);
            const sample = popularSample ?? categoryItems[0];

            return (
              <Link
                key={cat.id}
                href={`/scrape/${cat.slug}`}
                className="group block"
              >
                <Card className="h-full rounded-2xl border-border transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-[0_20px_48px_-20px_rgba(16,48,80,0.35)]">
                  <CardHeader>
                    <CardTitle>
                      <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary transition-transform duration-300 group-hover:scale-110">
                        <Icon className="size-6" />
                      </span>
                    </CardTitle>
                    <CardAction>
                      <ArrowRight className="size-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </CardAction>
                    <CardTitle className="mt-3 text-lg font-semibold text-foreground">
                      {editable ? (
                        <EditableField
                          value={cat.name}
                          onChange={(v) =>
                            onFieldChange?.(`category:${cat.id}`, "name", v)
                          }
                          editable
                        />
                      ) : (
                        cat.name
                      )}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pb-6">
                    <p className="font-label-sm text-label-sm text-primary">
                      {editable ? (
                        <EditableField
                          value={cat.nepali ?? ""}
                          onChange={(v) =>
                            onFieldChange?.(`category:${cat.id}`, "nepali", v)
                          }
                          editable
                        />
                      ) : (
                        cat.nepali
                      )}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {editable ? (
                        <EditableField
                          value={cat.blurb ?? ""}
                          onChange={(v) =>
                            onFieldChange?.(`category:${cat.id}`, "blurb", v)
                          }
                          editable
                          multiline
                        />
                      ) : (
                        cat.blurb
                      )}
                    </p>

                    {sample && (
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-background px-4 py-3">
                        <span className="font-label-sm text-label-sm text-muted-foreground">
                          e.g. {sample.name}
                        </span>
                        <span className="font-data-table text-sm font-bold text-primary">
                          {formatRate({ rate: sample.rate, unit: sample.unit })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
