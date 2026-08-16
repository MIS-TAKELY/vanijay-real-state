"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, Search } from "lucide-react";
import {
  Badge,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ToggleGroup,
  ToggleGroupItem,
} from "@repo/ui";
import {
  categoryById,
  formatRate,
  KABADI_CATEGORIES,
  KABADI_ITEMS,
  RATES_LAST_UPDATED,
  type KabadiCategoryId,
} from "lib/kabadi/rates";

type Filter = KabadiCategoryId | "all";

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function RateCatalog() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // Pick up a query submitted from the hero search (?q=...) on load.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  const items = useMemo(() => {
    const q = normalize(query);
    return KABADI_ITEMS.filter((item) => {
      const inCategory = filter === "all" || item.category === filter;
      if (!inCategory) return false;
      if (!q) return true;
      const haystack = normalize(
        `${item.name} ${item.nepali ?? ""} ${categoryById(item.category).name}`,
      );
      return haystack.includes(q);
    });
  }, [query, filter]);

  return (
    <section
      id="rates"
      className="scroll-mt-24 border-b border-kabadi-border py-16 md:py-24"
    >
      <div className="mx-auto px-gutter">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.2em] text-kabadi-primary">
              Today&apos;s Rates
            </p>
            <h2 className="mt-2 font-display-lg text-4xl tracking-tight text-kabadi-on-bg">
              What can I sell, and for how much?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-kabadi-muted">
              Indicative buy rates across the Kathmandu Valley. Filter by
              category or search any item — Nepali names work too (तामा,
              पत्रिका, मोबाइल…).
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-kabadi-muted" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search scrap items"
              placeholder="Search an item or Nepali name…"
              className="h-11 pl-9"
            />
          </div>
        </div>

        {/* Category pills */}
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(value) => {
            if (value) setFilter(value as Filter);
          }}
          variant="outline"
          spacing={2}
          className="mt-6 flex-wrap"
          aria-label="Filter by category"
        >
          <ToggleGroupItem
            value="all"
            className="rounded-full px-4 font-medium"
          >
            All items
          </ToggleGroupItem>
          {KABADI_CATEGORIES.map((cat) => (
            <ToggleGroupItem
              key={cat.id}
              value={cat.id}
              className="rounded-full px-4 font-medium"
            >
              {cat.name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* Item list */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-kabadi-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-kabadi-border bg-kabadi-surface-2">
                <TableHead className="pl-5 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-kabadi-muted">
                  Item
                </TableHead>
                <TableHead className="pr-5 text-right font-label-sm text-label-sm font-semibold uppercase tracking-wider text-kabadi-muted">
                  You receive
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-kabadi-border hover:bg-kabadi-primary-soft/50"
                >
                  <TableCell className="py-3.5 pl-5">
                    <p className="flex items-center gap-2 text-[15px] font-medium text-kabadi-on-bg">
                      {item.name}
                      {item.popular && (
                        <Badge className="bg-kabadi-accent/15 text-kabadi-accent-strong">
                          <Flame />
                          popular
                        </Badge>
                      )}
                    </p>
                    <p className="mt-0.5 truncate font-label-sm text-label-sm text-kabadi-muted">
                      {item.nepali && (
                        <span className="mr-2 text-kabadi-primary">
                          {item.nepali}
                        </span>
                      )}
                      {item.note ?? categoryById(item.category).name}
                    </p>
                  </TableCell>
                  <TableCell className="py-3.5 pr-5 text-right">
                    <p className="whitespace-nowrap font-data-table text-lg font-semibold text-kabadi-primary">
                      {formatRate(item)}
                    </p>
                    <p className="font-label-sm text-label-sm text-kabadi-muted">
                      {item.unit === "kg" ? "per kilogram" : "per piece"}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {items.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-base text-kabadi-muted">
                No items match “{query}”. Try “copper”, “pet”, “fridge” or a
                Nepali name.
              </p>
            </div>
          )}
        </div>

        <p className="mt-4 font-label-sm text-label-sm text-kabadi-muted">
          {items.length} item{items.length === 1 ? "" : "s"} · rates indicative
          as of {RATES_LAST_UPDATED} · final price depends on condition,
          quantity &amp; market — confirmed at weigh-in.
        </p>
      </div>
    </section>
  );
}
