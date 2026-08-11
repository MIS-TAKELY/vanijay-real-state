"use client";

import type { ReverseGeocodeAddress, ReverseGeocodeResult } from "@repo/ui";
import {
  cn,
  Icon,
  Input,
  Label,
  LocationSearch,
  reverseGeocode,
  reverseGeocodeGoogle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type District,
  type Municipality,
  type Province,
  PROVINCES,
} from "./constants";
import type { ListingDraft } from "./draft";
import { FieldError, type StepProps } from "./types";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const GOOGLE_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json";
const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/reverse";

async function reverseGeocodeBest(
  lat: number,
  lng: number,
  signal: AbortSignal,
): Promise<ReverseGeocodeResult | null> {
  if (GOOGLE_MAPS_API_KEY) {
    const fromGoogle = await reverseGeocodeGoogle(lat, lng, {
      apiKey: GOOGLE_MAPS_API_KEY,
      endpoint: GOOGLE_ENDPOINT,
      signal,
    });
    if (fromGoogle) return fromGoogle;
  }
  return reverseGeocode(lat, lng, { endpoint: NOMINATIM_ENDPOINT, signal });
}

const MapPicker = dynamic(
  () => import("@repo/ui/gmap").then((m) => m.GoogleMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-xs">
        <div className="h-5" />
        <div className="h-[224px] w-full animate-pulse rounded-2xl border border-outline-variant bg-surface-container" />
      </div>
    ),
  },
);

