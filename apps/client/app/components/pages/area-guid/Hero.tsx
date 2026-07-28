"use client";

import React, { useState } from "react";
import { Icon, Stat } from "@repo/ui";

const CATEGORIES = [
  { label: "Land", icon: "terrain" },
  { label: "House", icon: "home" },
  { label: "Commercial", icon: "storefront" },
  { label: "NRN Investment Zones", icon: "flight" },
  { label: "Agricultural", icon: "agriculture" },
  { label: "Residential Dev.", icon: "apartment" },
];

const STATS = [
  { value: "74", label: "Districts Indexed" },
  { value: "12,482+", label: "Verified Listings" },
  { value: "0%", label: "Title Discrepancy" },
  { value: "100%", label: "Field-Verified" },
];

const PROPERTY_TYPES = ["Land", "House", "Commercial"];

export function Hero() {
  const [activeType, setActiveType] = useState("Land");

  return (
    <section className="relative min-h-[620px] flex flex-col justify-center overflow-hidden border-b border-outline-variant bg-surface">
      {/* Subtle topographic pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #244530 1px, transparent 0)",
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
            {/* Section badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant bg-white/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Area Guide
            </div>

            <h1 className="font-display-lg text-[48px] md:text-[56px] font-semibold tracking-[-1.12px] text-on-surface leading-[1.08] mb-4">
              Explore 74 Districts.
              <br />
              <span className="text-primary">Every Plot Verified.</span>
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-[520px] mb-8">
              A disciplined, archival view of Nepal&apos;s real estate.
              Cadastral-cleared records and structured data for secure long-term
              investments.
            </p>

            {/* Search Module */}
            <div className="bg-surface border border-outline-variant shadow-lg max-w-[560px] focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <div className="flex flex-col md:flex-row">
                <div className="flex bg-surface-container p-[3px] gap-[2px]">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActiveType(type)}
                      className={`px-4 py-2.5 text-[12px] font-semibold tracking-[0.3px] transition-all cursor-pointer ${
                        type === activeType
                          ? "bg-primary text-white shadow-sm"
                          : "text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="flex flex-1 items-center gap-2 border-t md:border-t-0 md:border-l border-outline-variant px-4">
                  <Icon
                    name="search"
                    className="text-outline shrink-0 text-[18px]"
                  />
                  <input
                    type="text"
                    placeholder="Search by district, municipality, or plot ID..."
                    className="w-full py-3 bg-transparent text-body-md font-body-md text-on-surface outline-none placeholder:text-outline"
                  />
                </div>
                <button
                  type="button"
                  className="bg-primary text-white px-6 py-3 text-[13px] font-semibold tracking-[0.4px] hover:bg-primary/90 transition-colors cursor-pointer md:w-auto w-full"
                >
                  Search Records
                </button>
              </div>
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2 mt-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    cat.label === "NRN Investment Zones"
                      ? "border-primary/30 bg-secondary-container text-primary"
                      : "border-outline-variant bg-white text-on-surface-variant hover:border-primary hover:text-primary hover:bg-secondary-container/50"
                  }`}
                >
                  <Icon
                    name={cat.icon}
                    className="text-[14px]"
                  />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Stats Card */}
          <div className="animate-[fadeIn_0.8s_ease-out]">
            <div className="grid grid-cols-2 border border-outline-variant bg-white shadow-md hover:shadow-lg transition-shadow">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`p-5 ${
                    i < 2 ? "border-b border-outline-variant" : ""
                  } ${i % 2 === 0 ? "border-r border-outline-variant" : ""} hover:bg-surface-container-low transition-colors`}
                >
                  <Stat value={stat.value} label={stat.label} />
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-outline uppercase tracking-[0.6px] text-center font-semibold">
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
