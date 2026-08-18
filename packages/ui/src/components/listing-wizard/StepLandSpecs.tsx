"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMemo, type ReactNode } from "react";
import {
  APARTMENT_LIKE_SUBTYPES,
  BIGHA_PARTS,
  BOUNDARY_WALL_OPTIONS,
  COMMERCIAL_FEATURES,
  COURTYARD_OPTIONS,
  FACING_DIRECTIONS,
  FARM_STRUCTURES,
  FENCING_OPTIONS,
  HERITAGE_AMENITY_EXTRAS,
  HERITAGE_ERAS,
  HERITAGE_GRADES,
  HERITAGE_TYPES,
  HOUSE_AMENITIES,
  HOUSE_CONSTRUCTION_STATUSES,
  HOUSE_FACING_OPTIONS,
  HOUSE_FURNISHING,
  HOUSE_SUBTYPES,
  HOUSE_WITH_LAND_SUBTYPES,
  IRRIGATION_TYPES,
  LAND_CLASSIFICATIONS,
  isBuildingType,
  PARKING_OPTIONS,
  PLOT_SHAPES,
  PRICE_TYPES,
  PRICE_UNITS,
  RENOVATION_STATUSES,
  ROAD_TYPES,
  ROPANI_PARTS,
  SOIL_TYPES,
  SPACE_CONSTRUCTION_STATUSES,
  SPACE_FURNISHING,
  SPACE_PARKING_TYPES,
  SPACE_SUBTYPES,
  SUITABLE_FOR_OPTIONS,
  TERRAIN_TYPES,
  TRADITIONAL_FEATURES,
  UNIT_SYSTEMS,
  WATER_SOURCES,
  ZONING_LEGAL_OPTIONS,
  ZONING_OPTIONS,
  type Option,
  type UnitSystem,
} from "./constants";
import {
  hasPricingArea,
  priceContextFromDraft,
  pricePerUnitFor,
  priceUnitKey,
  priceUnitRates,
  totalSqFt,
} from "./draft";
import { formatNPR } from "./format";
import { FieldError, type StepProps } from "./types";

/* ------------------------------------------------------------------ */
/* Shared field primitives — keep the six type variants consistent.     */
/* ------------------------------------------------------------------ */

