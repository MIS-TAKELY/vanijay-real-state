"use client";
import { useRouter, useSearchParams } from "next/navigation";
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

/**
 * Full filter bar for the `/search` results page. Reads the current URL
 * params as initial state and re-navigates to `/search` with the new params
 * on Apply — the server page re-fetches the filtered feed.
 */
export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "all");
  const [price, setPrice] = useState(searchParams.get("price") ?? "any");
  const [district, setDistrict] = useState(searchParams.get("district") ?? "");
  const [sizeMin, setSizeMin] = useState(searchParams.get("minSize") ?? "");
  const [sizeMax, setSizeMax] = useState(searchParams.get("maxSize") ?? "");

  const hasActiveFilters = [
    searchParams.get("q"),
    searchParams.get("type"),
    searchParams.get("price"),
    searchParams.get("district"),
    searchParams.get("minSize"),
    searchParams.get("maxSize"),
  ].some((v) => v != null && v !== "");

  const buildParams = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    const set = (key: string, value: string) => {
      if (value.trim()) params.set(key, value.trim());
    };
    set("q", overrides.q ?? query);
    set("type", overrides.type ?? (type === "all" ? "" : type));
    set("price", overrides.price ?? (price === "any" ? "" : price));
    set("district", overrides.district ?? district);
    set("minSize", overrides.minSize ?? sizeMin);
    set("maxSize", overrides.maxSize ?? sizeMax);
    return params;
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = buildParams();
    router.push(
      params.toString() ? `/search?${params.toString()}` : "/search",
      {
        scroll: false,
      },
    );
  };

  const handleClear = () => {
    setQuery("");
    setType("all");
    setPrice("any");
    setDistrict("");
    setSizeMin("");
    setSizeMax("");
    router.push("/search", { scroll: false });
  };

  return (
    <section className="sticky top-16 z-30 bg-surface/90 backdrop-blur-md sm:top-20 pt-4 pb-2">
      <div className="mx-auto max-w-container-max px-gutter">
        <form
          aria-label="Filter property search results"
          onSubmit={handleApply}
          className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-outline-variant bg-surface px-3 py-2 shadow-sm transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary/20"
        >
          {/* Search */}
          <div className="flex min-w-[180px] flex-1 items-center gap-2">
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
              placeholder="District, area or keyword"
              className="border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60"
            />
          </div>

          {/* Type */}
          <div className="min-w-[120px] border-l border-outline-variant/70 pl-3">
            <Label htmlFor="filter-type" className="sr-only">
              Property Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger
                id="filter-type"
                className="h-9 w-full border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
              >
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="plot">Plot / Land</SelectItem>
                <SelectItem value="house">House</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="min-w-[120px] border-l border-outline-variant/70 pl-3">
            <Label htmlFor="filter-price" className="sr-only">
              Price Range
            </Label>
            <Select value={price} onValueChange={setPrice}>
              <SelectTrigger
                id="filter-price"
                className="h-9 w-full border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
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
          <div className="min-w-[130px] border-l border-outline-variant/70 pl-3">
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
              className="h-9 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60"
            />
          </div>

          {/* Size */}
          <div className="flex items-center gap-1 border-l border-outline-variant/70 pl-3">
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
                className="h-9 w-14 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60"
              />
            </div>
            <span className="text-xs text-on-surface-variant">–</span>
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
                className="h-9 w-14 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60"
              />
            </div>
          </div>

          {/* Action */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="submit"
              className="h-9 shrink-0 rounded-md bg-primary px-3 text-xs font-semibold text-on-primary hover:bg-primary/90"
            >
              <Icon name="filter_alt" className="text-[14px]" />
              Apply
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                className="h-9 shrink-0 rounded-md px-3 text-xs font-semibold text-on-surface-variant hover:text-on-surface"
              >
                <Icon name="close" className="text-[14px]" />
                Clear
              </Button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
