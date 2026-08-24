"use client";

import { Button, Icon, Stat } from "@repo/ui";
import {
  DISTRICT_CATALOG,
  TIER_META,
} from "constants/district-catalog";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Combobox,
  type ComboboxOption,
} from "@repo/ui";

const CATEGORIES = [
  { label: "Land", icon: "terrain" },
  { label: "House", icon: "home" },
  { label: "Commercial", icon: "storefront" },
  { label: "NRN Investment Zones", icon: "flight" },
  { label: "Agricultural", icon: "agriculture" },
  { label: "Residential Dev.", icon: "apartment" },
];

/** Hero stats derived from the real district catalog. */
const PROVINCE_COUNT = new Set(DISTRICT_CATALOG.map((d) => d.province)).size;
const CADASTRAL_COUNT = DISTRICT_CATALOG.filter(
  (d) => d.tier === "cadastral",
).length;

const STATS = [
  { value: String(PROVINCE_COUNT), label: `Provinces · ${DISTRICT_CATALOG.length} Districts Indexed` },
  { value: `${CADASTRAL_COUNT}`, label: "Cadastral-Cleared Districts" },
  { value: "0%", label: "Title Discrepancy" },
  { value: "100%", label: "Field-Verified" },
];

export function Hero() {
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const districtOptions = useMemo<ComboboxOption[]>(
    () =>
      DISTRICT_CATALOG.map((d) => ({
        value: d.slug,
        label: `${d.name} — ${d.province}`,
      })),
    [],
  );

  const goToDistrict = (slug: string) => {
    if (slug) router.push(`/area-guid/${slug}`);
  };

  return (
    <section className="relative flex min-h-[620px] flex-col justify-center overflow-hidden border-b border-outline-variant bg-surface">
      {/* Subtle topographic pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #103050 1px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
        aria-hidden
      />

      {/* Decorative blur orbs */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-secondary-container/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-container-max px-gutter py-xl">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_360px]">
          {/* Left: Hero Content */}
          <div className="animate-[fadeIn_0.6s_ease-out]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant bg-white/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Area Guide
            </div>

            <h1 className="font-display-lg mb-4 text-display-lg leading-[1.08] font-semibold tracking-[-1.12px] text-on-surface md:text-[56px]">
              Explore {DISTRICT_CATALOG.length} Districts.
              <br />
              <span className="text-primary">Every Plot Verified.</span>
            </h1>

            <p className="font-body-lg mb-8 max-w-[520px] text-body-lg leading-relaxed text-on-surface-variant">
              A disciplined, archival view of Nepal&apos;s real estate.
              Cadastral-cleared records and structured data for secure long-term
              investments across all seven provinces.
            </p>

            {/* Search Module */}
            <div
              aria-label="Search district records"
              className="max-w-[560px] overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-lg transition-[box-shadow,border-color] duration-200 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/30"
            >
              <div className="flex items-center gap-2 p-2">
                <Icon
                  name="search"
                  className="text-body-lg shrink-0 pl-2 text-on-surface-variant"
                />
                <Combobox
                  aria-label="Search by district"
                  options={districtOptions}
                  value={selectedDistrict}
                  onValueChange={(slug) => {
                    setSelectedDistrict(slug);
                    goToDistrict(slug);
                  }}
                  placeholder={`Search ${DISTRICT_CATALOG.length} districts…`}
                  searchPlaceholder="Type a district or province…"
                  emptyLabel="No matching district."
                  triggerClassName="w-full border-none bg-transparent py-3 shadow-none focus-visible:ring-0 text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant"
                  contentClassName="max-h-72"
                />
                <Button
                  type="button"
                  className="h-auto cursor-pointer rounded-xl bg-primary px-5 py-3 text-label-sm font-semibold tracking-[0.4px] text-secondary-container hover:bg-primary/90"
                  onClick={() => goToDistrict(selectedDistrict)}
                >
                  Search Records
                </Button>
              </div>
            </div>

            {/* Category chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <a
                  key={cat.label}
                  href={`/search?category=${encodeURIComponent(cat.label.toLowerCase())}`}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    cat.label === "NRN Investment Zones"
                      ? "border-primary/30 bg-secondary-container text-primary"
                      : "border-outline-variant bg-white text-on-surface-variant hover:border-primary hover:bg-secondary-container/50 hover:text-primary"
                  }`}
                >
                  <Icon name={cat.icon} className="text-[14px]" />
                  {cat.label}
                </a>
              ))}
            </div>

            {/* Verification tier legend */}
            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-on-surface-variant">
              {(Object.keys(TIER_META) as Array<keyof typeof TIER_META>).map(
                (k) => (
                  <span key={k} className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    {TIER_META[k].shortLabel}
                  </span>
                ),
              )}
            </p>
          </div>

          {/* Right: Stats Card */}
          <div className="animate-[fadeIn_0.8s_ease-out]">
            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-md transition-shadow hover:shadow-lg">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`p-5 transition-colors hover:bg-surface-container-low ${
                    i < 2 ? "border-b border-outline-variant" : ""
                  } ${i % 2 === 0 ? "border-r border-outline-variant" : ""}`}
                >
                  <Stat value={stat.value} label={stat.label} />
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.6px] text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                Updated Daily from Cadastral Records
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
