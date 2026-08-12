"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Icon,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";

export function SearchFilters() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [price, setPrice] = useState("any");
  const [district, setDistrict] = useState("");
  const [sizeMin, setSizeMin] = useState("");
  const [sizeMax, setSizeMax] = useState("");

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (type && type !== "all") params.set("type", type);
    if (price && price !== "any") params.set("price", price);
    if (district.trim()) params.set("district", district.trim());
    if (sizeMin.trim()) params.set("minSize", sizeMin.trim());
    if (sizeMax.trim()) params.set("maxSize", sizeMax.trim());
    router.push(params.toString() ? `/?${params.toString()}` : "/");
  };

  return (
    <section className="relative z-10 pt-6 pb-4 md:pt-8 md:pb-4">
      <div className="mx-auto max-w-container-max px-gutter">
        <form
          aria-label="Filter verified property listings"
          onSubmit={handleApply}
          className="flex flex-wrap items-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 py-2 shadow-sm transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary/20"
        >
          {/* Search */}
          <div className="flex min-w-[160px] flex-1 items-center gap-2">
            <Icon
              name="search"
              className="text-on-surface-variant text-[18px]"
            />
            <Input
              type="text"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search by location, property ID, or keyword"
              placeholder="Search..."
              className="border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60"
            />
          </div>

          {/* Type */}
          <div className="min-w-[120px]">
            <Label htmlFor="filter-type" className="sr-only">
              Property Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger
                id="filter-type"
                className="h-9 w-full border-0 bg-transparent text-xs shadow-none focus-visible:ring-0"
              >
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
            <Label htmlFor="filter-price" className="sr-only">
              Price Range
            </Label>
            <Select value={price} onValueChange={setPrice}>
              <SelectTrigger
                id="filter-price"
                className="h-9 w-full border-0 bg-transparent text-xs shadow-none focus-visible:ring-0"
              >
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
            <Label htmlFor="filter-district" className="sr-only">
              District / Ward
            </Label>
            <Input
              id="filter-district"
              name="district"
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="District"
              className="h-9 border-0 bg-transparent text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60"
            />
          </div>

          {/* Size */}
          <div className="flex items-center gap-1">
            <div>
              <Label htmlFor="size-min" className="sr-only">
                Min size
              </Label>
              <Input
                id="size-min"
                name="minSize"
                type="text"
                value={sizeMin}
                onChange={(e) => setSizeMin(e.target.value)}
                placeholder="Min"
                className="h-9 w-14 border-0 bg-transparent text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60"
              />
            </div>
            <span className="text-xs text-on-surface-variant">-</span>
            <div>
              <Label htmlFor="size-max" className="sr-only">
                Max size
              </Label>
              <Input
                id="size-max"
                name="maxSize"
                type="text"
                value={sizeMax}
                onChange={(e) => setSizeMax(e.target.value)}
                placeholder="Max"
                className="h-9 w-14 border-0 bg-transparent text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60"
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
