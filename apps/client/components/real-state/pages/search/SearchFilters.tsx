"use client";
import {
  Button,
  Combobox,
  Icon,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PROVINCES } from "../dashboard/listings/new/constants";

const DISTRICT_OPTIONS = [
  { value: "any", label: "All Districts" },
  ...PROVINCES.flatMap((p) =>
    p.districts.map((d) => ({ value: d.name, label: d.name })),
  ),
];

const PRICE_LABELS: Record<string, string> = {
  "under-20l": "Under 20L",
  "20l-50l": "20L – 50L",
  "50l-1cr": "50L – 1Cr",
  "1cr-plus": "1Cr+",
};

const TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  plot: "Plot / Land",
  house: "House",
};

interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

/**
 * Full filter bar for the `/search` results page. Reads the current URL
 * params as initial state and re-navigates to `/search` with the new params
 * on change — the server page re-fetches the filtered feed. Text inputs
 * debounce for 400ms before applying; selects apply immediately.
 */
export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "all");
  const [price, setPrice] = useState(searchParams.get("price") ?? "any");
  const [district, setDistrict] = useState(
    searchParams.get("district") ?? "any",
  );
  const [sizeMin, setSizeMin] = useState(searchParams.get("minSize") ?? "");
  const [sizeMax, setSizeMax] = useState(searchParams.get("maxSize") ?? "");

  // Track pending text values separately so we can debounce navigation
  const pendingQuery = useRef(query);
  const pendingSizeMin = useRef(sizeMin);
  const pendingSizeMax = useRef(sizeMax);

  const navigateWithParams = useCallback(
    (overrides: Record<string, string | null> = {}) => {
      const params = new URLSearchParams();
      const set = (key: string, value: string | null) => {
        if (value == null) return;
        const trimmed = value.trim();
        if (trimmed) params.set(key, trimmed);
      };
      set("q", overrides.q ?? pendingQuery.current);
      const t = overrides.type ?? type;
      if (t !== "all") set("type", t);
      const p = overrides.price ?? price;
      if (p !== "any") set("price", p);
      const d = overrides.district ?? district;
      if (d && d !== "any") set("district", d);
      set("minSize", overrides.minSize ?? pendingSizeMin.current);
      set("maxSize", overrides.maxSize ?? pendingSizeMax.current);
      router.push(
        params.toString() ? `/search?${params.toString()}` : "/search",
        { scroll: false },
      );
    },
    [router, type, price, district],
  );

  // Debounce text input changes (query, size)
  useEffect(() => {
    const timer = setTimeout(() => {
      navigateWithParams({
        q: query,
        minSize: sizeMin,
        maxSize: sizeMax,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [query, sizeMin, sizeMax, navigateWithParams]);

  // Sync refs when text values change
  useEffect(() => {
    pendingQuery.current = query;
    pendingSizeMin.current = sizeMin;
    pendingSizeMax.current = sizeMax;
  }, [query, sizeMin, sizeMax]);

  const handleTypeChange = (value: string) => {
    setType(value);
    navigateWithParams({ type: value });
  };

  const handlePriceChange = (value: string) => {
    setPrice(value);
    navigateWithParams({ price: value });
  };

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    navigateWithParams({ district: value });
  };

  const handleClear = () => {
    setQuery("");
    setType("all");
    setPrice("any");
    setDistrict("any");
    setSizeMin("");
    setSizeMax("");
    pendingQuery.current = "";
    pendingSizeMin.current = "";
    pendingSizeMax.current = "";
    router.push("/search", { scroll: false });
  };

  const removeFilter = (key: string) => {
    switch (key) {
      case "q":
        setQuery("");
        break;
      case "type":
        setType("all");
        break;
      case "price":
        setPrice("any");
        break;
      case "district":
        setDistrict("any");
        break;
      case "minSize":
        setSizeMin("");
        break;
      case "maxSize":
        setSizeMax("");
        break;
    }
    navigateWithParams({ [key]: "" });
  };

  // Build active filter chips from current committed URL state
  const activeFilters: ActiveFilter[] = [];
  const spQ = searchParams.get("q");
  if (spQ) activeFilters.push({ key: "q", label: "Search", value: spQ });
  const spType = searchParams.get("type");
  if (spType)
    activeFilters.push({
      key: "type",
      label: "Type",
      value: TYPE_LABELS[spType] ?? spType,
    });
  const spPrice = searchParams.get("price");
  if (spPrice)
    activeFilters.push({
      key: "price",
      label: "Price",
      value: PRICE_LABELS[spPrice] ?? spPrice,
    });
  const spDistrict = searchParams.get("district");
  if (spDistrict)
    activeFilters.push({
      key: "district",
      label: "District",
      value: spDistrict,
    });
  const spMinSize = searchParams.get("minSize");
  if (spMinSize)
    activeFilters.push({ key: "minSize", label: "Min size", value: spMinSize });
  const spMaxSize = searchParams.get("maxSize");
  if (spMaxSize)
    activeFilters.push({ key: "maxSize", label: "Max size", value: spMaxSize });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateWithParams({
      q: query,
      minSize: sizeMin,
      maxSize: sizeMax,
    });
  };

  return (
    <section className="sticky top-16 z-30 bg-surface/90 backdrop-blur-md sm:top-20 pt-4 pb-2">
      <div className="mx-auto max-w-container-max px-gutter">
        <form
          aria-label="Filter property search results"
          onSubmit={handleSubmit}
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
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  navigateWithParams({ q: "" });
                }}
                aria-label="Clear search"
                className="shrink-0 rounded p-0.5 text-on-surface-variant/60 hover:text-on-surface"
              >
                <Icon name="close" className="text-[14px]" />
              </button>
            )}
          </div>

          {/* Type */}
          <div className="min-w-[120px] border-l border-outline-variant/70 px-3">
            <Label htmlFor="filter-type" className="sr-only">
              Property Type
            </Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger
                id="filter-type"
                className={`h-9 w-full border-0 bg-transparent text-xs px-2 shadow-none focus-visible:ring-0 ${type !== "all" ? "font-medium text-primary" : ""}`}
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
            <Select value={price} onValueChange={handlePriceChange}>
              <SelectTrigger
                id="filter-price"
                className={`h-9 w-full border-0 bg-transparent px-2 text-xs shadow-none focus-visible:ring-0 ${price !== "any" ? "font-medium text-primary" : ""}`}
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
          <div className="min-w-[140px] border-l border-outline-variant/70 pl-3">
            <Label id="filter-district" className="sr-only">
              District / Ward
            </Label>
            <Combobox
              aria-labelledby="filter-district"
              value={district}
              onValueChange={handleDistrictChange}
              options={DISTRICT_OPTIONS}
              placeholder="District"
              searchPlaceholder="Search districts…"
              triggerClassName={`h-9 w-full border-0 bg-transparent px-2  text-xs shadow-none focus-visible:ring-0 ${district !== "any" ? "font-medium text-primary" : ""}`}
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
                className="h-9 w-14 border-0 bg-transparent px-2 text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60"
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
                className="h-9 w-14 border-0 bg-transparent px-2 text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60"
              />
            </div>
          </div>

          {/* Action */}
          <div className="ml-auto flex items-center gap-2">
            {activeFilters.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                className="h-9 shrink-0 rounded-md px-3 text-xs font-semibold text-on-surface-variant hover:text-on-surface"
              >
                <Icon name="close" className="text-[14px]" />
                Clear all
              </Button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
