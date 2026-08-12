import {
  ArrowRight,
  ArrowUpRight,
  Globe,
  Terminal,
  Check,
} from "lucide-react";
import { LANDSCAPE_STATS } from "./data";

const TERMINAL_LINES = [
  { prefix: "$", text: "scrape init --country np --sector real-estate" },
  { prefix: "›", text: "discovering sources… hamrobazaar ✓  nepalhomes ✓  gharghaderi ✓", dim: true },
  { prefix: "›", text: "anti-bot profile: custom rate-limit (403 on bursts)", dim: true },
  { prefix: "›", text: "stack → crawlee + playwright + zyte (kathmandu pool)", dim: true },
  { prefix: "›", text: "normalizers → devanagari digits · bikram sambat → ISO", dim: true },
  { prefix: "$", text: "scrape run --schedule daily", ok: true },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-scrape-border">
      {/* Texture + glow */}
      <div className="scrape-grid-bg absolute inset-0 pointer-events-none" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-scrape-primary/15 blur-[120px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-container-max px-gutter py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-scrape-primary/30 bg-scrape-primary/10 px-3.5 py-1.5 font-scrape-mono text-xs text-scrape-primary">
              <Globe className="h-3.5 w-3.5" />
              FIELD ANALYSIS · GLOBAL TO NEPAL
            </span>

            <h1 className="mt-6 font-headline-md text-4xl leading-[1.05] tracking-tight text-scrape-on-bg md:text-6xl">
              The scraping landscape,
              <span className="scrape-glow block bg-gradient-to-r from-scrape-primary via-scrape-cyan to-scrape-accent bg-clip-text text-transparent">
                decoded for Nepal.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-scrape-muted">
              We analysed the world&apos;s most-used scraping platforms — from
              open-source crawlers to AI-native extraction APIs — and mapped
              them against Nepal&apos;s real data sources: real estate portals,
              e-commerce marketplaces and job boards. This is the playbook that
              came out of it.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#nepal"
                className="group inline-flex items-center gap-2 rounded-lg bg-scrape-primary px-5 py-3 text-sm font-semibold text-[#0a0e16] transition-all hover:bg-scrape-cyan hover:shadow-[0_0_28px_rgba(34,211,238,0.35)]"
              >
                Explore Nepal sources
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#landscape"
                className="inline-flex items-center gap-2 rounded-lg border border-scrape-border bg-scrape-surface px-5 py-3 text-sm font-semibold text-scrape-on-bg transition-colors hover:border-scrape-primary/50 hover:text-scrape-primary"
              >
                Global tool comparison
              </a>
            </div>

            {/* Stats */}
            <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-scrape-border bg-scrape-border sm:grid-cols-4">
              {LANDSCAPE_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-scrape-surface px-5 py-4 transition-colors hover:bg-scrape-surface-2"
                >
                  <dt className="font-scrape-mono text-xs text-scrape-muted">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-scrape-mono text-2xl text-scrape-cyan">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Terminal card */}
          <div className="relative">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-scrape-primary/40 via-scrape-border to-scrape-accent/40 opacity-60 blur-sm" />
            <div className="relative overflow-hidden rounded-2xl border border-scrape-border bg-[#0b0e13] shadow-2xl">
              {/* Title bar */}
              <div className="flex items-center justify-between border-b border-scrape-border bg-scrape-surface px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-scrape-danger/80" />
                  <span className="h-3 w-3 rounded-full bg-scrape-warning/80" />
                  <span className="h-3 w-3 rounded-full bg-scrape-success/80" />
                </div>
                <span className="font-scrape-mono text-xs text-scrape-muted">
                  np-scraper — zsh
                </span>
                <Terminal className="h-4 w-4 text-scrape-muted" />
              </div>

              {/* Body */}
              <div className="space-y-2.5 p-5 font-scrape-mono text-[13px] leading-relaxed">
                {TERMINAL_LINES.map((line, i) => (
                  <p key={i} className="flex gap-2">
                    <span
                      className={
                        line.ok
                          ? "text-scrape-success"
                          : "text-scrape-primary"
                      }
                    >
                      {line.prefix}
                    </span>
                    <span
                      className={
                        line.dim
                          ? "text-scrape-muted"
                          : line.ok
                            ? "text-scrape-on-bg"
                            : "text-scrape-on-bg"
                      }
                    >
                      {line.text}
                    </span>
                    {i === TERMINAL_LINES.length - 1 && (
                      <span className="scrape-caret ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-scrape-primary" />
                    )}
                  </p>
                ))}
              </div>

              {/* Output footer */}
              <div className="flex items-center justify-between border-t border-scrape-border bg-scrape-surface px-4 py-3 font-scrape-mono text-xs">
                <span className="flex items-center gap-1.5 text-scrape-success">
                  <Check className="h-3.5 w-3.5" />
                  9 sources · 4 sectors · ready
                </span>
                <span className="text-scrape-muted">~2.1s / run</span>
              </div>
            </div>

            {/* Floating chip */}
            <div className="absolute -right-3 -top-3 hidden rotate-2 rounded-lg border border-scrape-success/40 bg-[#0b0e13] px-3 py-2 font-scrape-mono text-xs text-scrape-success shadow-lg sm:block">
              <span className="flex items-center gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
                difficulty mapped
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
