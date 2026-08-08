"use client";

import {
  cn,
  Icon,
  Input,
  Label,
  LocationSearch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  reverseGeocode,
} from "@repo/ui";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import {
  type District,
  type Municipality,
  type Province,
  PROVINCES,
} from "./constants";
import type { ListingDraft } from "./draft";
import { FieldError, type StepProps } from "./types";
import type {
  ReverseGeocodeAddress,
  ReverseGeocodeResult,
} from "@repo/ui";
import type { LatLng } from "@repo/ui/map";

const MapPicker = dynamic(
  () => import("@repo/ui/map").then((m) => m.MapPicker),
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
  /* --- cascading dropdown options --- */
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

  /* ------------------------------------------------------------------ */
  /*  Reverse-geocode the pin to auto-fill the address form fields.      */
  /*  The pin itself (lat/lng) moves immediately; the address breakdown */
  /*  is fetched afterwards so the user feels instant feedback.         */
  /* ------------------------------------------------------------------ */
  const [resolving, setResolving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMapSelect = useCallback(
    ([lat, lng]: LatLng) => {
      // Keep the pin snappy — update coordinates right away.
      update({ latitude: lat, longitude: lng });

      // Debounced + cancellable reverse geocode so rapid map clicks/drag ends
      // don't fire a flurry of requests, and stale responses are discarded.
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setResolving(true);
        try {
          const result: ReverseGeocodeResult | null = await reverseGeocode(
            lat,
            lng,
            { signal: controller.signal },
          );
          if (controller.signal.aborted) return;
          const patch = buildLocationPatch(result, draft);
          // Only patch the *form* fields; lat/lng were already set above.
          const { latitude: _lat, longitude: _lng, ...formPatch } = patch;
          void _lat;
          void _lng;
          if (Object.keys(formPatch).length > 0) update(formPatch);
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          console.error("Reverse geocode error:", err);
        } finally {
          if (!controller.signal.aborted) setResolving(false);
        }
      }, 250);
    },
    [update, draft],
  );

  return (
    <div className="flex flex-col gap-md">
      {/* Cascading dropdowns */}
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <CascadingSelect
          label="Province"
          value={draft.province}
          options={PROVINCES.map((p) => p.name)}
          error={errors.province}
          onChange={(v) =>
            update({ province: v, district: "", municipality: "", ward: "" })
          }
        />
        <CascadingSelect
          label="District"
          value={draft.district}
          options={districts}
          disabled={!selProvince}
          error={errors.district}
          onChange={(v) => update({ district: v, municipality: "", ward: "" })}
        />
        <CascadingSelect
          label="Municipality"
          value={draft.municipality}
          options={municipalities}
          disabled={!selDistrict}
          error={errors.municipality}
          onChange={(v) => update({ municipality: v, ward: "" })}
        />
        <CascadingSelect
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
          update({
            latitude: r.lat,
            longitude: r.lng,
            // Pre-fill the address only if the user hasn't typed one yet.
            ...(draft.address ? {} : { address: r.displayName }),
          });
        }}
      />

            {/* Map picker — reusable <MapPicker /> */}
      <MapPicker
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

/* ------------------------------------------------------------------ */
/*  Reverse-geocode → draft patch helpers                             */
/* ------------------------------------------------------------------ */

/**
 * Normalise a location name for loose comparison: lower-cased, collapsed
 * whitespace, with "province" stripped so "Bagmati Province" matches "Bagmati".
 */
function normalizeName(s: string | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/province/g, "");
}

/**
 * Legacy Nominatim / OSM responses label Nepali provinces as
 * "Province No. 3" instead of the modern "Bagmati Province". This maps the
 * provinces that exist in the wizard's mock data so the cascade still resolves.
 */
const PROVINCE_NUMBER_TO_NAME: Record<string, string> = {
  "3": "Bagmati",
  "4": "Gandaki",
  "5": "Lumbini",
};

/**
 * Resolve a province from the reverse-geocoded `state` field, trying both the
 * modern name ("Bagmati Province") and the legacy "Province No. 3" form.
 */
