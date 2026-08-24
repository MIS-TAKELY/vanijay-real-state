"use client";

import { Button, Icon, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Sheet, SheetContent, SheetTitle, SheetTrigger } from "@repo/ui";
import { DISTRICT_CATALOG } from "constants/district-catalog";
import { useMemo, useState } from "react";
import { DistrictCard } from "./DistrictCard";
import {
  DistrictFilterSidebar,
  INITIAL_FILTERS,
  type FilterState,
} from "./DistrictFilterSidebar";

const PAGE_SIZE = 12;

type SortKey = "default" | "name" | "rate-desc" | "rate-asc" | "trend";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "default", label: "Featured order" },
  { value: "name", label: "Name (A–Z)" },
  { value: "rate-desc", label: "Rate: High → Low" },
  { value: "rate-asc", label: "Rate: Low → High" },
  { value: "trend", label: "Fastest growing" },
];

function matches(d: (typeof DISTRICT_CATALOG)[number], f: FilterState) {
  const provinceOn = Object.values(f.provinces).some(Boolean);
  const topoOn = Object.values(f.topographies).some(Boolean);
  const tierOn = Object.values(f.tiers).some(Boolean);
  if (provinceOn && !f.provinces[d.province]) return false;
  if (topoOn && !f.topographies[d.topography]) return false;
  if (tierOn && !f.tiers[d.tier]) return false;
  return true;
}

/**
 * Full district ledger grid over all catalog entries with working filters,
 * sort and incremental loading. Replaces the previous hardcoded 4-district
 * demo grid.
 */
export function DistrictLedgers() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sort, setSort] = useState<SortKey>("default");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = DISTRICT_CATALOG.filter((d) => matches(d, filters));
    switch (sort) {
      case "name":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      case "rate-desc":
        return [...list].sort(
          (a, b) => (b.avgRatePerAana ?? -1) - (a.avgRatePerAana ?? -1),
        );
      case "rate-asc":
        return [...list].sort(
          (a, b) => (a.avgRatePerAana ?? Infinity) - (b.avgRatePerAana ?? Infinity),
        );
      case "trend":
        return [...list].sort((a, b) => (b.trendPct ?? -99) - (a.trendPct ?? -99));
      default:
        return list;
    }
  }, [filters, sort]);

  const shown = filtered.slice(0, visible);

  const changeFilters = (next: FilterState) => {
    setFilters(next);
    setVisible(PAGE_SIZE);
  };

  return (
    <section className="border-b border-outline-variant">
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        <div className="flex gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24">
              <DistrictFilterSidebar
                filters={filters}
                onChange={changeFilters}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-headline-md text-headline-md text-primary">
                  District Ledgers
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant" role="status" aria-live="polite">
                  Showing{" "}
                  <span className="font-semibold text-on-surface">
                    {shown.length ? `1–${shown.length}` : "0"}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-on-surface">
                    {filtered.length}
                  </span>{" "}
                  records
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={sort}
                  onValueChange={(v) => {
                    setSort(v as SortKey);
                    setVisible(PAGE_SIZE);
                  }}
                >
                  <SelectTrigger
                    aria-label="Sort districts"
                    className="h-9 w-[170px] text-[12px] font-semibold"
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon name="sort" className="text-[14px]" />
                      <SelectValue />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Mobile filter sheet */}
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[11px] font-semibold lg:hidden"
                    >
                      <Icon name="filter_list" className="text-[14px]" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 overflow-y-auto p-5">
                    <SheetTitle className="sr-only">District filters</SheetTitle>
                    <DistrictFilterSidebar
                      filters={filters}
                      onChange={changeFilters}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Grid */}
            {shown.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((d, i) => (
                  <DistrictCard key={d.slug} district={d} index={i} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-outline-variant py-16 text-center">
                <Icon
                  name="search_off"
                  className="mx-auto mb-3 block text-[32px] text-on-surface-variant"
                />
                <p className="text-sm font-medium text-on-surface">
                  No districts match these filters
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => changeFilters(INITIAL_FILTERS)}
                >
                  Clear all filters
                </Button>
              </div>
            )}

            {/* Load more */}
            {visible < filtered.length && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length))
                  }
                  className="cursor-pointer border-2 font-semibold tracking-[0.5px]"
                >
                  Load More Records
                  <Icon name="expand_more" className="text-body-lg" />
                </Button>
                <p className="text-[11px] text-on-surface-variant">
                  Showing {shown.length} of {filtered.length} indexed districts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
