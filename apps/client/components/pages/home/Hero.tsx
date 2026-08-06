"use client";

import { Button, Icon, Input, Stat, ToggleGroup, ToggleGroupItem } from "@repo/ui";
import { stats } from "constants/varibles-constants";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
// import { stats } from "constants/varibles-constants";

const propertyTypes = ["Land", "House", "Commercial"] as const;

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBx-ORyBwj6oYzqTpSn7QY5OrynAjIRBEV2P7G2FywW2BzOy8a7IzdlJT29eEjpoupPL1YnAa8yYlQ6BjtpIZMmR2LbRtlUJlyOEYqxzMC-jm-4x1d2P0JvzgnCkJIPIs0oy6wNCB1Z805bMMnonOW_knMwjt1MmUtBwNnz8kTcACoolXkspjN4v_v1oADoElqpg16XpBAyxYdWxzjimrlhFGfvcdVhWYaaVIEDxc3btiLVXxTuFprmfQRQ5F7XttVB37wYmSayQgg";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] =
    useState<(typeof propertyTypes)[number]>("Land");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    params.set("type", activeType.toLowerCase());
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden border-b border-outline-variant">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface-container-low via-surface to-surface" />
      <div className="absolute inset-0 -z-10 topo-bg" />
      <div className="absolute -top-32 -right-24 -z-10 h-[420px] w-[420px] rounded-full bg-primary/5 blur-3xl" />

      <div className="max-w-container-max mx-auto px-gutter w-full py-xl lg:py-[96px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center">
          {/* Left: copy + search */}
          <div className="lg:col-span-7">
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-3 py-1.5 mb-md">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                Nepal&apos;s Verified Land &amp; Property Archive
              </span>
            </div>

            <h1
              className="animate-fade-in-up font-display-lg text-display-lg text-primary leading-[1.08] mb-md"
              style={{ animationDelay: "80ms" }}
            >
              Every plot, verified before it&apos;s listed.
            </h1>

            <p
              className="animate-fade-in-up font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-2xl mb-lg"
              style={{ animationDelay: "160ms" }}
            >
              The archive of record for legitimate land ownership. We
              cross-reference every listing against cadastral surveys and field
              reports to eliminate the risk of legal disputes.
            </p>

            {/* Search Module */}
            <form
              onSubmit={handleSearch}
              aria-label="Search the verified property archive"
              className="animate-fade-in-up bg-surface p-sm border border-outline-variant shadow-xl rounded-2xl max-w-2xl focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-[box-shadow,border-color] duration-200"
              style={{ animationDelay: "240ms" }}
            >
              {/* Property type tabs */}
              <ToggleGroup
                type="single"
                value={activeType}
                onValueChange={(v) => {
                  if (v) setActiveType(v as (typeof propertyTypes)[number]);
                }}
                aria-label="Property type"
                variant="outline"
                className="flex gap-xs p-xs"
              >
                {propertyTypes.map((type) => (
                  <ToggleGroupItem
                    key={type}
                    value={type}
                    aria-label={type}
                    className="flex-1 px-md py-xs font-label-sm text-label-sm rounded-lg data-[state=on]:bg-primary data-[state=on]:text-on-primary data-[state=on]:font-semibold data-[state=on]:shadow-sm data-[state=off]:text-on-surface-variant data-[state=off]:hover:bg-surface-container"
                  >
                    {type}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              {/* Input + button */}
              <div className="flex flex-col sm:flex-row gap-xs items-stretch sm:items-center border-t border-outline-variant pt-sm">
                <div className="flex-1 flex items-center px-sm">
                  <Icon
                    name="search"
                    className="text-outline mr-sm text-[22px]"
                  />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search by district, municipality, or plot ID"
                    className="w-full border-none bg-transparent text-body-md font-body-md py-md text-on-surface placeholder:text-on-surface-variant shadow-none focus-visible:ring-0"
                    placeholder="Search by district, municipality, or plot ID..."
                    type="text"
                  />
                </div>
                <Button type="submit" size="lg" className="sm:ml-sm">
                  <Icon name="search" className="text-body-lg" />
                  Search Archive
                </Button>
              </div>
            </form>

            {/* Trust Strip */}
            <div
              className="animate-fade-in-up mt-lg flex flex-wrap gap-x-lg gap-y-md border-t border-outline-variant pt-lg"
              style={{ animationDelay: "320ms" }}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <Stat value={stat.value} label={stat.label} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: visual */}
          <div
            className="lg:col-span-5 animate-fade-in-up"
            style={{ animationDelay: "280ms" }}
          >
            <div className="relative">
              {/* Main image card */}
              <div className="relative rounded-3xl overflow-hidden border border-outline-variant shadow-2xl aspect-[4/5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Verified mountain-view estate plot in Bhaktapur"
                  className="h-full w-full object-cover"
                  src={heroImage}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Verified stamp */}
                <div className="absolute top-md left-md verification-stamp">
                  Verified
                </div>

                {/* Bottom overlay caption */}
                <div className="absolute bottom-0 left-0 right-0 p-md">
                  <p className="font-label-sm text-[11px] uppercase tracking-widest text-white/70 mb-xs">
                    Bhaktapur &middot; Sector 04
                  </p>
                  <p className="font-headline-md text-white text-lg leading-snug">
                    Mountain View Estate Plot
                  </p>
                  <p className="mono-stat text-white/80 text-sm mt-xs">
                    Plot ID: BK-44102 &middot; 4.5 Aana
                  </p>
                </div>
              </div>

              {/* Floating stat card */}
              <div className="absolute -left-4 sm:-left-8 top-1/3 bg-surface border border-outline-variant rounded-xl shadow-xl p-md w-44 hidden sm:block">
                <div className="flex items-center gap-xs mb-xs">
                  <Icon
                    name="verified"
                    filled
                    className="text-primary text-[20px]"
                  />
                  <span className="font-label-sm text-[11px] uppercase tracking-wider font-bold text-on-surface">
                    Field-Verified
                  </span>
                </div>
                <p className="mono-stat text-2xl text-primary font-bold leading-none">
                  रू 24.5M
                </p>
                <p className="font-label-sm text-[11px] text-on-surface-variant mt-xs">
                  Cadastral cleared today
                </p>
              </div>

              {/* Floating trend badge */}
              <div className="absolute -right-3 sm:-right-6 -bottom-4 bg-primary text-on-primary rounded-xl shadow-xl p-md flex items-center gap-sm hidden sm:flex">
                <Icon name="trending_up" className="text-[24px]" />
                <div className="flex flex-col">
                  <span className="mono-stat text-lg font-bold leading-none">
                    +8.4%
                  </span>
                  <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-primary/80">
                    YoY Kathmandu
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