function matchProvince(
  addr: ReverseGeocodeAddress | undefined,
): Province | undefined {
  if (!addr?.state) return undefined;
  const target = normalizeName(addr.state);
  const byName = PROVINCES.find((p) => normalizeName(p.name) === target);
  if (byName) return byName;
  const numMatch = addr.state.match(/provinceno\s*(\d+)/i);
  if (numMatch?.[1]) {
    const mapped = PROVINCE_NUMBER_TO_NAME[numMatch[1]];
    return mapped ? PROVINCES.find((p) => p.name === mapped) : undefined;
  }
  return undefined;
}

/**
 * Province-scoped district lookup against the mock data.
 */
function matchDistrict(
  province: Province,
  addr: ReverseGeocodeAddress,
): District | undefined {
  const candidates = [addr.county, addr.state_district].filter(
    (n): n is string => Boolean(n),
  );
  for (const c of candidates) {
    const target = normalizeName(c);
    const found = province.districts.find(
      (d) => normalizeName(d.name) === target,
    );
    if (found) return found;
  }
  return undefined;
}

/**
 * Province-wide district search that can also *discover* the province when the
 * reverse-geocoded `state` field is absent.
 */
function matchDistrictGlobal(addr: ReverseGeocodeAddress): {
  province: Province;
  district: District;
} | undefined {
  const candidates = [addr.county, addr.state_district].filter(
    (n): n is string => Boolean(n),
  );
  for (const c of candidates) {
    const target = normalizeName(c);
    for (const p of PROVINCES) {
      const d = p.districts.find((d) => normalizeName(d.name) === target);
      if (d) return { province: p, district: d };
    }
  }
  return undefined;
}

/**
 * Match a municipality/district against a district's children, tolerating the
 * extra "Metropolitan City" suffix Nominatim appends (e.g. "Kathmandu").
 */
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

/**
 * Resolve province → district → municipality from a reverse-geocoded address,
 * keeping the cascade consistent (a scoped district match only counts when the
 * province was resolved; otherwise fall back to a province-wide search that can
 * also surface the right province).
 */
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
 * Build the draft patch that maps a reverse-geocode result onto the listing
 * draft. User-entered values are *never* clobbered:
 *  - `address` / `areaName` only fill when empty.
 *  - The province → district → municipality cascade only fills a field when it
 *    is empty AND the chain above it is consistent with the user's existing
 *    picks (so a manual province can't be overwritten by a pin in another
 *    province).
 *  - `ward` is intentionally left blank — it can't be reliably derived from
 *    coordinates, so the user picks it themselves.
 */
function buildLocationPatch(
  result: ReverseGeocodeResult | null,
  draft: ListingDraft,
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

  if (!draft.address?.trim() && result.displayName) {
    patch.address = result.displayName;
  }
  if (!draft.areaName?.trim()) {
    const area = addr.suburb ?? addr.road ?? addr.neighbourhood ?? addr.hamlet;
    if (area) patch.areaName = area;
  }

  const provinceConsistent =
    !draft.province || draft.province === provinceMatch?.name;
  if (provinceMatch && provinceConsistent && !draft.province) {
    patch.province = provinceMatch.name;
  }

  const districtConsistent =
    provinceConsistent &&
    (!draft.district || draft.district === districtMatch?.name);
  if (
    districtMatch &&
    provinceConsistent &&
    districtConsistent &&
    !draft.district
  ) {
    patch.district = districtMatch.name;
  }

  const munConsistent =
    districtConsistent &&
    (!draft.municipality || draft.municipality === munMatch?.name);
  if (
    munMatch &&
    provinceConsistent &&
    districtConsistent &&
    munConsistent &&
    !draft.municipality
  ) {
    patch.municipality = munMatch.name;
  }

  return patch;
}

/* ------------------------------------------------------------------ */
/*  Local helper — one labelled cascading <Select>                     */
/* ------------------------------------------------------------------ */
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
