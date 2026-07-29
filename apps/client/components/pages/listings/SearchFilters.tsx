"use client"
import { Icon } from "@repo/ui";

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
            <Icon name="search" className="text-on-surface-variant text-[20px]" />
            <input
              type="text"
              aria-label="Search by location, property ID, or keyword"
              placeholder="Search by location, property ID, or keyword..."
              className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-end gap-sm">
            <div className="min-w-[140px] flex-1">
              <label
                htmlFor="filter-type"
                className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.5px] text-on-surface"
              >
                Property Type
              </label>
              <select
                id="filter-type"
                className="h-10 w-full cursor-pointer rounded-md border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                <option>All Types</option>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Apartment</option>
                <option>Plot</option>
              </select>
            </div>

            <div className="min-w-[140px] flex-1">
              <label
                htmlFor="filter-price"
                className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.5px] text-on-surface"
              >
                Price Range (NPR)
              </label>
              <select
                id="filter-price"
                className="h-10 w-full cursor-pointer rounded-md border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                <option>Any Price</option>
                <option>Under 20L</option>
                <option>20L – 50L</option>
                <option>50L – 1Cr</option>
                <option>1Cr+</option>
              </select>
            </div>

            <div className="min-w-[160px] flex-1">
              <label
                htmlFor="filter-district"
                className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.5px] text-on-surface"
              >
                District / Ward
              </label>
              <input
                id="filter-district"
                type="text"
                placeholder="e.g. Kathmandu 03"
                className="h-10 w-full rounded-md border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/30"
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
                <input
                  type="text"
                  aria-labelledby="filter-size-label"
                  aria-label="Minimum land size"
                  placeholder="Min"
                  className="h-10 w-full rounded-md border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="text"
                  aria-labelledby="filter-size-label"
                  aria-label="Maximum land size"
                  placeholder="Max"
                  className="h-10 w-full rounded-md border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-xs rounded-md bg-primary px-5 text-[13px] font-semibold tracking-[0.4px] text-on-primary transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Icon name="filter_alt" className="text-[16px]" />
              Apply Filters
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}