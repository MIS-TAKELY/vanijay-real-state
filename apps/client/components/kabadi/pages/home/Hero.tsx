import { ArrowRight, Banknote, Search, Truck, Weight } from "lucide-react";
import { Badge, Button, Input } from "@repo/ui";
import { KABADI_CATEGORIES, KABADI_ITEMS } from "lib/kabadi/rates";

const STATS = [
  { icon: Weight, value: `${KABADI_ITEMS.length}+`, label: "Items priced" },
  { icon: Truck, value: "Same-day", label: "Doorstep pickup" },
  { icon: Banknote, value: "Cash", label: "On the spot" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-kabadi-border">
      <div className="kabadi-grid-bg absolute inset-0 pointer-events-none" />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[54rem] -translate-x-1/2 rounded-full bg-kabadi-accent/15 blur-[110px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-container-max px-gutter py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="border-kabadi-primary/25 bg-kabadi-primary-soft px-4 py-1.5 font-label-sm text-label-sm font-semibold text-kabadi-primary"
          >
            कबाडी बेच्नुहोस् · नगद पाउनुहोस्
            <span className="text-kabadi-muted">·</span>
            transparent Kathmandu rates
          </Badge>

          <h1 className="mt-6 font-display-lg text-5xl leading-[1.04] tracking-tight text-kabadi-on-bg md:text-7xl">
            Turn your kabadi
            <span className="kabadi-glow block bg-gradient-to-r from-kabadi-primary via-kabadi-accent-strong to-kabadi-accent bg-clip-text text-transparent">
              into cash.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-kabadi-muted">
            Check what your scrap is worth before you sell. Paper, plastic,
            metals, e-waste and appliances — priced per kg or per piece, then
            collected from your doorstep with cash in hand.
          </p>

          {/* Search jump */}
          <form
            action="#rates"
            className="mx-auto mt-8 flex items-center gap-2 rounded-2xl border border-kabadi-border bg-kabadi-surface p-2 shadow-lg shadow-kabadi-primary/5"
            role="search"
          >
            <Search className="ml-3 size-5 shrink-0 text-kabadi-muted" />
            <Input
              type="search"
              name="q"
              aria-label="Search scrap items"
              placeholder="Try “copper wire”, “newspaper”, “old mobile”…"
              className="h-12 border-0 bg-transparent px-2 text-base shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="lg"
              className="shrink-0 px-5! font-semibold"
            >
              See rates
              <ArrowRight />
            </Button>
          </form>

          <p className="mt-3 font-label-sm text-label-sm text-kabadi-muted">
            Tip: the search box in “Today&apos;s Rates” below does instant lookups.
          </p>

          {/* Stats */}
          <dl className="mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-kabadi-border bg-kabadi-border">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-1 bg-kabadi-surface px-4 py-5 transition-colors hover:bg-kabadi-surface-2"
                >
                  <Icon className="size-5 text-kabadi-accent-strong" />
                  <dt className="order-2 font-label-sm text-label-sm text-kabadi-muted">
                    {stat.label}
                  </dt>
                  <dd className="order-1 font-display-lg text-2xl font-bold text-kabadi-primary">
                    {stat.value}
                  </dd>
                </div>
              );
            })}
          </dl>

          <p className="mt-6 font-label-sm text-label-sm text-kabadi-muted">
            {KABADI_CATEGORIES.length} categories ·{" "}
            {KABADI_CATEGORIES.map((c) => c.name).join(" · ")}
          </p>
        </div>
      </div>
    </section>
  );
}
