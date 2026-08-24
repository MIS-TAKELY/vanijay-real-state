import { Badge, Icon } from "@repo/ui";
import type { DistrictEntry } from "constants/district-catalog";
import { TIER_META } from "constants/district-catalog";

/** Tier → badge styling shared by hub cards and district profile pages. */
export const tierBadgeClass: Record<string, string> = {
  cadastral: "border-primary/30 bg-secondary-container text-primary",
  field: "border-outline-variant bg-surface-container text-on-surface",
  pending: "border-outline-variant bg-surface-container-low text-on-surface-variant",
};

const TOPO_ICON: Record<string, string> = {
  valley: "location_city",
  terai: "landscape",
  hill: "terrain",
  mountain: "filter_hdr",
};

const TOPO_LABEL: Record<string, string> = {
  valley: "Valley (Urban)",
  terai: "Flat (Terai)",
  hill: "Sloped (Hilly)",
  mountain: "Mountain (Himali)",
};

function compactNpr(n: number): string {
  if (n >= 1_000_000) return `Rs ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 100_000) return `Rs ${(n / 100_000).toFixed(1)} Lakh`;
  return `Rs ${new Intl.NumberFormat("en-IN").format(n)}`;
}

interface DistrictCardProps {
  district: DistrictEntry;
  index?: number;
}

/**
 * Shared district ledger card used on the area-guide hub and the sibling
 * sections of district detail pages. Data comes exclusively from
 * DISTRICT_CATALOG so every surface shows identical curated values.
 */
export function DistrictCard({ district, index = 0 }: DistrictCardProps) {
  const tier = TIER_META[district.tier];

  return (
    <a
      href={`/area-guid/${district.slug}`}
      aria-label={`${district.name} district land records — area guide`}
      className="group block h-full rounded-2xl border border-outline-variant bg-surface shadow-xs transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
      style={{
        animation: `fadeIn 0.5s ease-out ${Math.min(index, 11) * 0.06}s both`,
      }}
    >
      {/* Header strip */}
      <div className="relative overflow-hidden rounded-t-2xl border-b border-outline-variant bg-gradient-to-br from-surface-container-high to-surface-container px-5 py-4 transition-transform duration-500">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display-md text-lg font-semibold text-navy group-hover:text-primary">
              {district.name}
            </h3>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.6px] text-on-surface-variant">
              {district.province} Province
            </p>
          </div>
          <Badge
            variant="outline"
            className={`${tierBadgeClass[district.tier]} text-[10px] font-bold uppercase tracking-[0.6px]`}
          >
            {district.tier === "cadastral" && (
              <Icon name="verified" className="text-[12px]" />
            )}
            {tier.shortLabel}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 pt-4">
        <p className="mb-4 line-clamp-2 min-h-[40px] text-sm leading-5 text-on-surface-variant">
          {district.description}
        </p>

        <div className="mb-3 flex items-center gap-1.5 text-[12px] text-on-surface-variant">
          <Icon
            name={TOPO_ICON[district.topography] ?? "terrain"}
            className="text-[14px] text-primary/70"
          />
          {TOPO_LABEL[district.topography] ?? district.topography}
        </div>

        {/* Stats row */}
        <div className="mt-auto flex items-end justify-between border-t border-outline-variant pt-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-on-surface-variant">
              Avg. Base Rate
            </p>
            <p className="mono-stat text-base font-semibold text-on-surface group-hover:text-primary">
              {district.avgRatePerAana != null
                ? `${compactNpr(district.avgRatePerAana)}/Aana`
                : "Awaiting survey"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-on-surface-variant">
              Annual Trend
            </p>
            <p
              className={`flex items-center justify-end gap-1 text-sm font-medium ${
                district.trendPct == null
                  ? "text-on-surface-variant"
                  : district.trendPct > 0
                    ? "text-primary"
                    : "text-error"
              }`}
            >
              {district.trendPct != null && district.trendPct > 0 && (
                <Icon name="trending_up" className="text-[14px]" />
              )}
              {district.trendPct != null && district.trendPct <= 0 && (
                <Icon name="trending_down" className="text-[14px]" />
              )}
              {district.trendPct == null
                ? "Stable"
                : `${district.trendPct > 0 ? "+" : ""}${district.trendPct}% YOY`}
            </p>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="border-t border-outline-variant">
        <div className="flex items-center justify-between px-5 py-2.5">
          <span className="text-[11px] text-on-surface-variant">
            LKP/{district.slug.toUpperCase()}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold tracking-[0.4px] text-primary transition-transform duration-200 group-hover:translate-x-1">
            View Details
            <Icon name="arrow_forward" className="text-[14px]" />
          </span>
        </div>
      </div>
    </a>
  );
}
