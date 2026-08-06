"use client";

import {
  cn,
  Input,
  Label,
  LocationSearch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
// MapPicker imports raw `leaflet`, which references `window` at module load.
// Load it client-only so it never evaluates during SSR / static prerender of
// this page (a Server Component prerenders `ListingWizard` → `StepLocation`).
// `LocationSearch` has no leaflet dependency, so it imports normally.
import dynamic from "next/dynamic";
import { PROVINCES } from "./constants";
import { FieldError, type StepProps } from "./types";

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
        onChange={([lat, lng]) => update({ latitude: lat, longitude: lng })}
      />
    </div>
  );
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
