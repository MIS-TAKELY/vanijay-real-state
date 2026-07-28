"use client";

import { DISTRICTS } from "constants/varibles-constants";
import { useState } from "react";
import { Icon } from "@repo/ui";

const PROVINCES = [
  { key: "bagmati" as const, label: "Bagmati", count: 13 },
  { key: "gandaki" as const, label: "Gandaki", count: 6 },
  { key: "lumbini" as const, label: "Lumbini", count: 12 },
];

const TOPOGRAPHIES = [
  { key: "flat" as const, label: "Flat (Terai)", icon: "landscape" },
  { key: "sloped" as const, label: "Sloped (Hilly)", icon: "terrain" },
  { key: "terraced" as const, label: "Terraced", icon: "layers" },
];

const VERIFICATION_TIERS = [
  { key: "cadastral" as const, label: "Cadastral Cleared (A)" },
  { key: "field" as const, label: "Field Verified (B)" },
];

type ProvinceKey = (typeof PROVINCES)[number]["key"];
type TopoKey = (typeof TOPOGRAPHIES)[number]["key"];
type TierKey = (typeof VERIFICATION_TIERS)[number]["key"];

export function DistrictLedgers() {
  const [provinces, setProvinces] = useState<Record<ProvinceKey, boolean>>({
    bagmati: true,
    gandaki: false,
    lumbini: false,
  });
  const [topo, setTopo] = useState<Record<TopoKey, boolean>>({
    flat: false,
    sloped: true,
    terraced: false,
  });
  const [tier, setTier] = useState<Record<TierKey, boolean>>({
    cadastral: true,
    field: false,
  });

  const activeFilters =
    Object.values(provinces).filter(Boolean).length +
    Object.values(topo).filter(Boolean).length +
    Object.values(tier).filter(Boolean).length;

  return (
    <section className="bg-surface-container-low border-b border-outline-variant">
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        <div className="flex gap-10">
          {/* Sidebar Filters */}
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-24">
              {/* Active filter count */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-label-sm text-[11px] text-outline uppercase tracking-[0.8px] font-bold">
                  Filters
                </h3>
                {activeFilters > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {activeFilters}
                  </span>
                )}
              </div>

              {/* Province */}
              <div className="mb-7">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface">
                  Province
                </p>
                <div className="space-y-2">
                  {PROVINCES.map((p) => (
                    <label
                      key={p.key}
                      className="flex cursor-pointer items-center justify-between group"
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={provinces[p.key]}
                          onChange={() =>
                            setProvinces((s) => ({
                              ...s,
                              [p.key]: !s[p.key],
                            }))
                          }
                          className="h-3.5 w-3.5 accent-primary rounded"
                        />
                        <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                          {p.label}
                        </span>
                      </span>
                      <span className="text-[11px] text-outline">{p.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-outline-variant pt-5 mb-7">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface">
                  Topography
                </p>
                <div className="space-y-2">
                  {TOPOGRAPHIES.map((t) => (
                    <label
                      key={t.key}
                      className="flex cursor-pointer items-center gap-2.5 group"
                    >
                      <input
                        type="checkbox"
                        checked={topo[t.key]}
                        onChange={() =>
                          setTopo((s) => ({
                            ...s,
                            [t.key]: !s[t.key],
                          }))
                        }
                        className="h-3.5 w-3.5 accent-primary rounded"
                      />
                      <Icon name={t.icon} className="text-[14px] text-outline" />
                      <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                        {t.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-outline-variant pt-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface">
                  Verification Tier
                </p>
                <div className="space-y-2">
                  {VERIFICATION_TIERS.map((v) => (
                    <label
                      key={v.key}
                      className="flex cursor-pointer items-center gap-2.5 group"
                    >
                      <input
                        type="checkbox"
                        checked={tier[v.key]}
                        onChange={() =>
                          setTier((s) => ({
                            ...s,
                            [v.key]: !s[v.key],
                          }))
                        }
                        className="h-3.5 w-3.5 accent-primary rounded"
                      />
                      <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                        {v.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <button
                type="button"
                className="mt-6 w-full border border-outline-variant py-2 text-[11px] font-semibold tracking-[0.5px] text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  District Ledgers
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Showing <span className="font-semibold text-on-surface">1–4</span> of{" "}
                  <span className="font-semibold text-on-surface">74</span> records
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="hidden sm:flex items-center gap-1.5 border border-outline-variant px-3 py-2 text-[11px] font-semibold tracking-[0.4px] text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer"
                >
                  <Icon name="sort" className="text-[14px]" />
                  Sort
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 border border-outline-variant px-3 py-2 text-[11px] font-semibold tracking-[0.4px] text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer lg:hidden"
                >
                  <Icon name="filter_list" className="text-[14px]" />
                  Filters
                </button>
              </div>
            </div>

            {/* District Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {DISTRICTS.map((d, i) => (
                <article
                  key={d.name}
                  className="group bg-surface border border-outline-variant hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                  style={{
                    animation: `fadeIn 0.5s ease-out ${i * 0.1}s both`,
                  }}
                >
                  {/* Map header */}
                  <div className="relative h-36 overflow-hidden">
                    <div
                      className={`h-full w-full bg-gradient-to-br ${d.map} transition-transform duration-500 group-hover:scale-105`}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

                    {/* Badge */}
                    <span
                      className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.8px] ${d.badgeColor} shadow-sm`}
                    >
                      {d.badge === "Cadastral Cleared" && (
                        <Icon
                          name="verified"
                          className="text-[10px]"
                        />
                      )}
                      {d.badge}
                    </span>

                    {/* District name overlay on mobile */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3 sm:hidden">
                      <h3 className="text-white font-semibold text-sm">
                        {d.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="hidden sm:flex items-center justify-between mb-2">
                      <h3
                        className="text-lg font-medium text-on-surface group-hover:text-primary transition-colors"
                        style={{
                          fontFamily: "'Fraunces', Georgia, serif",
                        }}
                      >
                        {d.name}
                      </h3>
                    </div>

                    <p className="text-sm leading-5 text-on-surface-variant mb-4 line-clamp-2">
                      {d.desc}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-end justify-between border-t border-outline-variant pt-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-outline">
                          Avg. Base Rate
                        </p>
                        <p className="mono-stat text-base font-semibold text-on-surface group-hover:text-primary transition-colors">
                          {d.rate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-outline">
                          Annual Trend
                        </p>
                        <p
                          className={`text-sm font-medium flex items-center gap-1 ${
                            d.trendUp === true
                              ? "text-primary"
                              : d.trendUp === false
                                ? "text-error"
                                : "text-outline"
                          }`}
                        >
                          {d.trendUp === true && (
                            <Icon name="trending_up" className="text-[14px]" />
                          )}
                          {d.trendUp === false && (
                            <Icon name="trending_down" className="text-[14px]" />
                          )}
                          {d.trend}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hover action footer */}
                  <div className="border-t border-outline-variant/0 group-hover:border-outline-variant transition-colors">
                    <div className="px-5 py-0 group-hover:py-2.5 overflow-hidden transition-all duration-300">
                      <span className="text-[11px] text-primary font-semibold tracking-[0.4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                        View District Details
                        <Icon name="arrow_forward" className="text-[14px]" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-10 flex flex-col items-center gap-3">
              <button
                type="button"
                className="group relative inline-flex items-center gap-2 border-2 border-outline-variant px-8 py-3 text-[13px] font-semibold tracking-[0.5px] text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
              >
                Load More Records
                <Icon
                  name="expand_more"
                  className="text-[18px] group-hover:translate-y-0.5 transition-transform"
                />
              </button>
              <p className="text-[11px] text-outline">
                Showing 4 of 74 indexed districts
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
