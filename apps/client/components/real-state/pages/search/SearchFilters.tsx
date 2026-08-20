"use client";
import {
  Button,
  cn,
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

/* ── Size units (conversion factors to sq ft) ────────────────────────
 * The API stores & filters size in sq ft (`landArea.totalSqFt`), so the
 * URL `minS`/`maxS` values are always sq ft. The selected unit only drives
 * how the quick-bar inputs display/interpret the value. Factors mirror the
 * listing wizard (`@repo/ui` PRICE_UNITS / UNIT_PART conversion rates). */

const SIZE_UNITS = [
  { key: "sqft", label: "Sq. ft", sqFt: 1 },
  { key: "sqm", label: "Sq. m", sqFt: 1 / 0.092903 },
  { key: "ropani", label: "Ropani", sqFt: 342.25 * 16 },
  { key: "aana", label: "Aana", sqFt: 342.25 },
  { key: "paisa", label: "Paisa", sqFt: 342.25 / 4 },
  { key: "daam", label: "Daam", sqFt: 342.25 / 16 },
  { key: "bigha", label: "Bigha", sqFt: 364.5 * 20 },
  { key: "katha", label: "Katha", sqFt: 364.5 },
  { key: "dhur", label: "Dhur", sqFt: 364.5 / 20 },
];

const DEFAULT_SIZE_UNIT = "sqft";

const sizeUnitFactor = (unit: string): number =>
  SIZE_UNITS.find((u) => u.key === unit)?.sqFt ?? 1;

/** Format an sq-ft value for display in `unit` ("" when empty/invalid). */
const formatSizeInUnit = (sqFt: string, unit: string): string => {
  if (!sqFt) return "";
  const n = Number(sqFt);
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round((n / sizeUnitFactor(unit)) * 10000) / 10000;
  return String(rounded);
};

/** Convert a value typed in `unit` to sq ft ("" when empty/invalid). */
const toSqFt = (txt: string, unit: string): string => {
  if (txt.trim() === "") return "";
  const n = Number(txt.trim());
  if (!Number.isFinite(n) || n < 0) return "";
  return String(Math.round(n * sizeUnitFactor(unit) * 10000) / 10000);
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
  const [type, setType] = useState(searchParams.get("type") ?? "all");
  const [price, setPrice] = useState(searchParams.get("pr") ?? "any");
  const [district, setDistrict] = useState(searchParams.get("dist") ?? "any");
  const [sizeMin, setSizeMin] = useState(searchParams.get("minS") ?? "");
  const [sizeMax, setSizeMax] = useState(searchParams.get("maxS") ?? "");
  const [unit, setUnit] = useState(
    searchParams.get("unit") ?? DEFAULT_SIZE_UNIT,
  );
  /* Display text for the size inputs, interpreted in the selected unit */
  const [sizeMinTxt, setSizeMinTxt] = useState(() =>
    formatSizeInUnit(sizeMin, unit),
  );
  const [sizeMaxTxt, setSizeMaxTxt] = useState(() =>
    formatSizeInUnit(sizeMax, unit),
  );

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
      const t = overrides.type ?? type;
      if (t !== "all") params.set("type", t);
      const p = overrides.pr ?? price;
      if (p !== "any") params.set("pr", p);
      const d = overrides.dist ?? district;
      if (d !== "any") params.set("dist", d);
      const u = overrides.unit !== undefined ? overrides.unit : unit;
      if (u && u !== DEFAULT_SIZE_UNIT) params.set("unit", u);
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
      unit,
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
    sizeMin,
    sizeMax,
    municipality,
    ward,
    bedrooms,
    bathrooms,
    navigateWithParams,
  ]);

  useEffect(() => {
    pendingSizeMin.current = sizeMin;
    pendingSizeMax.current = sizeMax;
    pendingMunicipality.current = municipality;
    pendingWard.current = ward;
    pendingBedrooms.current = bedrooms;
    pendingBathrooms.current = bathrooms;
  }, [sizeMin, sizeMax, municipality, ward, bedrooms, bathrooms]);

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

  const handleUnitChange = (unitKey: string) => {
    setUnit(unitKey);
    setSizeMinTxt(formatSizeInUnit(sizeMin, unitKey));
    setSizeMaxTxt(formatSizeInUnit(sizeMax, unitKey));
    navigateWithParams({
      unit: unitKey === DEFAULT_SIZE_UNIT ? null : unitKey,
    });
  };

  const handleSizeMinChange = (txt: string) => {
    setSizeMinTxt(txt);
    setSizeMin(toSqFt(txt, unit));
  };

  const handleSizeMaxChange = (txt: string) => {
    setSizeMaxTxt(txt);
    setSizeMax(toSqFt(txt, unit));
  };

  const handleClear = () => {
    setType("all");
    setPrice("any");
    setDistrict("any");
    setSizeMin("");
    setSizeMax("");
    setSizeMinTxt("");
    setSizeMaxTxt("");
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
              className="h-9 text-sm rounded-lg border border-outline-variant bg-white"
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
              className="h-9 text-sm rounded-lg border border-outline-variant bg-white"
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
              <SelectTrigger className="h-9 text-sm rounded-lg border border-outline-variant bg-white">
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
                <SelectTrigger className="h-9 text-sm rounded-lg border border-outline-variant bg-white">
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
              className="h-9 text-sm rounded-lg border border-outline-variant bg-white"
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
              className="h-9 text-sm rounded-lg border border-outline-variant bg-white"
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
              <SelectTrigger className="h-9 text-sm rounded-lg border border-outline-variant bg-white">
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
              <SelectTrigger className="h-9 text-sm rounded-lg border border-outline-variant bg-white">
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
              <SelectTrigger className="h-9 text-sm rounded-lg border border-outline-variant bg-white">
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
              <SelectTrigger className="h-9 text-sm rounded-lg border border-outline-variant bg-white">
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
            navigateWithParams({ minS: sizeMin, maxS: sizeMax });
          }}
          className="flex flex-nowrap items-end gap-x-2 gap-y-2 overflow-x-auto rounded-2xl border border-outline-variant bg-surface px-2 py-2 shadow-sm sm:flex-wrap sm:overflow-x-visible sm:gap-x-3 sm:gap-y-3 sm:px-4 sm:py-3"
        >
          {/* Type */}
          <FilterField label="Type" icon="home">
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger
                id="filter-type"
                className={cn(
                  "h-9 w-full min-w-[110px] rounded-lg border border-outline-variant bg-white px-3 text-xs shadow-none focus-visible:ring-0 sm:min-w-[130px]",
                  type !== "all" && "border-gold/50 font-medium text-gold-deep",
                )}
              >
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
          </FilterField>

          {/* Price */}
          <FilterField label="Price" icon="sell">
            <Select
              value={price}
              onValueChange={(v) => {
                setPrice(v);
                navigateWithParams({ pr: v });
              }}
            >
              <SelectTrigger
                id="filter-price"
                className={cn(
                  "h-9 w-full min-w-[110px] rounded-lg border border-outline-variant bg-white px-3 text-xs shadow-none focus-visible:ring-0 sm:min-w-[130px]",
                  price !== "any" && "border-gold/50 font-medium text-gold-deep",
                )}
              >
                <SelectValue placeholder="Any Price" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          {/* District */}
          <FilterField label="District" icon="location_on">
            <Combobox
              aria-label="District"
              value={district}
              onValueChange={(v) => {
                setDistrict(v);
                navigateWithParams({ dist: v });
              }}
              options={DISTRICT_OPTIONS}
              placeholder="All Districts"
              searchPlaceholder="Search districts…"
              triggerClassName={cn(
                "h-9 w-full min-w-[120px] rounded-lg border border-outline-variant bg-white px-3 text-xs shadow-none focus-visible:ring-0 sm:min-w-[140px]",
                district !== "any" && "border-gold/50 font-medium text-gold-deep",
              )}
            />
          </FilterField>

          {/* Size */}
          <FilterField label="Size" icon="expand">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="size-min" className="sr-only">
                Min size
              </Label>
              <Input
                id="size-min"
                type="text"
                inputMode="decimal"
                value={sizeMinTxt}
                onChange={(e) => handleSizeMinChange(e.target.value)}
                placeholder="Min"
                className="h-9 w-[3.5rem] rounded-lg border border-outline-variant bg-white px-2 text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60 sm:w-[4.5rem] sm:px-2.5"
              />
              <span className="text-xs text-on-surface-variant">–</span>
              <Label htmlFor="size-max" className="sr-only">
                Max size
              </Label>
              <Input
                id="size-max"
                type="text"
                inputMode="decimal"
                value={sizeMaxTxt}
                onChange={(e) => handleSizeMaxChange(e.target.value)}
                placeholder="Max"
                className="h-9 w-[3.5rem] rounded-lg border border-outline-variant bg-white px-2 text-xs shadow-none focus-visible:ring-0 placeholder:text-on-surface-variant/60 sm:w-[4.5rem] sm:px-2.5"
              />
              <Select value={unit} onValueChange={handleUnitChange}>
                <SelectTrigger
                  id="filter-size-unit"
                  className="hidden h-9 w-[5.5rem] shrink-0 rounded-lg border border-outline-variant bg-white px-2.5 text-xs shadow-none focus-visible:ring-0 sm:block sm:w-[6.5rem]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_UNITS.map((o) => (
                    <SelectItem key={o.key} value={o.key}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FilterField>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2 self-end">
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
              className="h-9 shrink-0 rounded-lg border border-outline-variant bg-white px-3 text-xs font-semibold text-on-surface hover:border-gold/50 hover:text-gold-deep"
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
            <SaveSearchButton />
            {activeFilters.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                className="h-9 shrink-0 rounded-lg px-3 text-xs font-semibold text-on-surface-variant hover:text-on-surface"
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

function FilterField({
  label,
  icon,
  className,
  children,
}: {
  label: string;
  icon: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex shrink flex-col gap-1.5 md:shrink-0", className)}>
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
        <Icon name={icon} className="text-[13px]" />
        {label}
      </span>
      {children}
    </div>
  );
}
