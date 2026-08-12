"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Building2,
  Search,
  Store,
  Layers,
} from "lucide-react";
import { NEPAL_SECTORS, NEPAL_SOURCES, type NepalSector } from "./data";
import { SectionHeading } from "./GlobalLandscape";

const SECTOR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  All: Layers,
  "Real Estate": Building2,
  "E-Commerce": Store,
  Jobs: Search,
};

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Trivial",
  2: "Easy",
  3: "Moderate",
  4: "Hard",
  5: "Fortified",
};

const DIFFICULTY_COLOR: Record<number, string> = {
  1: "bg-scrape-success",
  2: "bg-scrape-success/70",
  3: "bg-scrape-warning",
  4: "bg-scrape-danger/80",
  5: "bg-scrape-danger",
};

export function NepalFocus() {
  const [active, setActive] = useState<NepalSector | "All">("All");

  const visible =
    active === "All"
      ? NEPAL_SOURCES
      : NEPAL_SOURCES.filter((s) => s.sector === active);

  return (
    <section
      id="nepal"
      className="relative scroll-mt-24 overflow-hidden border-b border-scrape-border py-16 md:py-24"
    >
      <div
        className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-scrape-primary/10 blur-[100px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-container-max px-gutter">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="02 · Nepal"
            title="Nine sources, four sectors, mapped"
            sub="Nepal's digital data is concentrated in three sectors — real estate, e-commerce and jobs. Each source below is profiled with its difficulty rating, anti-bot stack and the fields worth extracting."
          />

          {/* Sector filter */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter Nepal sources by sector"
          >
            {NEPAL_SECTORS.map((sector) => {
              const Icon = SECTOR_ICONS[sector.id] ?? Layers;
              const selected = active === sector.id;
              return (
                <button
                  key={sector.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActive(sector.id)}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    selected
                      ? "border-scrape-primary bg-white text-[#0a0e16] shadow-[0_0_20px_rgba(79,140,255,0.3)]"
                      : "border-scrape-border bg-scrape-surface text-scrape-muted hover:border-scrape-primary/40 hover:text-scrape-on-bg"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {sector.id === "All" ? "All sources" : sector.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Source cards */}
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((source) => (
            <article
              key={source.name}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-scrape-border bg-scrape-surface transition-all duration-300 hover:-translate-y-1 hover:border-scrape-primary/40 hover:shadow-[0_16px_48px_-16px_rgba(79,140,255,0.3)]"
            >
              {/* Top accent */}
              <div className="h-1 w-full bg-gradient-to-r from-scrape-primary/0 via-scrape-primary/70 to-scrape-primary/0 opacity-60 transition-opacity group-hover:opacity-100" />

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-scrape-on-bg">
                      {source.name}
                    </h3>
                    <p className="font-scrape-mono text-xs text-scrape-primary">
                      {source.domain}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-md border border-scrape-border bg-scrape-surface-2 px-2 py-1 font-scrape-mono text-[11px] text-scrape-cyan">
                    {source.sector}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-scrape-muted">
                  {source.value}
                </p>

                {/* Targets */}
                <ul className="mt-4 space-y-1.5">
                  {source.targets.map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-2 text-[13px] text-scrape-on-bg/75"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-scrape-primary" />
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-5">
                  {/* Difficulty meter */}
                  <div className="flex items-center justify-between">
                    <span className="font-scrape-mono text-[11px] uppercase tracking-wider text-scrape-muted">
                      Difficulty
                    </span>
                    <span
                      className={`font-scrape-mono text-xs ${
                        source.difficulty >= 4
                          ? "text-scrape-danger"
                          : source.difficulty === 3
                            ? "text-scrape-warning"
                            : "text-scrape-success"
                      }`}
                    >
                      {DIFFICULTY_LABEL[source.difficulty]}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1.5" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < source.difficulty
                            ? DIFFICULTY_COLOR[source.difficulty]
                            : "bg-scrape-border"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="mt-3 flex items-start gap-1.5 font-scrape-mono text-[11px] leading-snug text-scrape-muted">
                    <ArrowUpRight className="mt-0.5 h-3 w-3 shrink-0 text-scrape-warning" />
                    {source.antiBot}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 font-scrape-mono text-xs text-scrape-muted">
          Difficulty = observed friction for a polite, single-region crawler
          (2025–26). Fortified targets need browser-grade fingerprints — the
          playbook below covers that.
        </p>
      </div>
    </section>
  );
}
