"use client";

import {
  cn,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
} from "@repo/ui";
import { formatNPR } from "lib/api/services/properties/types";
import { useMemo } from "react";
import {
  BIGHA_PARTS,
  FACING_DIRECTIONS,
  PRICE_UNIT_DEFAULT,
  PRICE_UNITS,
  ROAD_TYPES,
  ROPANI_PARTS,
  UNIT_SYSTEMS,
  type UnitSystem,
} from "./constants";
import { pricePerUnit, totalSqFt } from "./draft";
import { FieldError, type StepProps } from "./types";

export function StepLandSpecs({ draft, update, errors }: StepProps) {
  const parts = draft.unitSystem === "ROPANI" ? ROPANI_PARTS : BIGHA_PARTS;
  const sqft = totalSqFt(draft);
  const sqm = Math.round(sqft * 0.092903);

  // Land unit the asking price is shown "per" (defaults per unit system).
  const unitKey = useMemo(
    () => draft.priceUnit || PRICE_UNIT_DEFAULT[draft.unitSystem],
    [draft.priceUnit, draft.unitSystem],
  );
  const hasArea = sqft > 0;
  const perUnit = useMemo(() => pricePerUnit(draft, unitKey), [draft, unitKey]);
  const rateLabel = useMemo(() => {
    const rates: Record<string, string> = {};
    for (const u of PRICE_UNITS) {
      const rate = pricePerUnit(draft, u.key);
      rates[u.key] = rate != null ? formatNPR(rate) : "—";
    }
    return rates;
  }, [draft]);

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <Label>Unit system</Label>
        <ToggleGroup
          type="single"
          value={draft.unitSystem}
          onValueChange={(v) => {
            if (!v) return;
            update({ unitSystem: v as UnitSystem, units: {} });
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
      </div>

      <div className="flex flex-col gap-xs">
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
      </div>

      <div className="grid grid-cols-2 gap-sm rounded-xl border border-primary/30 bg-primary/5 p-sm">
        <span className="mono-stat text-lg font-bold text-primary">
          {sqft.toLocaleString()} sq.ft
        </span>
        <span className="mono-stat text-lg font-bold text-primary border-l border-primary/20 pl-sm">
          {sqm.toLocaleString()} sq.m
        </span>
      </div>

      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <Label>Road type</Label>
          <Select
            value={draft.roadType}
            onValueChange={(v) => update({ roadType: v })}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Select road type" />
            </SelectTrigger>
            <SelectContent>
              {ROAD_TYPES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-xs">
          <Label>Road width (ft)</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={draft.roadWidthFt}
            onChange={(e) =>
              update({ roadWidthFt: e.target.value.replace(/[^0-9.]/g, "") })
            }
            placeholder="e.g. 20"
            aria-invalid={!!errors.roadWidthFt}
            className={cn("mono-stat h-11", errors.roadWidthFt && "border-error")}
          />
          <FieldError message={errors.roadWidthFt} />
        </div>
      </div>

      <div className="flex flex-col gap-xs">
        <Label>Facing</Label>
        <ToggleGroup
          type="single"
          value={draft.facing}
          onValueChange={(v) => {
            if (v) update({ facing: v });
          }}
          variant="outline"
          aria-label="Facing"
          className="flex flex-wrap gap-sm justify-start"
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
      </div>

      <Label className="flex w-fit items-center gap-sm text-sm text-on-surface hover:text-on-surface-variant transition-colors cursor-pointer">
        <Switch
          checked={draft.isCornerPlot}
          onCheckedChange={(v) => update({ isCornerPlot: v })}
        />
        Corner plot
      </Label>

      {/* Asking price — last field so the land area above is already entered
          when the per-unit rates are computed below. */}
      <div className="flex flex-col gap-xs border-t border-outline-variant pt-md">
        <Label htmlFor="w-price">Asking price (NPR)</Label>
        <Input
          id="w-price"
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

        {/* Land-unit dropdown — every option shows the unit and its implied rate */}
        <div className="flex flex-col gap-xs">
          <Label htmlFor="w-price-unit">Price per unit</Label>
          <Select
            value={unitKey}
            onValueChange={(v) => update({ priceUnit: v })}
          >
            <SelectTrigger id="w-price-unit" className="h-11 w-full">
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

        <FieldError message={errors.askingPrice} />
      </div>
    </div>
  );
}