export function StepLocation({ draft, update, errors }: StepProps) {
  const selProvince = PROVINCES.find((p) => p.name === draft.province);
  const selDistrict = selProvince?.districts.find(
    (d) => d.name === draft.district,
  );
  const selMun = selDistrict?.municipalities.find(
    (m) => m.name === draft.municipality,
  );

  const districts = selProvince?.districts.map((d) => d.name) ?? [];
  const municipalities = selDistrict?.municipalities.map((m) => m.name) ?? [];
  const wards = selMun
    ? Array.from({ length: selMun.wards }, (_, i) => `Ward ${i + 1}`)
    : [];

  const latLng: [number, number] | null =
    draft.latitude != null && draft.longitude != null
      ? [draft.latitude, draft.longitude]
      : null;
  const [resolving, setResolving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  /* Field → the exact value a pin wrote into it. Empty value = untouched. */
  const ownedRef = useRef(new Map<AutoFillField, string>());

  useEffect(() => {
    const owned = ownedRef.current;
    for (const f of LOCATION_AUTOFILL_FIELDS) {
      const v = ((draft[f] as string | null | undefined) ?? "").trim();
      if (v) owned.set(f, v);
      else owned.delete(f);
    }
  }, []);

  const epochRef = useRef(0);

  // Clean up the pending debounce + in-flight request on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const isWritable = useCallback(
    (field: AutoFillField, d: ListingDraft): boolean => {
      // A field is writable if the user hasn't manually edited it (not in ownedRef)
      // or if the current value matches what was auto-filled
      const owned = ownedRef.current.get(field);
      if (owned == null) return true;
      const cur = ((d[field] as string | null | undefined) ?? "").trim();
      return cur === owned;
    },
    [],
  );

  const handleMapSelect = useCallback(
    (coords: [number, number]) => {
      const [lat, lng] = coords;
      const epoch = ++epochRef.current;

      // Reflect the new pin position in the draft immediately so the
      // controlled map marker stays in sync with the clicked/dragged
      // location (the debounced geocode below only fills the text fields).
      update({ latitude: lat, longitude: lng });

      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();

      timerRef.current = setTimeout(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setResolving(true);
        try {
          const result: ReverseGeocodeResult | null = await reverseGeocodeBest(
            lat,
            lng,
            controller.signal,
          );
          if (controller.signal.aborted) return;
          console.log("result-->", result, draftRef.current, isWritable);

          const patch = buildLocationPatch(
            result,
            draftRef.current,
            isWritable,
          );
          const { latitude: _lat, longitude: _lng, ...formPatch } = patch;
          void _lat;
          void _lng;

          if (controller.signal.aborted || epoch !== epochRef.current) return;

          if (Object.keys(formPatch).length > 0) {
            update(formPatch);
            for (const k of Object.keys(formPatch) as AutoFillField[]) {
              const v = formPatch[k];
              if (typeof v === "string" && v !== "") ownedRef.current.set(k, v);
              else ownedRef.current.delete(k);
            }
          }
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          console.error("Reverse geocode error:", err);
        } finally {
          if (!controller.signal.aborted && epoch === epochRef.current) {
            setResolving(false);
          }
        }
      }, 250);
    },
    [update, isWritable],
  );

  return (
    <div className="flex flex-col gap-md">
      {/* Cascading dropdowns */}
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <CascadingSelect
          key={`province-${draft.province}`}
          label="Province"
          value={draft.province}
          options={PROVINCES.map((p) => p.name)}
          error={errors.province}
          onChange={(v) =>
            update({ province: v, district: "", municipality: "", ward: "" })
          }
        />
        <CascadingSelect
          key={`district-${draft.province}-${draft.district}`}
          label="District"
          value={draft.district}
          options={districts}
          disabled={!selProvince}
          error={errors.district}
          onChange={(v) => update({ district: v, municipality: "", ward: "" })}
        />
        <CascadingSelect
          key={`municipality-${draft.district}-${draft.municipality}`}
          label="Municipality"
          value={draft.municipality}
          options={municipalities}
          disabled={!selDistrict}
          error={errors.municipality}
          onChange={(v) => update({ municipality: v, ward: "" })}
        />
        <CascadingSelect
          key={`ward-${draft.municipality}-${draft.ward}`}
          label="Ward"
          value={draft.ward}
          options={wards}
          disabled={!selMun}
          error={errors.ward}
          onChange={(v) => update({ ward: v })}
        />
      </div>

      {/* Area & Address */}
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <Label htmlFor="w-area">Area name</Label>
          <Input
            id="w-area"
            type="text"
            value={draft.areaName}
            onChange={(e) => update({ areaName: e.target.value })}
            placeholder="e.g. Bhaisepati"
            aria-invalid={!!errors.areaName}
            className={cn("h-11", errors.areaName && "border-error")}
          />
          <FieldError message={errors.areaName} />
        </div>
        <div className="flex flex-col gap-xs">
          <Label htmlFor="w-address">
            Address{" "}
            <span className="font-normal text-on-surface-variant">
              (optional)
            </span>
          </Label>
          <Input
            id="w-address"
            type="text"
            value={draft.address}
            onChange={(e) => update({ address: e.target.value })}
            placeholder="Street / landmark"
            className="h-11"
          />
        </div>
      </div>

      {/* Search (Nominatim, Nepal) — reusable <LocationSearch /> */}
      <LocationSearch
        onSelect={(r) => {
          update({ latitude: r.lat, longitude: r.lng });
          handleMapSelect([r.lat, r.lng]);
        }}
      />

      {/* Map picker — reusable <MapPicker /> */}
      <MapPicker
        apiKey={GOOGLE_MAPS_API_KEY}
        value={latLng}
        onChange={handleMapSelect}
        helperText={
          resolving
            ? "Resolving location details…"
            : "Click anywhere on the map to drop a pin, or drag the marker to adjust."
        }
      />

      {resolving && (
        <div className="flex items-center gap-sm text-sm text-on-surface-variant">
          <Icon name="sync" className="text-[18px] animate-spin" />
          <span>Auto-filling address fields from the map pin…</span>
        </div>
      )}
    </div>
  );
}
type AutoFillField =
  | "province"
  | "district"
  | "municipality"
  | "ward"
  | "areaName"
  | "address";

/** All fields the pin may auto-fill, in cascade order (used for ownership). */
const LOCATION_AUTOFILL_FIELDS: AutoFillField[] = [
  "province",
  "district",
  "municipality",
  "ward",
  "areaName",
  "address",
];

function normalizeName(s: string | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/province/g, "");
}

const PROVINCE_NUMBER_TO_NAME: Record<string, string> = {
  "1": "Koshi",
  "2": "Madhesh",
  "3": "Bagmati",
  "4": "Gandaki",
  "5": "Lumbini",
  "6": "Karnali",
  "7": "Sudurpashchim",
};

/** Common alternative spellings for province names (e.g. OSM's "Bagamati"). */
const PROVINCE_ALIASES: Record<string, string> = {
  bagamati: "Bagmati",
};

