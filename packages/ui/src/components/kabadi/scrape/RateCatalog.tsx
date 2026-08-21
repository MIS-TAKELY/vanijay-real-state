"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, Search } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";
import type {
  ScrapeCategorySummary,
  ScrapeItemSummary,
  OnSectionFieldChange,
} from "./types";
import { formatRate } from "./helpers";
import { EditableField } from "./EditableField";

interface RateCatalogProps {
  categories: ScrapeCategorySummary[];
  items?: ScrapeItemSummary[];
  editable?: boolean;
  onFieldChange?: OnSectionFieldChange;
  ratesLastUpdated?: string;
}

type Filter = string | "all";

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function RateCatalog({
  categories,
  items,
  editable = false,
  onFieldChange,
  ratesLastUpdated = "today",
}: RateCatalogProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const allItems: ScrapeItemSummary[] = items && items.length > 0
    ? items
    : categories.flatMap((c) => c.items ?? []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  const filteredItems = useMemo(() => {
    const q = normalize(query);
    return allItems.filter((item) => {
      const inCategory = filter === "all" || item.category === filter;
      if (!inCategory) return false;
      if (!q) return true;
      const catMeta = categories.find((c) => c.slug === item.category);
      const haystack = normalize(
        `${item.name} ${item.nepali ?? ""} ${catMeta?.name ?? ""}`,
      );
      return haystack.includes(q);
    });
  }, [query, filter, allItems, categories]);

  const getCategoryName = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug);
    return cat?.name ?? "";
  };

  return (
    <section
      id="rates"
      className="scroll-mt-24 border-b border-border py-16 md:py-24"
    >
      <div className="mx-auto px-gutter">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Today&apos;s Rates
            </p>
            <EditableField
              tag="h2"
              value="What can I sell, and for how much?"
              onChange={(v) => onFieldChange?.("rateCatalog", "heading", v)}
              editable={editable}
              className="mt-2 font-display-lg text-4xl tracking-tight text-foreground"
            />
            <EditableField
              tag="p"
              value="Indicative buy rates across the Kathmandu Valley. Filter by category or search any item — Nepali names work too."
              onChange={(v) => onFieldChange?.("rateCatalog", "description", v)}
              editable={editable}
              multiline
              className="mt-3 text-base leading-relaxed text-muted-foreground"
            />
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              aria-label="Search scrap items"
              placeholder="Search an item or Nepali name…"
              className="h-11 pl-9"
            />
          </div>
        </div>

        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(value: string) => {
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
          {categories.map((cat) => (
            <ToggleGroupItem
              key={cat.id}
              value={cat.slug}
              className="rounded-full px-4 font-medium"
            >
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
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted">
                <TableHead className="pl-5 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Item
                </TableHead>
                <TableHead className="pr-5 text-right font-label-sm text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  You receive
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-border hover:bg-accent/50"
                >
                  <TableCell className="py-3.5 pl-5">
                    <p className="flex items-center gap-2 text-[15px] font-medium text-foreground">
                      {editable ? (
                        <EditableField
                          value={item.name}
                          onChange={(v) =>
                            onFieldChange?.(`item:${item.id}`, "name", v)
                          }
                          editable
                        />
                      ) : (
                        item.name
                      )}
                      {item.popular && (
                        <Badge className="bg-gold/15 text-gold-deep">
                          <Flame />
                          popular
                        </Badge>
                      )}
                    </p>
                    <p className="mt-0.5 truncate font-label-sm text-label-sm text-muted-foreground">
                      {item.nepali && (
                        <span className="mr-2 text-primary">
                          {item.nepali}
                        </span>
                      )}
                      {item.note ?? getCategoryName(item.category)}
                    </p>
                  </TableCell>
                  <TableCell className="py-3.5 pr-5 text-right">
                    <p className="whitespace-nowrap font-data-table text-lg font-semibold text-primary">
                      {formatRate({ rate: item.rate, unit: item.unit })}
                    </p>
                    <p className="font-label-sm text-label-sm text-muted-foreground">
                      {item.unit === "kg" ? "per kilogram" : "per piece"}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredItems.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-base text-muted-foreground">
                No items match &ldquo;{query}&rdquo;. Try &ldquo;copper&rdquo;, &ldquo;pet&rdquo;, &ldquo;fridge&rdquo; or a Nepali name.
              </p>
            </div>
          )}
        </div>

        <p className="mt-4 font-label-sm text-label-sm text-muted-foreground">
          {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"} · rates indicative
          as of {ratesLastUpdated} · final price depends on condition,
          quantity &amp; market — confirmed at weigh-in.
        </p>
      </div>
    </section>
  );
}
