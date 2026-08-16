import {
  ArrowRight,
  Box,
  Cpu,
  Hammer,
  Newspaper,
  Recycle,
  Refrigerator,
} from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@repo/ui";
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

export function CategoryGrid() {
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
          {KABADI_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.icon] ?? Recycle;
            const samples = KABADI_ITEMS.filter(
              (i) => i.category === cat.id && i.popular,
            );
            const sample =
              samples[0] ?? KABADI_ITEMS.find((i) => i.category === cat.id);

            return (
              <a key={cat.id} href="#rates" className="group block">
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
                          {formatRate(sample)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