function Field({
  label,
  error,
  hint,
  children,
}: {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-xs">
      {label && <Label>{label}</Label>}
      {children}
      {hint && !error && (
        <p className="text-[11px] leading-4 text-on-surface-variant">{hint}</p>
      )}
      <FieldError message={error} />
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-sm">
      {title && (
        <div className="flex flex-col gap-0.5">
          <h3 className="font-label-sm text-sm font-semibold text-on-surface">
            {title}
          </h3>
          {hint && (
            <p className="text-[11px] leading-4 text-on-surface-variant">
              {hint}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
}) {
  return (
    <Field label={label} error={error}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-11 w-full" aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder = "0",
  suffix,
  error,
  allowDecimal = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  error?: string;
  allowDecimal?: boolean;
}) {
  return (
    <Field label={label} error={error}>
      <div className="relative">
        <Input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) =>
            onChange(
              allowDecimal
                ? e.target.value.replace(/[^0-9.]/g, "")
                : e.target.value.replace(/[^0-9]/g, ""),
            )
          }
          placeholder={placeholder}
          aria-invalid={!!error}
          className={cn(
            "mono-stat h-11",
            suffix && "pr-14",
            error && "border-error",
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-on-surface-variant">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-xs">
      <Label className="flex w-fit cursor-pointer items-center gap-sm text-sm text-on-surface transition-colors hover:text-on-surface-variant">
        <Switch checked={checked} onCheckedChange={onChange} />
        {label}
      </Label>
      {description && (
        <p className="text-[11px] leading-4 text-on-surface-variant">
          {description}
        </p>
      )}
    </div>
  );
}

function ChipGroup({
  label,
  value,
  onChange,
  options,
  error,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  options: Option[];
  error?: string;
  hint?: string;
}) {
  return (
    <Field label={label} error={error} hint={hint}>
      <ToggleGroup
        type="multiple"
        value={value}
        onValueChange={onChange}
        variant="outline"
        aria-label={label}
        className="flex flex-wrap justify-start gap-sm"
      >
        {options.map((o) => (
          <ToggleGroupItem
            key={o.value}
            value={o.value}
            aria-label={o.label}
            className="rounded-full border px-3 py-1.5 text-[13px] font-medium data-[state=on]:border-primary data-[state=on]:bg-primary/5 data-[state=on]:text-primary data-[state=off]:border-outline-variant data-[state=off]:text-on-surface-variant data-[state=off]:hover:border-primary/40"
          >
            {o.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  );
}

function UnitSystemToggle({
  value,
  onChange,
}: {
  value: UnitSystem;
  onChange: (v: UnitSystem) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (!v) return;
        onChange(v as UnitSystem);
      }}
      variant="outline"
      aria-label="Unit system"
      className="inline-flex w-fit items-center bg-surface p-0.5"
    >
      {UNIT_SYSTEMS.map((opt) => (
        <ToggleGroupItem
          key={opt.key}
          value={opt.key}
          aria-label={opt.label}
          className="px-3 py-1 text-[13px] font-medium data-[state=on]:bg-primary data-[state=on]:text-on-primary data-[state=off]:text-on-surface-variant data-[state=off]:hover:text-on-surface"
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function FacingField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label="Facing">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => {
          if (v) onChange(v);
        }}
        variant="outline"
        aria-label="Facing"
        className="flex flex-wrap justify-start gap-sm"
      >
        {FACING_DIRECTIONS.map((d) => (
          <ToggleGroupItem
            key={d.value}
            value={d.value}
            aria-label={d.label}
            className="rounded-full border px-3 py-1.5 text-[13px] font-medium data-[state=on]:border-primary data-[state=on]:bg-primary/5 data-[state=on]:text-primary data-[state=off]:border-outline-variant data-[state=off]:text-on-surface-variant data-[state=off]:hover:border-primary/40"
          >
            {d.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  );
}

function ComputedArea({
  sqft,
  sqm,
  extra,
}: {
  sqft: number;
  sqm: number;
  extra?: { label: string; value: string }[];
}) {
  const chips: { label: string; value: string }[] = [
    { label: "sq.ft", value: sqft.toLocaleString() },
    { label: "sq.m", value: sqm.toLocaleString() },
    ...(extra ?? []),
  ];
  return (
    <div className="grid grid-cols-2 gap-sm rounded-xl border border-primary/30 bg-primary/5 p-sm">
      {chips.map((c) => (
        <span
          key={c.label}
          className={cn(
            "mono-stat text-lg font-bold text-primary",
            c.label !== "sq.ft" && "border-l border-primary/20 pl-sm",
          )}
        >
          {c.value} {c.label}
        </span>
      ))}
    </div>
  );
}

/** Land area block — unit system toggle + part inputs + auto-calculated totals. */
function LandAreaBlock({
  draft,
  update,
  errors,
  optional = false,
  extra,
}: StepProps & {
  optional?: boolean;
  extra?: { label: string; value: string }[];
}) {
  const parts = draft.unitSystem === "ROPANI" ? ROPANI_PARTS : BIGHA_PARTS;
  const sqft = totalSqFt(draft);
  const sqm = Math.round(sqft * 0.092903);

  return (
    <Section
      title={optional ? "Land area (optional)" : "Land area"}
      hint={
        optional
          ? "Only if the property includes land — most units are priced by built-up area."
          : undefined
      }
    >
      <UnitSystemToggle
        value={draft.unitSystem}
        onChange={(v) => update({ unitSystem: v, units: {} })}
      />
      <div className="grid grid-cols-2 gap-sm sm:grid-cols-3">
        {parts.map((p) => (
          <div key={p.key} className="flex flex-col gap-xs">
            <Label className="font-label-sm text-[13px]">{p.unit}</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={draft.units[p.key] ?? ""}
              onChange={(e) =>
                update({
                  units: {
                    ...draft.units,
                    [p.key]: e.target.value.replace(/[^0-9.]/g, ""),
                  },
                })
              }
              placeholder="0"
              className="h-11"
            />
          </div>
        ))}
      </div>
      <FieldError message={errors.units} />
      <ComputedArea sqft={sqft} sqm={sqm} extra={extra} />
    </Section>
  );
}

/** Road type + width — always persisted, so options stay Prisma-aligned. */
function RoadBlock({ draft, update, errors }: StepProps) {
  return (
    <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
      <SelectField
        label="Road type"
        value={draft.roadType}
        onChange={(v) => update({ roadType: v })}
        options={ROAD_TYPES}
        placeholder="Select road type"
      />
      <NumberField
        label="Road width (ft)"
        value={draft.roadWidthFt}
        onChange={(v) => update({ roadWidthFt: v })}
        placeholder="e.g. 20"
        suffix="ft"
        error={errors.roadWidthFt}
      />
    </div>
  );
}

/** Asking price + price-per-unit. Land types use the unit dropdown; building
 *  types show the auto-calculated per-sq.ft / per-sq.m rates. */
function PriceBlock({ draft, update, errors }: StepProps) {
  const isBuilding = isBuildingType(draft.subCategory);
  // All per-unit math runs through the shared PriceContext conversion so the
  // wizard and the public /slug page always produce identical rates.
  const ctx = useMemo(() => priceContextFromDraft(draft), [draft]);
  const unitKey = useMemo(() => priceUnitKey(ctx), [ctx]);
  const perUnit = useMemo(() => pricePerUnitFor(ctx, unitKey), [ctx, unitKey]);
  const rateLabel = useMemo(() => {
    const rates: Record<string, string> = {};
    for (const [key, rate] of Object.entries(priceUnitRates(ctx))) {
      rates[key] = rate != null ? formatNPR(rate) : "—";
    }
    return rates;
  }, [ctx]);
  const hasArea = hasPricingArea(ctx);

  return (
    <div className="flex flex-col gap-sm border-t border-outline-variant pt-md">
      <Field label="Asking price (NPR)" error={errors.askingPrice}>
        <Input
          type="text"
          inputMode="numeric"
          value={draft.askingPrice}
          onChange={(e) =>
            update({ askingPrice: e.target.value.replace(/[^0-9,]/g, "") })
          }
          placeholder="2,45,00,000"
          aria-invalid={!!errors.askingPrice}
          className={cn("mono-stat h-11", errors.askingPrice && "border-error")}
        />
      </Field>

      {isBuilding ? (
        <div className="flex flex-col gap-xs">
          <Label>Price per unit (auto-calculated)</Label>
          <div className="grid grid-cols-2 gap-sm rounded-xl border border-primary/30 bg-primary/5 p-sm">
            <span className="mono-stat text-lg font-bold text-primary">
              {rateLabel.sqft !== "—" ? `${rateLabel.sqft} / sq.ft` : "—"}
            </span>
            <span className="mono-stat text-lg font-bold text-primary border-l border-primary/20 pl-sm">
              {rateLabel.sqm !== "—" ? `${rateLabel.sqm} / sq.m` : "—"}
            </span>
          </div>
          {perUnit == null && (
            <p className="text-[11px] leading-4 text-on-surface-variant">
              {hasArea
                ? "Enter the asking price above to see per-unit rates."
                : "Enter the built-up area above to see per-unit rates."}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-xs">
          <Label>Price per unit</Label>
          <Select
            value={unitKey}
            onValueChange={(v) => update({ priceUnit: v })}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Select a land unit" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_UNITS.map((u) => (
                <SelectItem key={u.key} value={u.key}>
                  <span className="flex-1">{u.label}</span>
                  <span className="mono-stat text-[12px] tabular-nums text-on-surface-variant">
                    {rateLabel[u.key]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {perUnit == null && (
            <p className="text-[11px] leading-4 text-on-surface-variant">
              {hasArea
                ? "Enter the asking price above to see per-unit rates."
                : "Enter the land area above to see per-unit rates."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Min buyable land — only for the three land property types. */
function MinBuyableBlock({ draft, update }: StepProps) {
  const parts =
    draft.minBuyableUnitSystem === "ROPANI" ? ROPANI_PARTS : BIGHA_PARTS;
  return (
    <div className="flex flex-col gap-xs border-t border-outline-variant pt-md">
      <Section
        title="Minimum buyable land (optional)"
        hint="If you're willing to sell a portion, set the minimum area a buyer can purchase at the listed price."
      >
        <UnitSystemToggle
          value={draft.minBuyableUnitSystem}
          onChange={(v) =>
            update({ minBuyableUnitSystem: v, minBuyableUnits: {} })
          }
        />
        <div className="grid grid-cols-2 gap-sm sm:grid-cols-3">
          {parts.map((p) => (
            <div key={p.key} className="flex flex-col gap-xs">
              <Label className="font-label-sm text-[13px]">{p.unit}</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={draft.minBuyableUnits[p.key] ?? ""}
                onChange={(e) =>
                  update({
                    minBuyableUnits: {
                      ...draft.minBuyableUnits,
                      [p.key]: e.target.value.replace(/[^0-9.]/g, ""),
                    },
                  })
                }
                placeholder="0"
                className="h-11"
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Per-type variants                                                   */
/* ------------------------------------------------------------------ */

function ResidentialLandSpecs(props: StepProps) {
  const { draft, update } = props;
  return (
    <div className="flex flex-col gap-md">
      <LandAreaBlock {...props} />
      <RoadBlock {...props} />
      <FacingField
        value={draft.facing}
        onChange={(v) => update({ facing: v })}
      />
      <ToggleField
        label="Corner plot"
        checked={draft.isCornerPlot}
        onChange={(v) => update({ isCornerPlot: v })}
      />
      <div className="grid grid-cols-1 gap-sm border-t border-outline-variant pt-md sm:grid-cols-2">
        <SelectField
          label="Plot shape"
          value={draft.plotShape}
          onChange={(v) => update({ plotShape: v })}
          options={PLOT_SHAPES}
          placeholder="Select plot shape"
        />
        <NumberField
          label="Frontage (ft, optional)"
          value={draft.frontageFt}
          onChange={(v) => update({ frontageFt: v })}
          placeholder="e.g. 40"
          suffix="ft"
        />
      </div>
      <SelectField
        label="Boundary wall"
        value={draft.boundaryWall}
        onChange={(v) => update({ boundaryWall: v })}
        options={BOUNDARY_WALL_OPTIONS}
        placeholder="Select"
      />
      <ToggleField
        label="Land cleared / fenced"
        checked={draft.landClearance}
        onChange={(v) => update({ landClearance: v })}
      />
      <MinBuyableBlock {...props} />
      <PriceBlock {...props} />
    </div>
  );
}

function CommercialLandSpecs(props: StepProps) {
  const { draft, update } = props;
  return (
    <div className="flex flex-col gap-md">
      <LandAreaBlock {...props} />
      <RoadBlock {...props} />
      <FacingField
        value={draft.facing}
        onChange={(v) => update({ facing: v })}
      />
      <ToggleField
        label="Corner plot"
        checked={draft.isCornerPlot}
        onChange={(v) => update({ isCornerPlot: v })}
      />
      <div className="grid grid-cols-1 gap-sm border-t border-outline-variant pt-md sm:grid-cols-2">
        <NumberField
          label="Frontage (ft)"
          value={draft.frontageFt}
          onChange={(v) => update({ frontageFt: v })}
          placeholder="e.g. 60"
          suffix="ft"
          error={props.errors.frontageFt}
        />
        <NumberField
          label="Depth (ft, optional)"
          value={draft.depthFt}
          onChange={(v) => update({ depthFt: v })}
          placeholder="e.g. 100"
          suffix="ft"
        />
      </div>
      <SelectField
        label="Zoning / land use classification"
        value={draft.zoning}
        onChange={(v) => update({ zoning: v })}
        options={ZONING_OPTIONS}
        placeholder="Select zoning"
      />
      <div className="flex flex-col gap-xs">
        <ToggleField
          label="Setback available"
          checked={draft.setbackAvailable}
          onChange={(v) => update({ setbackAvailable: v })}
          description="Front / back / side clearance from the boundary in feet."
        />
        {draft.setbackAvailable && (
          <NumberField
            label="Setback (front/back/side in ft)"
            value={draft.setbackText}
            onChange={(v) => update({ setbackText: v })}
            placeholder="e.g. 20/15/10"
          />
        )}
      </div>
      <ChipGroup
        label="Suitable for"
        value={draft.suitableFor}
        onChange={(v) => update({ suitableFor: v })}
        options={SUITABLE_FOR_OPTIONS}
        hint="Select all that apply."
      />
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <SelectField
          label="Boundary wall"
          value={draft.boundaryWall}
          onChange={(v) => update({ boundaryWall: v })}
          options={BOUNDARY_WALL_OPTIONS}
          placeholder="Select"
        />
        <NumberField
          label="Parking spaces on plot"
          value={draft.parkingSpaces}
          onChange={(v) => update({ parkingSpaces: v })}
          placeholder="e.g. 2"
          allowDecimal={false}
        />
      </div>
      <MinBuyableBlock {...props} />
      <PriceBlock {...props} />
    </div>
  );
}

function AgriculturalLandSpecs(props: StepProps) {
  const { draft, update } = props;
  const sqft = totalSqFt(draft);
  const sqm = Math.round(sqft * 0.092903);
  const irrigationRelevant =
    draft.waterSources.includes("IRRIGATION_SYSTEM") ||
    draft.waterSources.includes("CANAL") ||
    draft.landClassification === "IRRIGATED";
  return (
    <div className="flex flex-col gap-md">
      <LandAreaBlock
        {...props}
        extra={[
          { label: "acres", value: (sqft / 43560).toFixed(2) },
          { label: "hectares", value: (sqm / 10000).toFixed(2) },
        ]}
      />
      <RoadBlock {...props} />
      <FacingField
        value={draft.facing}
        onChange={(v) => update({ facing: v })}
      />
      <div className="grid grid-cols-1 gap-sm border-t border-outline-variant pt-md sm:grid-cols-2">
        <SelectField
          label="Land classification"
          value={draft.landClassification}
          onChange={(v) => update({ landClassification: v })}
          options={LAND_CLASSIFICATIONS}
          placeholder="Select classification"
        />
        <SelectField
          label="Soil type"
          value={draft.soilType}
          onChange={(v) => update({ soilType: v })}
          options={SOIL_TYPES}
          placeholder="Select soil type"
        />
      </div>
      <ChipGroup
        label="Water source"
        value={draft.waterSources}
        onChange={(v) => update({ waterSources: v })}
        options={WATER_SOURCES}
        hint="Select all that apply."
      />
      {irrigationRelevant && (
        <SelectField
          label="Irrigation type"
          value={draft.irrigationType}
          onChange={(v) => update({ irrigationType: v })}
          options={IRRIGATION_TYPES}
          placeholder="Select irrigation type"
        />
      )}
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <Field label="Current crops / usage (optional)">
          <Input
            type="text"
            value={draft.currentCrops}
            onChange={(e) => update({ currentCrops: e.target.value })}
            placeholder="e.g. Paddy, maize, mustard"
            className="h-11"
          />
        </Field>
        <SelectField
          label="Fencing"
          value={draft.fencing}
          onChange={(v) => update({ fencing: v })}
          options={FENCING_OPTIONS}
          placeholder="Select"
        />
      </div>
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <SelectField
          label="Terrain"
          value={draft.terrain}
          onChange={(v) => update({ terrain: v })}
          options={TERRAIN_TYPES}
          placeholder="Select terrain"
        />
        <div className="flex items-end">
          <ToggleField
            label="Electricity available on land"
            checked={draft.electricityAvailable}
            onChange={(v) => update({ electricityAvailable: v })}
          />
        </div>
      </div>
      <Field label="Annual yield / income potential (optional)">
        <Input
          type="text"
          value={draft.annualYield}
          onChange={(e) => update({ annualYield: e.target.value })}
          placeholder="e.g. Approx NPR 2,00,000 per year"
          className="h-11"
        />
      </Field>
      <ChipGroup
        label="Farm structures present"
        value={draft.farmStructures}
        onChange={(v) => update({ farmStructures: v })}
        options={FARM_STRUCTURES}
        hint="Select all that apply."
      />
      <MinBuyableBlock {...props} />
      <PriceBlock {...props} />
    </div>
  );
}

function BuildingRoomsGrid(props: StepProps) {
  const { draft, update } = props;
  return (
    <div className="grid grid-cols-2 gap-sm sm:grid-cols-3">
      <NumberField
        label="Bedrooms"
        value={draft.bedrooms}
        onChange={(v) => update({ bedrooms: v })}
        allowDecimal={false}
      />
      <NumberField
        label="Bathrooms"
        value={draft.bathrooms}
        onChange={(v) => update({ bathrooms: v })}
        allowDecimal={false}
      />
      <NumberField
        label="Living rooms"
        value={draft.livingRooms}
        onChange={(v) => update({ livingRooms: v })}
        allowDecimal={false}
      />
      <NumberField
        label="Kitchens"
        value={draft.kitchens}
        onChange={(v) => update({ kitchens: v })}
        allowDecimal={false}
      />
      <NumberField
        label="Balconies"
        value={draft.balconies}
        onChange={(v) => update({ balconies: v })}
        allowDecimal={false}
      />
    </div>
  );
}

function ResidentialHouseSpecs(props: StepProps) {
  const { draft, update } = props;
  const isApartmentLike = APARTMENT_LIKE_SUBTYPES.includes(
    draft.propertySubtype,
  );
  const includesPlot =
    HOUSE_WITH_LAND_SUBTYPES.includes(draft.propertySubtype) &&
    totalSqFt(draft) > 0;
  return (
    <div className="flex flex-col gap-md">
      <LandAreaBlock {...props} optional />
      <NumberField
        label="Built-up area / Carpet area (sq.ft)"
        value={draft.builtUpAreaSqFt}
        onChange={(v) => update({ builtUpAreaSqFt: v })}
        placeholder="e.g. 2,400"
        suffix="sq.ft"
        error={props.errors.builtUpAreaSqFt}
      />
      <SelectField
        label="Property subtype"
        value={draft.propertySubtype}
        onChange={(v) => update({ propertySubtype: v })}
        options={HOUSE_SUBTYPES}
        placeholder="Select subtype"
      />
      <div className="grid grid-cols-1 gap-sm border-t border-outline-variant pt-md sm:grid-cols-2">
        <NumberField
          label="Year built (optional)"
          value={draft.yearBuilt}
          onChange={(v) => update({ yearBuilt: v })}
          placeholder="e.g. 2018"
          allowDecimal={false}
        />
        <SelectField
          label="Construction status"
          value={draft.constructionStatus}
          onChange={(v) => update({ constructionStatus: v })}
          options={HOUSE_CONSTRUCTION_STATUSES}
          placeholder="Select status"
        />
      </div>
      {isApartmentLike && (
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
          <NumberField
            label="Floor number"
            value={draft.floorNumber}
            onChange={(v) => update({ floorNumber: v })}
            placeholder="e.g. 3"
            allowDecimal={false}
            error={props.errors.floorNumber}
          />
          <NumberField
            label="Total floors in building"
            value={draft.totalFloors}
            onChange={(v) => update({ totalFloors: v })}
            placeholder="e.g. 8"
            allowDecimal={false}
          />
        </div>
      )}
      <BuildingRoomsGrid {...props} />
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <SelectField
          label="Parking"
          value={draft.parking}
          onChange={(v) => update({ parking: v })}
          options={PARKING_OPTIONS}
          placeholder="Select parking"
        />
        <SelectField
          label="Furnishing status"
          value={draft.furnishing}
          onChange={(v) => update({ furnishing: v })}
          options={HOUSE_FURNISHING}
          placeholder="Select furnishing"
        />
      </div>
      <div className="flex flex-col gap-sm border-t border-outline-variant pt-md">
        <RoadBlock {...props} />
        <FacingField
          value={draft.facing}
          onChange={(v) => update({ facing: v })}
        />
        {includesPlot && (
          <ToggleField
            label="Corner plot"
            checked={draft.isCornerPlot}
            onChange={(v) => update({ isCornerPlot: v })}
          />
        )}
        <SelectField
          label="House facing"
          value={draft.houseFacing}
          onChange={(v) => update({ houseFacing: v })}
          options={HOUSE_FACING_OPTIONS}
          placeholder="Select house facing"
        />
      </div>
      <PriceBlock {...props} />
      <ChipGroup
        label="Amenities"
        value={draft.amenities}
        onChange={(v) => update({ amenities: v })}
        options={HOUSE_AMENITIES}
        hint="Select all that apply."
      />
    </div>
  );
}

function CommercialSpaceSpecs(props: StepProps) {
  const { draft, update } = props;
  return (
    <div className="flex flex-col gap-md">
      <LandAreaBlock {...props} optional />
      <NumberField
        label="Built-up area / Carpet area (sq.ft)"
        value={draft.builtUpAreaSqFt}
        onChange={(v) => update({ builtUpAreaSqFt: v })}
        placeholder="e.g. 1,800"
        suffix="sq.ft"
        error={props.errors.builtUpAreaSqFt}
      />
      <SelectField
        label="Property subtype"
        value={draft.propertySubtype}
        onChange={(v) => update({ propertySubtype: v })}
        options={SPACE_SUBTYPES}
        placeholder="Select subtype"
      />
      <div className="grid grid-cols-1 gap-sm border-t border-outline-variant pt-md sm:grid-cols-2">
        <NumberField
          label="Floor number"
          value={draft.floorNumber}
          onChange={(v) => update({ floorNumber: v })}
          placeholder="e.g. 2"
          allowDecimal={false}
        />
        <NumberField
          label="Total floors"
          value={draft.totalFloors}
          onChange={(v) => update({ totalFloors: v })}
          placeholder="e.g. 5"
          allowDecimal={false}
        />
      </div>
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
        <NumberField
          label="Frontage (ft)"
          value={draft.frontageFt}
          onChange={(v) => update({ frontageFt: v })}
          placeholder="e.g. 30"
          suffix="ft"
          error={props.errors.frontageFt}
        />
        <NumberField
          label="Depth (ft, optional)"
          value={draft.depthFt}
          onChange={(v) => update({ depthFt: v })}
          placeholder="e.g. 60"
          suffix="ft"
        />
        <NumberField
          label="Ceiling height (ft, optional)"
          value={draft.ceilingHeightFt}
          onChange={(v) => update({ ceilingHeightFt: v })}
          placeholder="e.g. 12"
          suffix="ft"
        />
      </div>
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <NumberField
          label="Year built (optional)"
          value={draft.yearBuilt}
          onChange={(v) => update({ yearBuilt: v })}
          placeholder="e.g. 2015"
          allowDecimal={false}
        />
        <SelectField
          label="Construction status"
          value={draft.constructionStatus}
          onChange={(v) => update({ constructionStatus: v })}
          options={SPACE_CONSTRUCTION_STATUSES}
          placeholder="Select status"
        />
      </div>
      <div className="flex flex-col gap-sm border-t border-outline-variant pt-md">
        <RoadBlock {...props} />
        <FacingField
          value={draft.facing}
          onChange={(v) => update({ facing: v })}
        />
        <ToggleField
          label="Corner property"
          checked={draft.isCornerPlot}
          onChange={(v) => update({ isCornerPlot: v })}
        />
      </div>
      <div className="flex flex-col gap-xs border-t border-outline-variant pt-md">
        <ToggleField
          label="Parking available"
          checked={draft.parkingAvailable}
          onChange={(v) =>
            update(
              v
                ? { parkingAvailable: true }
                : {
                    parkingAvailable: false,
                    parkingSpaces: "",
                    parkingType: "",
                  },
            )
          }
        />
        {draft.parkingAvailable && (
          <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
            <NumberField
              label="Parking spaces"
              value={draft.parkingSpaces}
              onChange={(v) => update({ parkingSpaces: v })}
              placeholder="e.g. 2"
              allowDecimal={false}
            />
            <SelectField
              label="Parking type"
              value={draft.parkingType}
              onChange={(v) => update({ parkingType: v })}
              options={SPACE_PARKING_TYPES}
              placeholder="Select type"
            />
          </div>
        )}
      </div>
      <SelectField
        label="Furnishing"
        value={draft.furnishing}
        onChange={(v) => update({ furnishing: v })}
        options={SPACE_FURNISHING}
        placeholder="Select furnishing"
      />
      <PriceBlock {...props} />
      <div className="grid grid-cols-1 gap-sm border-t border-outline-variant pt-md sm:grid-cols-2">
        <SelectField
          label="Price type"
          value={draft.priceType}
          onChange={(v) => update({ priceType: v })}
          options={PRICE_TYPES}
          placeholder="Select price type"
        />
        <div className="flex items-end">
          <ToggleField
            label="Lease option available"
            checked={draft.leaseAvailable}
            onChange={(v) => update({ leaseAvailable: v })}
          />
        </div>
      </div>
      {draft.leaseAvailable && (
        <NumberField
          label="Monthly rent (NPR)"
          value={draft.leaseMonthlyRent}
          onChange={(v) => update({ leaseMonthlyRent: v })}
          placeholder="e.g. 1,50,000"
        />
      )}
      <ChipGroup
        label="Commercial features"
        value={draft.commercialFeatures}
        onChange={(v) => update({ commercialFeatures: v })}
        options={COMMERCIAL_FEATURES}
        hint="Select all that apply."
      />
      <SelectField
        label="Zoning / legal"
        value={draft.zoningLegal}
        onChange={(v) => update({ zoningLegal: v })}
        options={ZONING_LEGAL_OPTIONS}
        placeholder="Select zoning"
      />
    </div>
  );
}

function HeritageHomeSpecs(props: StepProps) {
  const { draft, update } = props;
  return (
    <div className="flex flex-col gap-md">
      <LandAreaBlock {...props} optional />
      <NumberField
        label="Built-up area (sq.ft)"
        value={draft.builtUpAreaSqFt}
        onChange={(v) => update({ builtUpAreaSqFt: v })}
        placeholder="e.g. 3,200"
        suffix="sq.ft"
      />
      <SelectField
        label="Heritage type"
        value={draft.heritageType}
        onChange={(v) => update({ heritageType: v })}
        options={HERITAGE_TYPES}
        placeholder="Select heritage type"
      />
      <div className="grid grid-cols-1 gap-sm border-t border-outline-variant pt-md sm:grid-cols-2">
        <SelectField
          label="Estimated era / period"
          value={draft.heritageEra}
          onChange={(v) => update({ heritageEra: v })}
          options={HERITAGE_ERAS}
          placeholder="Select era"
        />
        <NumberField
          label="Year built (if known)"
          value={draft.yearBuilt}
          onChange={(v) => update({ yearBuilt: v })}
          placeholder="e.g. 1890"
          allowDecimal={false}
        />
      </div>
      <SelectField
        label="Grade / classification"
        value={draft.heritageGrade}
        onChange={(v) => update({ heritageGrade: v })}
        options={HERITAGE_GRADES}
        placeholder="Select grade"
      />
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
        <NumberField
          label="Bedrooms"
          value={draft.bedrooms}
          onChange={(v) => update({ bedrooms: v })}
          allowDecimal={false}
        />
        <NumberField
          label="Bathrooms"
          value={draft.bathrooms}
          onChange={(v) => update({ bathrooms: v })}
          allowDecimal={false}
        />
        <SelectField
          label="Courtyard"
          value={draft.courtyard}
          onChange={(v) => update({ courtyard: v })}
          options={COURTYARD_OPTIONS}
          placeholder="Select"
        />
      </div>
      <ChipGroup
        label="Traditional features"
        value={draft.traditionalFeatures}
        onChange={(v) => update({ traditionalFeatures: v })}
        options={TRADITIONAL_FEATURES}
        hint="Select all that apply."
      />
      <SelectField
        label="Renovation status"
        value={draft.renovationStatus}
        onChange={(v) => update({ renovationStatus: v })}
        options={RENOVATION_STATUSES}
        placeholder="Select status"
      />
      <div className="flex flex-col gap-sm border-t border-outline-variant pt-md">
        <RoadBlock {...props} />
        <FacingField
          value={draft.facing}
          onChange={(v) => update({ facing: v })}
        />
        <SelectField
          label="Parking"
          value={draft.parking}
          onChange={(v) => update({ parking: v })}
          options={PARKING_OPTIONS}
          placeholder="Select parking"
        />
      </div>
      <PriceBlock {...props} />
      <ChipGroup
        label="Amenities"
        value={draft.amenities}
        onChange={(v) => update({ amenities: v })}
        options={[...HOUSE_AMENITIES, ...HERITAGE_AMENITY_EXTRAS]}
        hint="Select all that apply."
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Entry point — picks the variant for the selected property type.      */
/* ------------------------------------------------------------------ */

import { CustomSpecsBlock } from "./CustomSpecsBlock";

export function StepLandSpecs(props: StepProps) {
  const sub = props.draft.subCategory;
  let Variant: React.ComponentType<StepProps>;
  switch (sub) {
    case "RESIDENTIAL_LAND": case "INDUSTRIAL_LAND": case "DEVELOPMENT_LAND": Variant = ResidentialLandSpecs; break;
    case "COMMERCIAL_LAND": Variant = CommercialLandSpecs; break;
    case "AGRICULTURAL_LAND": Variant = AgriculturalLandSpecs; break;
    case "HOUSE": case "APARTMENT_FLAT": case "TOWNHOUSE": case "ROOM": case "RESIDENTIAL_BUILDING": Variant = ResidentialHouseSpecs; break;
    case "OFFICE": case "RETAIL_SPACE": case "RESTAURANT_CAFE": case "HOSPITALITY": case "COMMERCIAL_BUILDING": Variant = CommercialSpaceSpecs; break;
    case "WAREHOUSE_GODOWN": case "FACTORY_MANUFACTURING": case "LOGISTICS_DISTRIBUTION": case "WORKSHOP": case "INDUSTRIAL_BUILDING": Variant = CommercialSpaceSpecs; break;
    case "HEALTHCARE": case "EDUCATION": case "INSTITUTIONAL": case "COMMUNITY": Variant = HeritageHomeSpecs; break;
    default: Variant = ResidentialLandSpecs;
  }
  return (
    <div className="flex flex-col gap-lg">
      <Variant {...props} />
      <div className="border-t border-outline-variant pt-lg">
        <CustomSpecsBlock {...props} />
      </div>
    </div>
  );
}
