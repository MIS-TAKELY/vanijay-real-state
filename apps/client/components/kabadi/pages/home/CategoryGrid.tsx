import {
  ArrowRight,
  Box,
  Cpu,
  Hammer,
  Newspaper,
  Recycle,
  Refrigerator,
} from "lucide-react";
import Link from "next/link";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@repo/ui";
import type { KabadiCategoryData } from "lib/kabadi/api";
import { formatRate, KABADI_CATEGORIES, KABADI_ITEMS } from "lib/kabadi/rates";

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
  categories?: KabadiCategoryData[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Use API data if available, fallback to hardcoded
  const displayCategories =
    categories && categories.length > 0
      ? categories
      : KABADI_CATEGORIES.map((c) => ({
          ...c,
          id: c.id,
          slug: c.id,
          nepali: c.nepali,
          icon: c.icon,
          blurb: c.blurb,
          sortOrder: 0,
          published: true,
          items: [] as any[],
        }));

  const displayItems =
    categories && categories.length > 0
      ? categories.flatMap((c) =>
          c.items.map((i) => ({
            ...i,
            category: c.slug,
            unit: i.unit.toLowerCase() as "kg" | "piece",
            rate: Number(i.rate),
          })),
        )
      : KABADI_ITEMS;

  return (
    <section
      id="categories"
      className="scroll-mt-24 border-b border-kabadi-border py-16 md:py-24"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div className="max-w-2xl">
          <p className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.2em] text-kabadi-primary">
            Categories
          </p>
          <h2 className="mt-2 font-display-lg text-4xl tracking-tight text-kabadi-on-bg">
            Six kinds of kabadi, all with honest prices
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayCategories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.icon ?? ""] ?? Recycle;
            const samples = displayItems.filter(
              (i) => i.category === cat.slug && i.popular,
            );
            const sample =
              samples[0] ?? displayItems.find((i) => i.category === cat.slug);

            return (
              <Link key={cat.id} href={`/scrape/${cat.slug}`} className="group block">
                <Card className="h-full rounded-2xl border-kabadi-border transition-all duration-300 group-hover:-translate-y-1 group-hover:border-kabadi-primary/40 group-hover:shadow-[0_20px_48px_-20px_rgba(26,107,60,0.35)]">
                  <CardHeader>
                    <CardTitle>
                      <span className="flex size-12 items-center justify-center rounded-xl bg-kabadi-primary-soft text-kabadi-primary transition-transform duration-300 group-hover:scale-110">
                        <Icon className="size-6" />
                      </span>
                    </CardTitle>
                    <CardAction>
                      <ArrowRight className="size-5 text-kabadi-muted opacity-0 transition-opacity group-hover:opacity-100" />
                    </CardAction>
                    <CardTitle className="mt-3 text-lg font-semibold text-kabadi-on-bg">
                      {cat.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pb-6">
                    <p className="font-label-sm text-label-sm text-kabadi-primary">
                      {cat.nepali}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-kabadi-muted">
                      {cat.blurb}
                    </p>

                    {sample && (
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-kabadi-bg px-4 py-3">
                        <span className="font-label-sm text-label-sm text-kabadi-muted">
                          e.g. {sample.name}
                        </span>
                        <span className="font-data-table text-sm font-bold text-kabadi-primary">
                          {formatRate({
                            rate: Number(sample.rate),
                            unit: sample.unit,
                          })}
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
