"use client";
import { Button, Icon, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui";

export function SearchFilters() {
  return (
    <section className="border-b border-outline-variant bg-surface-container-low">
      <div className="mx-auto max-w-container-max px-gutter py-md">
        <form
          aria-label="Filter verified property listings"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Search bar */}
          <div className="mb-md flex items-center gap-sm rounded-2xl border border-outline-variant bg-surface px-md py-sm focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-[box-shadow,border-color] duration-200">
            <Icon
              name="search"
              className="text-on-surface-variant text-[20px]"
            />
            <Input
              type="text"
              aria-label="Search by location, property ID, or keyword"
              placeholder="Search by location, property ID, or keyword..."
              className="border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-end gap-sm">
            <div className="min-w-[140px] flex-1">
              <Label
                htmlFor="filter-type"
                className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.5px] text-on-surface"
              >
                Property Type
              </Label>
              <Select>
                <SelectTrigger id="filter-type" className="h-10 w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[140px] flex-1">
              <Label
                htmlFor="filter-price"
                className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.5px] text-on-surface"
              >
                Price Range (NPR)
              </Label>
              <Select>
                <SelectTrigger id="filter-price" className="h-10 w-full">
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Price</SelectItem>
                  <SelectItem value="under-20l">Under 20L</SelectItem>
                  <SelectItem value="20l-50l">20L – 50L</SelectItem>
                  <SelectItem value="50l-1cr">50L – 1Cr</SelectItem>
                  <SelectItem value="1cr-plus">1Cr+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[160px] flex-1">
              <Label
                htmlFor="filter-district"
                className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.5px] text-on-surface"
              >
                District / Ward
              </Label>
              <Input
                id="filter-district"
                type="text"
                placeholder="e.g. Kathmandu 03"
                className="h-10"
              />
            </div>

            <div className="min-w-[160px] flex-1">
              <span
                id="filter-size-label"
                className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.5px] text-on-surface"
              >
                Land Size (RAPD)
              </span>
              <div className="flex gap-xs">
                <Input
                  type="text"
                  aria-labelledby="filter-size-label"
                  aria-label="Minimum land size"
                  placeholder="Min"
                  className="h-10"
                />
                <Input
                  type="text"
                  aria-labelledby="filter-size-label"
                  aria-label="Maximum land size"
                  placeholder="Max"
                  className="h-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-xs rounded-md bg-primary px-5 text-label-sm font-semibold tracking-[0.4px] text-on-primary hover:bg-primary/90 cursor-pointer"
            >
              <Icon name="filter_alt" className="text-data-table" />
              Apply Filters
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
