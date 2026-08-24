"use client";

import { Button, Checkbox, Icon, Label, Separator } from "@repo/ui";
import {
  DISTRICT_CATALOG,
  TIER_META,
  TOPOGRAPHY_META,
  type TierKey,
  type TopographyKey,
} from "constants/district-catalog";
import { useMemo } from "react";

const PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
] as const;

export type ProvinceKey = (typeof PROVINCES)[number];

export interface FilterState {
  provinces: Record<ProvinceKey, boolean>;
  topographies: Record<TopographyKey, boolean>;
  tiers: Record<TierKey, boolean>;
}

export const INITIAL_FILTERS: FilterState = {
  provinces: Object.fromEntries(
    PROVINCES.map((p) => [p, false]),
  ) as Record<ProvinceKey, boolean>,
  topographies: { valley: false, terai: false, hill: false, mountain: false },
  tiers: { cadastral: false, field: false, pending: false },
} as const;

/** Province counts derived from the single source of truth. */
export const PROVINCE_COUNTS = Object.fromEntries(
  PROVINCES.map((p) => [
    p,
    DISTRICT_CATALOG.filter((d) => d.province === p).length,
  ]),
) as Record<ProvinceKey, number>;

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}

/**
 * Functional filter panel for the district ledger grid. Every checkbox
 * actually narrows the catalog; Reset restores INITIAL_FILTERS.
 */
export function DistrictFilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const activeFilters = useMemo(
    () =>
      Object.values(filters.provinces).filter(Boolean).length +
      Object.values(filters.topographies).filter(Boolean).length +
      Object.values(filters.tiers).filter(Boolean).length,
    [filters],
  );

  const toggle = <K extends keyof FilterState>(
    group: K,
    key: keyof FilterState[K],
  ) => {
    onChange({
      ...filters,
      [group]: { ...filters[group], [key]: !filters[group][key] },
    });
  };

  const reset = () =>
    onChange({
      provinces: Object.fromEntries(PROVINCES.map((p) => [p, false])),
      topographies: { valley: false, terai: false, hill: false, mountain: false },
      tiers: { cadastral: false, field: false, pending: false },
    } as FilterState);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-label-sm text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface-variant">
          Filters
        </h3>
        {activeFilters > 0 && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-on-primary">
            {activeFilters}
          </span>
        )}
      </div>

      {/* Province */}
      <div className="mb-7">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface">
          Province
        </p>
        <div className="space-y-2.5">
          {PROVINCES.map((p) => (
            <Label
              key={p}
              className="group flex cursor-pointer items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2.5">
                <Checkbox
                  checked={filters.provinces[p]}
                  onCheckedChange={() => toggle("provinces", p)}
                  aria-label={`Filter by ${p} province`}
                  className="h-4 w-4"
                />
                <span className="text-sm text-on-surface-variant transition-colors group-hover:text-on-surface">
                  {p}
                </span>
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {PROVINCE_COUNTS[p]}
              </span>
            </Label>
          ))}
        </div>
      </div>

      <Separator className="mb-7" />

      {/* Topography */}
      <div className="mb-7">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface">
          Topography
        </p>
        <div className="space-y-2.5">
          {(Object.keys(TOPOGRAPHY_META) as TopographyKey[]).map((t) => (
            <Label
              key={t}
              className="group flex cursor-pointer items-center gap-2.5"
            >
              <Checkbox
                checked={filters.topographies[t]}
                onCheckedChange={() => toggle("topographies", t)}
                aria-label={`Filter by ${TOPOGRAPHY_META[t].label}`}
                className="h-4 w-4"
              />
              <Icon
                name={TOPOGRAPHY_META[t].icon}
                className="text-[14px] text-on-surface-variant"
              />
              <span className="text-sm text-on-surface-variant transition-colors group-hover:text-on-surface">
                {TOPOGRAPHY_META[t].label}
              </span>
            </Label>
          ))}
        </div>
      </div>

      <Separator className="mb-7" />

      {/* Verification tier */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface">
          Verification Tier
        </p>
        <div className="space-y-2.5">
          {(Object.keys(TIER_META) as TierKey[]).map((v) => (
            <Label
              key={v}
              className="group flex cursor-pointer items-center gap-2.5"
            >
              <Checkbox
                checked={filters.tiers[v]}
                onCheckedChange={() => toggle("tiers", v)}
                aria-label={`Filter by ${TIER_META[v].label}`}
                className="h-4 w-4"
              />
              <span className="text-sm text-on-surface-variant transition-colors group-hover:text-on-surface">
                {TIER_META[v].label}
              </span>
            </Label>
          ))}
        </div>
      </div>

      {/* Reset */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={reset}
        disabled={activeFilters === 0}
        className="mt-6 w-full text-[11px] font-semibold tracking-[0.5px]"
      >
        Reset Filters
      </Button>
    </div>
  );
}