function matchProvince(
  addr: ReverseGeocodeAddress | undefined,
): Province | undefined {
  if (!addr?.state) return undefined;
  const target = normalizeName(addr.state);
  const byName = PROVINCES.find((p) => normalizeName(p.name) === target);
  if (byName) return byName;
  // OSM sometimes spells provinces slightly differently → alias lookup.
  const alias = PROVINCE_ALIASES[target];
  if (alias) return PROVINCES.find((p) => p.name === alias);
  // Numeric forms: "Province No. 3", "Province 3", "Province number 3", "#4".
  const numMatch = addr.state.match(
    /province\s*(?:no\.?|number|#)?\s*\.?\s*(\d+)/i,
  );
  if (numMatch?.[1]) {
    const mapped = PROVINCE_NUMBER_TO_NAME[numMatch[1]];
    return mapped ? PROVINCES.find((p) => p.name === mapped) : undefined;
  }
  // A bare number, e.g. state = "3".
  const bare = target.match(/^(\d)$/);
  if (bare?.[1]) {
    const mapped = PROVINCE_NUMBER_TO_NAME[bare[1]];
    return mapped ? PROVINCES.find((p) => p.name === mapped) : undefined;
  }
  return undefined;
}

function matchDistrict(
  province: Province,
  addr: ReverseGeocodeAddress,
): District | undefined {
  const candidates = [addr.county, addr.state_district].filter(
    (n): n is string => Boolean(n),
  );
  for (const c of candidates) {
    // Google appends " District" (e.g. "Kathmandu District") → strip it.
    const target = normalizeName(c.replace(/\s+district$/i, ""));
    const found = province.districts.find(
      (d) => normalizeName(d.name) === target,
    );
    if (found) return found;
  }
  return undefined;
}

function matchDistrictGlobal(addr: ReverseGeocodeAddress):
  | {
      province: Province;
      district: District;
    }
  | undefined {
  const candidates = [addr.county, addr.state_district].filter(
    (n): n is string => Boolean(n),
  );
  for (const c of candidates) {
    const target = normalizeName(c.replace(/\s+district$/i, ""));
    for (const p of PROVINCES) {
      const d = p.districts.find((d) => normalizeName(d.name) === target);
      if (d) return { province: p, district: d };
    }
  }
  return undefined;
}

function matchMunicipality(
  district: District,
  addr: ReverseGeocodeAddress,
): Municipality | undefined {
  const candidates = [
    addr.municipality,
    addr.town,
    addr.city,
    addr.village,
    addr.suburb,
    addr.neighbourhood,
    addr.hamlet,
  ].filter((n): n is string => Boolean(n));
  for (const c of candidates) {
    const target = normalizeName(c);
    const found = district.municipalities.find(
      (m) =>
        normalizeName(m.name) === target ||
        normalizeName(m.name).startsWith(target) ||
        target.startsWith(normalizeName(m.name)),
    );
    if (found) return found;
  }
  return undefined;
}

function resolveLocationMatches(addr: ReverseGeocodeAddress | undefined): {
  province?: Province;
  district?: District;
  municipality?: Municipality;
} {
  if (!addr) return {};

  let province = matchProvince(addr);
  let district: District | undefined = province
    ? matchDistrict(province, addr)
    : undefined;

  if (!district && !province) {
    const global = matchDistrictGlobal(addr);
    if (global) {
      province = global.province;
      district = global.district;
    }
  }

  const municipality = district ? matchMunicipality(district, addr) : undefined;
  return { province, district, municipality };
}

/**
 * Extract a ward number from a reverse-geocoded address. Nepal's ward number
 * surfaces in provider-specific fields:
 *  - Nominatim: `city_district` → "Kathmandu-28", "Siddharthanagar-13"
 *  - Google:    `sublocality_level_2/1` → "Ward No. 4"
 *  - display name: "Ward No. 4, …", "Ward 4", "VDC 5"
 */
function extractWardNumber(
  addr: ReverseGeocodeAddress,
  displayName?: string,
): number | undefined {
  // Explicit "Ward N" / "VDC N" in the display name.
  const explicit = displayName?.match(
    /\b(?:ward|vdc)\s*(?:no\.?|number)?\s*(\d{1,2})\b/i,
  );
  if (explicit?.[1]) return Number(explicit[1]);

  // Nominatim: city_district like "Kathmandu-28" → 28.
  const cityDistrict = (addr as Record<string, unknown>).city_district;
  if (typeof cityDistrict === "string") {
    const n = cityDistrict.match(/(\d{1,2})$/)?.[1];
    if (n) return Number(n);
  }
  // Google: sublocality_level_2/1 like "Ward No. 4".
  for (const k of ["sublocality_level_2", "sublocality_level_1"] as const) {
    const v = (addr as Record<string, unknown>)[k];
    if (typeof v === "string") {
      const n = v.match(
        /(?:ward|vdc)?\s*(?:no\.?|number)?\s*(\d{1,2})\b/i,
      )?.[1];
      if (n) return Number(n);
    }
  }
  // Nominatim suburb/neighbourhood sometimes ends in the ward, e.g. "Baghbazar-4".
  for (const k of ["suburb", "neighbourhood"] as const) {
    const v = (addr as Record<string, unknown>)[k];
    if (typeof v === "string") {
      const n = v.match(/(\d{1,2})$/)?.[1];
      if (n) return Number(n);
    }
  }
  return undefined;
}

/** Keep a resolved ward within the municipality's valid range. */
function clampWard(ward: number | undefined, max: number): number {
  if (!ward || !Number.isFinite(ward) || ward < 1) return 1;
  return Math.min(Math.floor(ward), max);
}

function buildLocationPatch(
  result: ReverseGeocodeResult | null,
  draft: ListingDraft,
  isWritable: (field: AutoFillField, draft: ListingDraft) => boolean,
): Partial<ListingDraft> {
  if (!result) return {};

  const addr = result.address ?? {};
  const {
    province: provinceMatch,
    district: districtMatch,
    municipality: munMatch,
  } = resolveLocationMatches(addr);

  const patch: Partial<ListingDraft> = {
    latitude: result.lat,
    longitude: result.lng,
  };

  if (isWritable("address", draft) && result.displayName) {
    patch.address = result.displayName;
  }
  if (isWritable("areaName", draft)) {
    const area = addr.neighbourhood ?? addr.suburb ?? addr.road ?? addr.hamlet;
    if (area) patch.areaName = area;
  }

  const provinceWritable = isWritable("province", draft);
  const districtWritable = isWritable("district", draft);
  const munWritable = isWritable("municipality", draft);
  const wardWritable = isWritable("ward", draft);

  const provinceConsistent =
    !draft.province ||
    provinceWritable ||
    draft.province === provinceMatch?.name;

  if (provinceMatch && provinceWritable) {
    patch.province = provinceMatch.name;
  }

  const districtConsistent =
    provinceConsistent &&
    (!draft.district ||
      districtWritable ||
      draft.district === districtMatch?.name);

  if (districtMatch && districtWritable && provinceConsistent) {
    patch.district = districtMatch.name;
  } else if (districtWritable && provinceConsistent && !districtMatch) {
    // Province resolved but no district match — clear the stale owned value.
    patch.district = "";
  }

  const munConsistent =
    districtConsistent &&
    (!draft.municipality ||
      munWritable ||
      draft.municipality === munMatch?.name);

  const munFilled =
    munMatch && munWritable && provinceConsistent && districtConsistent;

  if (munFilled) {
    patch.municipality = munMatch.name;
  } else if (munWritable && districtConsistent && !munMatch) {
    // District resolved but no municipality match — clear stale owned value.
    patch.municipality = "";
  }

  if (munFilled && wardWritable) {
    const wardNumber = extractWardNumber(addr, result.displayName);
    patch.ward = `Ward ${clampWard(wardNumber, munMatch?.wards ?? 1)}`;
  } else if (wardWritable && munConsistent && !munFilled) {
    patch.ward = "";
  }

  return patch;
}

interface CascadingSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

function CascadingSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  error,
}: CascadingSelectProps) {
  return (
    <div className="flex flex-col gap-xs">
      <Label>{label}</Label>
      <Select
        value={value}
        disabled={disabled || options.length === 0}
        onValueChange={onChange}
      >
        <SelectTrigger className={cn("h-11 w-full", error && "border-error")}>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError message={error} />
    </div>
  );
}
