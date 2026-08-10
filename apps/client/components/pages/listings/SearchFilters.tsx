"use client";
import { Button, Icon, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui";

export function SearchFilters() {
  return (
    <section className="relative z-10">
      <div className="mx-auto max-w-container-max px-gutter py-4 md:py-5">
        <form
          aria-label="Filter verified property listings"
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-wrap items-center gap-2"
        >
          {/* Search */}
          <div className="flex min-w-[160px] flex-1 items-center gap-2">
            <Icon name="search" className="text-on-surface-variant text-[18px]" />
            <Input
              type="text"
              aria-label="Search by location, property ID, or keyword"
              placeholder="Search..."
              className="border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant"
            />
          </div>

          {/* Type */}
          <div className="min-w-[120px]">
            <Label htmlFor="filter-type" className="sr-only">Property Type</Label>
            <Select>
              <SelectTrigger id="filter-type" className="h-9 w-full border-0 bg-transparent text-xs shadow-none focus-visible:ring-0">
                <SelectValue placeholder="Type" />
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

          {/* Price */}
          <div className="min-w-[120px]">
            <Label htmlFor="filter-price" className="sr-only">Price Range</Label>
            <Select>
              <SelectTrigger id="filter-price" className="h-9 w-full border-0 bg-transparent text-xs shadow-none focus-visible:ring-0">
                <SelectValue placeholder="Price" />
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

          {/* District */}
          <div className="min-w-[130px]">
            <Label htmlFor="filter-district" className="sr-only">District / Ward</Label>
            <Input
              id="filter-district"
              type="text"
              placeholder="District"
              className="h-9 border-0 bg-transparent text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant"
            />
          </div>

          {/* Size */}
          <div className="flex items-center gap-1">
            <div>
              <Label htmlFor="size-min" className="sr-only">Min size</Label>
              <Input
                id="size-min"
                type="text"
                placeholder="Min"
                className="h-9 w-14 border-0 bg-transparent text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant"
              />
            </div>
            <span className="text-xs text-on-surface-variant">-</span>
            <div>
              <Label htmlFor="size-max" className="sr-only">Max size</Label>
              <Input
                id="size-max"
                type="text"
                placeholder="Max"
                className="h-9 w-14 border-0 bg-transparent text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant"
              />
            </div>
          </div>

          {/* Action */}
          <Button
            type="submit"
            className="h-9 shrink-0 rounded-md bg-primary px-3 text-xs font-semibold text-on-primary hover:bg-primary/90"
          >
            <Icon name="filter_alt" className="text-[14px]" />
            Apply
          </Button>
        </form>
      </div>
    </section>
  );
}
