"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, Search, X } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
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
import { formatNepaliNumber } from "./helpers";
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

  const allItems: ScrapeItemSummary[] =
    items && items.length > 0
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

  const updateQuery = (value: string) => {
    setQuery(value);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set("q", value.trim());
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  return (
    <section
      id="rates"
      className="scroll-mt-24 border-b border-border py-16 md:py-24"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div className="max-w-2xl">
          <p className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Today&apos;s Rates
          </p>
          <EditableField
            tag="h2"
            value="What can I sell, and for how much?"
            onChange={(v) => onFieldChange?.("rateCatalog", "heading", v)}
            editable={editable}
            className="mt-2 font-display-lg text-3xl tracking-tight text-foreground sm:text-4xl"
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

        {/* One control strip: category filters + search */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(value: string) => {
              if (value) setFilter(value as Filter);
            }}
            variant="outline"
            spacing={2}
            className="flex flex-nowrap overflow-x-auto sm:flex-wrap sm:justify-start"
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

          <div className="relative w-full shrink-0 sm:max-w-xs lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateQuery(e.target.value)
              }
              aria-label="Search scrap items"
              placeholder="Search an item or Nepali name…"
              className="h-11 rounded-xl border-border bg-card pl-9 pr-9"
            />
            {query ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => updateQuery("")}
              >
                <X className="size-3.5" />
              </Button>
            ) : null}
          </div>
        </div>

        {/* Mobile: card layout */}
        <div className="mt-6 grid gap-3 md:hidden">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[15px] font-medium text-foreground">
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
                    </span>
                    {item.popular ? (
                      <Badge className="shrink-0 bg-gold/15 font-label-sm text-label-sm text-gold-deep">
                        <Flame className="size-3" aria-hidden />
                        popular
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 font-label-sm text-label-sm text-muted-foreground">
                    {item.nepali ? (
                      <span className="mr-2 text-primary">{item.nepali}</span>
                    ) : null}
                    {item.note ?? getCategoryName(item.category)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-data-table text-lg font-semibold tabular-nums text-primary">
                    Rs {formatNepaliNumber(item.rate)}
                  </p>
                  <p className="mt-0.5 font-label-sm text-label-sm text-muted-foreground">
                    {item.unit === "kg" ? "per kg" : "per piece"}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-base text-muted-foreground">
                No items match &ldquo;{query || "your filters"}&rdquo;.
              </p>
              {query ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => updateQuery("")}
                >
                  Clear search
                </Button>
              ) : null}
            </div>
          )}
        </div>

        {/* Desktop: table layout */}
        <div className="mt-6 hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/60 hover:bg-muted/60">
                <TableHead className="h-11 pl-5 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Item
                </TableHead>
                <TableHead className="h-11 pr-5 text-right font-label-sm text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  You receive
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-border hover:bg-accent/40"
                >
                  <TableCell className="py-4 pl-5 align-middle">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[15px] font-medium text-foreground">
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
                      </span>
                      {item.popular ? (
                        <Badge className="shrink-0 bg-gold/15 font-label-sm text-label-sm text-gold-deep">
                          <Flame className="size-3" aria-hidden />
                          popular
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate font-label-sm text-label-sm text-muted-foreground">
                      {item.nepali ? (
                        <span className="mr-2 text-primary">{item.nepali}</span>
                      ) : null}
                      {item.note ?? getCategoryName(item.category)}
                    </p>
                  </TableCell>
                  <TableCell className="py-4 pr-5 text-right align-middle">
                    <p className="font-data-table text-lg font-semibold tabular-nums text-primary">
                      Rs {formatNepaliNumber(item.rate)}
                    </p>
                    <p className="mt-0.5 font-label-sm text-label-sm text-muted-foreground">
                      {item.unit === "kg" ? "per kg" : "per piece"}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredItems.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-base text-muted-foreground">
                No items match &ldquo;{query || "your filters"}&rdquo;. Try
                &ldquo;copper&rdquo;, &ldquo;pet&rdquo;, &ldquo;fridge&rdquo; or
                a Nepali name.
              </p>
              {query ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => updateQuery("")}
                >
                  Clear search
                </Button>
              ) : null}
            </div>
          )}
        </div>

        <p className="mt-4 font-label-sm text-label-sm text-muted-foreground">
          {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"} ·
          rates indicative as of {ratesLastUpdated} · final price depends on
          condition, quantity &amp; market — confirmed at weigh-in.
        </p>
      </div>
    </section>
  );
}
