"use client";
import {
  Button,
  Combobox,
  FACING_DIRECTIONS,
  Icon,
  Input,
  Label,
  PROVINCES,
  ROAD_TYPES,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Switch,
} from "@repo/ui";
import { HIERARCHICAL_CATEGORIES } from "constants/varibles-constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SaveSearchButton } from "./SaveSearchButton";

/* ── Option arrays ────────────────────────────────────────────────── */

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  ...HIERARCHICAL_CATEGORIES.map((c) => ({
    value: c.mainCategory,
    label: c.label,
  })),
];

const PRICE_OPTIONS = [
  { value: "any", label: "Any Price" },
  { value: "under-20l", label: "Under 20L" },
  { value: "20l-50l", label: "20L – 50L" },
  { value: "50l-1cr", label: "50L – 1Cr" },
  { value: "1cr-plus", label: "1Cr+" },
];

const DISTRICT_OPTIONS = [
  { value: "any", label: "All Districts" },
  ...PROVINCES.flatMap((p) =>
    p.districts.map((d) => ({ value: d.name, label: d.name })),
  ),
];

const FACING_OPTIONS = [
  { value: "any", label: "Any Direction" },
  ...FACING_DIRECTIONS.map((d) => ({ value: d.value, label: d.label })),
];

const ROAD_OPTIONS = [
  { value: "any", label: "Any Road" },
  ...ROAD_TYPES.map((r) => ({ value: r.value, label: r.label })),
];

const FURNISHING_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "SEMI_FURNISHED", label: "Semi-furnished" },
  { value: "FULLY_FURNISHED", label: "Fully furnished" },
];

const CONSTRUCTION_STATUS_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "UNDER_CONSTRUCTION", label: "Under Construction" },
  { value: "READY_TO_MOVE", label: "Ready to Move" },
  { value: "RESALE", label: "Resale" },
  { value: "NEWLY_BUILT", label: "Newly Built" },
];

const COMMON_AMENITIES = [
  "Parking",
  "Garden",
  "Security",
  "Swimming Pool",
  "Gym",
  "Elevator",
  "CCTV",
  "Power Backup",
  "Water Supply",
  "Balcony",
  "Modular Kitchen",
  "Air Conditioning",
];

/* ── Short URL param keys ─────────────────────────────────────────── */

const FACING_MAP: Record<string, string> = {
  facing: "face",
  roadType: "road",
  bedrooms: "bed",
  bathrooms: "bath",
  furnishing: "ft",
  constructionStatus: "cs",
  isCornerPlot: "cp",
  isNegotiable: "ng",
  municipality: "mun",
  ward: "ward",
  subCategory: "sub",
  amenities: "am",
};

/* ── Label helpers ─────────────────────────────────────────────────── */

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  TYPE_OPTIONS.map((o) => [o.value, o.label]),
);
const FACING_LABELS: Record<string, string> = Object.fromEntries(
  FACING_DIRECTIONS.map((d) => [d.value, d.label]),
);
const ROAD_LABELS: Record<string, string> = Object.fromEntries(
  ROAD_TYPES.map((r) => [r.value, r.label]),
);
const FURNISHING_LABELS: Record<string, string> = {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi-furnished",
  FULLY_FURNISHED: "Fully furnished",
};
const CS_LABELS: Record<string, string> = {
  UNDER_CONSTRUCTION: "Under Construction",
  READY_TO_MOVE: "Ready to Move",
  RESALE: "Resale",
  NEWLY_BUILT: "Newly Built",
};

/* ── Types ─────────────────────────────────────────────────────────── */

interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

/* ── Component ─────────────────────────────────────────────────────── */

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* --- Quick-bar state (always visible) --- */
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "all");
  const [price, setPrice] = useState(searchParams.get("pr") ?? "any");
  const [district, setDistrict] = useState(searchParams.get("dist") ?? "any");
  const [sizeMin, setSizeMin] = useState(searchParams.get("minS") ?? "");
  const [sizeMax, setSizeMax] = useState(searchParams.get("maxS") ?? "");

  /* --- Advanced panel state (collapsed by default on desktop) --- */
  const [panelOpen, setPanelOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Advanced filters — read from short URL keys */
  const [municipality, setMunicipality] = useState(
    searchParams.get("mun") ?? "",
  );
  const [ward, setWard] = useState(searchParams.get("ward") ?? "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bed") ?? "");
  const [bathrooms, setBathrooms] = useState(searchParams.get("bath") ?? "");
  const [facing, setFacing] = useState(searchParams.get("face") ?? "any");
  const [roadType, setRoadType] = useState(searchParams.get("road") ?? "any");
  const [isCornerPlot, setIsCornerPlot] = useState(
    searchParams.get("cp") === "true",
  );
  const [isNegotiable, setIsNegotiable] = useState(
    searchParams.get("ng") === "true",
  );
  const [constructionStatus, setConstructionStatus] = useState(
    searchParams.get("cs") ?? "any",
  );
  const [furnishing, setFurnishing] = useState(searchParams.get("ft") ?? "any");
  const [subCategory, setSubCategory] = useState(
    searchParams.get("sub") ?? "all",
  );
  const [amenities, setAmenities] = useState<string[]>(() => {
    const am = searchParams.get("am");
    return am ? am.split(",") : [];
  });

  /* Debounce refs */
  const pendingQuery = useRef(query);
  const pendingSizeMin = useRef(sizeMin);
  const pendingSizeMax = useRef(sizeMax);
  const pendingMunicipality = useRef(municipality);
  const pendingWard = useRef(ward);
  const pendingBedrooms = useRef(bedrooms);
  const pendingBathrooms = useRef(bathrooms);

  /* SubCategory options derived from selected main type */
  const subCategoryOptions = useMemo(() => {
    if (type === "all") return [];
    const cat = HIERARCHICAL_CATEGORIES.find((c) => c.mainCategory === type);
    if (!cat) return [];
    return [
      { value: "all", label: "All Sub-types" },
      ...cat.subCategories.map((s) => ({ value: s.key, label: s.label })),
    ];
  }, [type]);

  /* ── Navigation helper ──────────────────────────────────────────── */

  const navigateWithParams = useCallback(
    (overrides: Record<string, string | null> = {}) => {
      const params = new URLSearchParams();

      const setP = (key: string, value: string | null) => {
        const v = overrides[key] ?? value ?? null;
        if (v == null) return;
        const trimmed = v.trim();
        if (trimmed) params.set(key, trimmed);
      };

      /* Quick-bar params */
      setP("q", pendingQuery.current);
      const t = overrides.type ?? type;
      if (t !== "all") params.set("type", t);
      const p = overrides.pr ?? price;
      if (p !== "any") params.set("pr", p);
      const d = overrides.dist ?? district;
      if (d !== "any") params.set("dist", d);
      setP("minS", pendingSizeMin.current);
      setP("maxS", pendingSizeMax.current);

      /* Advanced params — use short keys */
      setP("mun", pendingMunicipality.current);
      setP("ward", pendingWard.current);
      setP("bed", pendingBedrooms.current);
      setP("bath", pendingBathrooms.current);

      const setShort = (
        longKey: string,
        value: string,
        skipDefaults: string[] = [],
      ) => {
        const short = FACING_MAP[longKey];
        if (!short) return;
        const v = overrides[longKey] ?? value;
        if (skipDefaults.includes(v)) return;
        params.set(short, v);
      };

      setShort("facing", facing, ["any"]);
      setShort("roadType", roadType, ["any"]);
      setShort("constructionStatus", constructionStatus, ["any"]);
      setShort("furnishing", furnishing, ["any"]);
      setShort("subCategory", subCategory, ["all"]);

      if (overrides.isCornerPlot !== undefined) {
        if (overrides.isCornerPlot === "true") params.set("cp", "true");
      } else if (isCornerPlot) {
        params.set("cp", "true");
      }

      if (overrides.isNegotiable !== undefined) {
        if (overrides.isNegotiable === "true") params.set("ng", "true");
      } else if (isNegotiable) {
        params.set("ng", "true");
      }

      const amOverride = overrides.am;
      const amVal =
        amOverride !== undefined
          ? amOverride
            ? amOverride
            : null
          : amenities.length > 0
            ? amenities.join(",")
            : null;
      if (amVal) params.set("am", amVal);

      router.push(
        params.toString() ? `/search?${params.toString()}` : "/search",
        { scroll: false },
      );
    },
    [
      router,
      type,
      price,
      district,
      facing,
      roadType,
      constructionStatus,
      furnishing,
      subCategory,
      isCornerPlot,
      isNegotiable,
      amenities,
    ],
  );

  /* Debounce text-like inputs */
  useEffect(() => {
    const timer = setTimeout(() => {
      navigateWithParams({
        q: query,
        minS: sizeMin,
        maxS: sizeMax,
        mun: municipality,
        ward,
        bed: bedrooms,
        bath: bathrooms,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [
    query,
    sizeMin,
    sizeMax,
    municipality,
    ward,
    bedrooms,
    bathrooms,
    navigateWithParams,
  ]);

  useEffect(() => {
    pendingQuery.current = query;
    pendingSizeMin.current = sizeMin;
    pendingSizeMax.current = sizeMax;
    pendingMunicipality.current = municipality;
    pendingWard.current = ward;
    pendingBedrooms.current = bedrooms;
    pendingBathrooms.current = bathrooms;
  }, [query, sizeMin, sizeMax, municipality, ward, bedrooms, bathrooms]);

  /* ── Handlers ─────────────────────────────────────────────────── */

  const handleTypeChange = (value: string) => {
    setType(value);
    setSubCategory("all"); // reset sub when main changes
    navigateWithParams({ type: value, subCategory: "all" });
  };

  const handleSelectChange = (longKey: string, value: string) => {
    switch (longKey) {
      case "facing":
        setFacing(value);
        break;
      case "roadType":
        setRoadType(value);
        break;
      case "furnishing":
        setFurnishing(value);
        break;
      case "constructionStatus":
        setConstructionStatus(value);
        break;
      case "subCategory":
        setSubCategory(value);
        break;
    }
    navigateWithParams({ [longKey]: value });
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) => {
      const next = prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity];
      navigateWithParams({ am: next.join(",") });
      return next;
    });
  };

  const handleApplyAdvanced = () => {
    navigateWithParams({
      mun: municipality || null,
      ward: ward || null,
      bed: bedrooms || null,
      bath: bathrooms || null,
    });
    setMobileOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setType("all");
    setPrice("any");
    setDistrict("any");
    setSizeMin("");
    setSizeMax("");
    setMunicipality("");
    setWard("");
    setBedrooms("");
    setBathrooms("");
    setFacing("any");
    setRoadType("any");
    setIsCornerPlot(false);
    setIsNegotiable(false);
    setConstructionStatus("any");
    setFurnishing("any");
    setSubCategory("all");
    setAmenities([]);
    pendingQuery.current = "";
    pendingSizeMin.current = "";
    pendingSizeMax.current = "";
    pendingMunicipality.current = "";
    pendingWard.current = "";
    pendingBedrooms.current = "";
    pendingBathrooms.current = "";
    setPanelOpen(false);
    setMobileOpen(false);
    router.push("/search", { scroll: false });
  };

  /* ── Active filter chips ─────────────────────────────────────────── */

  const activeFilters: ActiveFilter[] = [];
  const spQ = searchParams.get("q");
  if (spQ) activeFilters.push({ key: "q", label: "Search", value: `"${spQ}"` });
  const spType = searchParams.get("type");
  if (spType && spType !== "all")
    activeFilters.push({
      key: "type",
      label: "Type",
      value: TYPE_LABELS[spType] ?? spType,
    });
  const spPrice = searchParams.get("pr");
  if (spPrice && spPrice !== "any") {
    const pl = PRICE_OPTIONS.find((o) => o.value === spPrice)?.label;
    activeFilters.push({ key: "pr", label: "Price", value: pl ?? spPrice });
  }
  const spDist = searchParams.get("dist");
  if (spDist && spDist !== "any")
    activeFilters.push({ key: "dist", label: "District", value: spDist });
  const spMinS = searchParams.get("minS");
  if (spMinS)
    activeFilters.push({ key: "minS", label: "Min size", value: spMinS });
  const spMaxS = searchParams.get("maxS");
  if (spMaxS)
    activeFilters.push({ key: "maxS", label: "Max size", value: spMaxS });
  const spMun = searchParams.get("mun");
  if (spMun)
    activeFilters.push({ key: "mun", label: "Municipality", value: spMun });
  const spWard = searchParams.get("ward");
  if (spWard) activeFilters.push({ key: "ward", label: "Ward", value: spWard });
  const spBed = searchParams.get("bed");
  if (spBed)
    activeFilters.push({ key: "bed", label: "Bedrooms", value: spBed });
  const spBath = searchParams.get("bath");
  if (spBath)
    activeFilters.push({ key: "bath", label: "Bathrooms", value: spBath });
  const spFace = searchParams.get("face");
  if (spFace && spFace !== "any")
    activeFilters.push({
      key: "face",
      label: "Facing",
      value: FACING_LABELS[spFace] ?? spFace,
    });
  const spRoad = searchParams.get("road");
  if (spRoad && spRoad !== "any")
    activeFilters.push({
      key: "road",
      label: "Road",
      value: ROAD_LABELS[spRoad] ?? spRoad,
    });
  const spCS = searchParams.get("cs");
  if (spCS && spCS !== "any")
    activeFilters.push({
      key: "cs",
      label: "Status",
      value: CS_LABELS[spCS] ?? spCS,
    });
  const spFt = searchParams.get("ft");
  if (spFt && spFt !== "any")
    activeFilters.push({
      key: "ft",
      label: "Furnishing",
      value: FURNISHING_LABELS[spFt] ?? spFt,
    });
  const spCP = searchParams.get("cp");
  if (spCP === "true")
    activeFilters.push({ key: "cp", label: "Corner plot", value: "Yes" });
  const spNG = searchParams.get("ng");
  if (spNG === "true")
    activeFilters.push({ key: "ng", label: "Negotiable", value: "Yes" });
  const spSub = searchParams.get("sub");
  if (spSub && spSub !== "all") {
    const subLabel = subCategoryOptions.find((o) => o.value === spSub)?.label;
    activeFilters.push({
      key: "sub",
      label: "Sub-type",
      value: subLabel ?? spSub,
    });
  }
  const spAm = searchParams.get("am");
  if (spAm)
    activeFilters.push({
      key: "am",
      label: "Amenities",
      value: spAm.split(",").join(", "),
    });

  const advancedCount = activeFilters.filter((f) =>
    [
      "mun",
      "ward",
      "bed",
      "bath",
      "face",
      "road",
      "cs",
      "ft",
      "cp",
      "ng",
      "sub",
      "am",
    ].includes(f.key),
  ).length;

  /* ── Shared advanced filters content ────────────────────────────── */

  const renderAdvancedContent = () => (
    <div className="space-y-6">
      {/* Location */}
      <FilterSection title="Location" icon="location_on">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="adv-mun"
              className="mb-1 block text-xs font-medium text-on-surface-variant"
            >
              Municipality
            </Label>
            <Input
              id="adv-mun"
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              placeholder="e.g. Kathmandu Metropolitan"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <Label
              htmlFor="adv-ward"
              className="mb-1 block text-xs font-medium text-on-surface-variant"
            >
              Ward Number
            </Label>
            <Input
              id="adv-ward"
              type="number"
              min={1}
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="e.g. 14"
              className="h-9 text-sm"
            />
          </div>
        </div>
      </FilterSection>

      {/* Property Type */}
      <FilterSection title="Property Type" icon="category">
        <div className="space-y-3">
          <div>
            <Label className="mb-1 block text-xs font-medium text-on-surface-variant">
              Main Category
            </Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {subCategoryOptions.length > 0 && (
            <div>
              <Label className="mb-1 block text-xs font-medium text-on-surface-variant">
                Sub-type
              </Label>
              <Select
                value={subCategory}
                onValueChange={(v) => handleSelectChange("subCategory", v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All Sub-types" />
                </SelectTrigger>
                <SelectContent>
                  {subCategoryOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </FilterSection>

      {/* House / Apartment Specs */}
      <FilterSection title="House & Apartment Specs" icon="hotel">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <Label
              htmlFor="adv-bed"
              className="mb-1 block text-xs font-medium text-on-surface-variant"
            >
              Bedrooms
            </Label>
            <Input
              id="adv-bed"
              type="number"
              min={0}
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              placeholder="Min"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <Label
              htmlFor="adv-bath"
              className="mb-1 block text-xs font-medium text-on-surface-variant"
            >
              Bathrooms
            </Label>
            <Input
              id="adv-bath"
              type="number"
              min={0}
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              placeholder="Min"
              className="h-9 text-sm"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label className="mb-1 block text-xs font-medium text-on-surface-variant">
              Furnishing
            </Label>
            <Select
              value={furnishing}
              onValueChange={(v) => handleSelectChange("furnishing", v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {FURNISHING_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label className="mb-1 block text-xs font-medium text-on-surface-variant">
              Construction
            </Label>
            <Select
              value={constructionStatus}
              onValueChange={(v) => handleSelectChange("constructionStatus", v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {CONSTRUCTION_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FilterSection>

      {/* Land / Plot Features */}
      <FilterSection title="Land & Plot Features" icon="terrain">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Label className="mb-1 block text-xs font-medium text-on-surface-variant">
              Facing
            </Label>
            <Select
              value={facing}
              onValueChange={(v) => handleSelectChange("facing", v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {FACING_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label className="mb-1 block text-xs font-medium text-on-surface-variant">
              Road Type
            </Label>
            <Select
              value={roadType}
              onValueChange={(v) => handleSelectChange("roadType", v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {ROAD_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 flex items-end gap-6 sm:col-span-2">
            <div className="flex items-center gap-2">
              <Switch
                id="adv-cp"
                checked={isCornerPlot}
                onCheckedChange={(v) => {
                  setIsCornerPlot(v);
                  navigateWithParams({ isCornerPlot: v ? "true" : "false" });
                }}
              />
              <Label
                htmlFor="adv-cp"
                className="cursor-pointer text-sm text-on-surface"
              >
                Corner plot
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="adv-ng"
                checked={isNegotiable}
                onCheckedChange={(v) => {
                  setIsNegotiable(v);
                  navigateWithParams({ isNegotiable: v ? "true" : "false" });
                }}
              />
              <Label
                htmlFor="adv-ng"
                className="cursor-pointer text-sm text-on-surface"
              >
                Negotiable
              </Label>
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Amenities */}
      <FilterSection title="Amenities" icon="star">
        <div className="flex flex-wrap gap-2">
          {COMMON_AMENITIES.map((amenity) => {
            const selected = amenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "border-gold bg-gold/10 text-gold-deep"
                    : "border-outline-variant bg-surface text-on-surface-variant hover:border-gold/40 hover:text-on-surface"
                }`}
              >
                {selected && (
                  <Icon name="check" className="mr-1 inline text-[12px]" />
                )}
                {amenity}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <section className="sticky top-16 z-30 bg-surface/90 backdrop-blur-md sm:top-20">
      <div className="mx-auto max-w-container-max px-gutter pt-4 pb-2">
        {/* ── Quick filter bar ─────────────────────────────────────── */}
        <form
          aria-label="Filter property search results"
          onSubmit={(e) => {
            e.preventDefault();
            navigateWithParams({ q: query, minS: sizeMin, maxS: sizeMax });
          }}
          className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-outline-variant bg-surface px-3 py-2 shadow-sm transition-[box-shadow,border-color] duration-200 focus-within:border-gold/60 focus-within:ring-2 focus-within:ring-gold/30"
        >
          {/* Search */}
          {/* <div className="flex min-w-[180px] flex-1 items-center gap-2">
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
          </div> */}

          {/* Type */}
          <div className="min-w-[120px] border-l border-outline-variant/70 px-3">
            <Label htmlFor="filter-type" className="sr-only">
              Property Type
            </Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger
                id="filter-type"
                className={`h-9 w-full border-0 bg-transparent text-xs px-2 shadow-none focus-visible:ring-0 ${type !== "all" ? "font-medium text-gold-deep" : ""}`}
              >
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="min-w-[120px] border-l border-outline-variant/70 pl-3">
            <Label htmlFor="filter-price" className="sr-only">
              Price Range
            </Label>
            <Select
              value={price}
              onValueChange={(v) => {
                setPrice(v);
                navigateWithParams({ pr: v });
              }}
            >
              <SelectTrigger
                id="filter-price"
                className={`h-9 w-full border-0 bg-transparent px-2 text-xs shadow-none focus-visible:ring-0 ${price !== "any" ? "font-medium text-gold-deep" : ""}`}
              >
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District */}
          <div className="min-w-[140px] border-l border-outline-variant/70 pl-3">
            <Label id="filter-district" className="sr-only">
              District
            </Label>
            <Combobox
              aria-labelledby="filter-district"
              value={district}
              onValueChange={(v) => {
                setDistrict(v);
                navigateWithParams({ dist: v });
              }}
              options={DISTRICT_OPTIONS}
              placeholder="District"
              searchPlaceholder="Search districts…"
              triggerClassName={`h-9 w-full border-0 bg-transparent px-2 text-xs shadow-none focus-visible:ring-0 ${district !== "any" ? "font-medium text-gold-deep" : ""}`}
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
                type="text"
                value={sizeMax}
                onChange={(e) => setSizeMax(e.target.value)}
                placeholder="Max"
                className="h-9 w-14 border-0 bg-transparent px-2 text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60"
              />
            </div>
          </div>

          {/* All Filters toggle */}
          <div className="border-l border-outline-variant/70 pl-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  setMobileOpen(true);
                } else {
                  setPanelOpen((prev) => !prev);
                }
              }}
              className="h-9 shrink-0 rounded-md px-3 text-xs font-semibold"
            >
              <Icon name="tune" className="mr-1.5 text-[14px]" />
              Filters
              {advancedCount > 0 && (
                <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-on-gold">
                  {advancedCount}
                </span>
              )}
              <Icon
                name={panelOpen ? "expand_less" : "expand_more"}
                className="ml-1 text-[14px]"
              />
            </Button>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <SaveSearchButton />
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

        {/* ── Desktop expandable panel ──────────────────────────────── */}
        {panelOpen && (
          <div className="hidden md:block">
            <div className="mt-3 rounded-xl border border-outline-variant bg-surface p-5 shadow-sm">
              {renderAdvancedContent()}
              <div className="mt-4 flex items-center gap-3 border-t border-outline-variant pt-4">
                <Button
                  type="button"
                  onClick={handleApplyAdvanced}
                  className="rounded-md bg-gold px-6 text-sm font-semibold text-on-gold hover:bg-gold/90"
                >
                  Apply filters
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClear}
                  className="text-sm font-semibold text-on-surface-variant"
                >
                  Clear all
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPanelOpen(false)}
                  className="ml-auto text-sm text-on-surface-variant"
                >
                  Collapse
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Active filter chips (below the sticky bar) ──────────────── */}
      {activeFilters.length > 0 && (
        <div className="border-t border-outline-variant/50 bg-surface/60">
          <div className="mx-auto flex max-w-container-max flex-wrap items-center gap-1.5 px-gutter py-2">
            {activeFilters.map((chip) => (
              <a
                key={chip.key}
                href={`/search?${(() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete(chip.key);
                  return params.toString();
                })()}`}
                className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface px-2.5 py-1 text-[11px] font-medium text-on-surface-variant transition-colors hover:border-gold/50 hover:bg-gold/5"
              >
                <span className="text-on-surface-variant/60">
                  {chip.label.split(":")[0]}:
                </span>
                <span className="text-on-surface">
                  {chip.label.split(":").slice(1).join(":").trim()}
                </span>
                <Icon name="close" className="text-[10px]" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile Sheet ──────────────────────────────────────────── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader className="border-b border-outline-variant pb-4">
            <SheetTitle className="text-lg font-semibold text-navy">
              All Filters
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 py-4">{renderAdvancedContent()}</div>
          <div className="sticky bottom-0 border-t border-outline-variant bg-surface px-4 py-3 flex items-center gap-3">
            <Button
              type="button"
              onClick={handleApplyAdvanced}
              className="flex-1 rounded-md bg-gold text-sm font-semibold text-on-gold hover:bg-gold/90"
            >
              Apply filters
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClear}
              className="text-sm font-semibold text-on-surface-variant"
            >
              Clear all
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

/* ── Helper sub-component ──────────────────────────────────────────── */

function FilterSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon name={icon} className="text-gold-deep text-[16px]" />
        <h3 className="font-label-sm text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
