import {
  Braces,
  Cloud,
  Globe,
  Monitor,
  MousePointerClick,
  Sparkles,
} from "lucide-react";
import { GLOBAL_TOOLS, TOOL_CATEGORIES } from "./data";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Open-Source": Braces,
  "Browser Automation": Monitor,
  "No-Code": MousePointerClick,
  "Scraping API": Cloud,
  "AI-Native": Sparkles,
};

const BARRIER_STYLES: Record<string, string> = {
  Low: "text-scrape-success border-scrape-success/30 bg-scrape-success/10",
  Medium: "text-scrape-warning border-scrape-warning/30 bg-scrape-warning/10",
  High: "text-scrape-danger border-scrape-danger/30 bg-scrape-danger/10",
};

function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-scrape-mono text-xs uppercase tracking-[0.25em] text-scrape-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-headline-md text-3xl tracking-tight text-scrape-on-bg md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-scrape-muted">{sub}</p>
    </div>
  );
}

export function GlobalLandscape() {
  return (
    <section id="landscape" className="scroll-mt-24 border-b border-scrape-border py-16 md:py-24">
      <div className="mx-auto max-w-container-max px-gutter">
        <SectionHeading
          eyebrow="01 · The World"
          title="The global toolset, in five buckets"
          sub="Fifteen platforms profiled across five categories. Each solves a different slice of the pipeline — crawl, render, proxy, extract. Nepal targets rarely need all of them; most need two."
        />

        {/* Category cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TOOL_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] ?? Braces;
            const count = GLOBAL_TOOLS.filter(
              (t) => t.category === cat.id,
            ).length;
            return (
              <div
                key={cat.id}
                className="group relative overflow-hidden rounded-xl border border-scrape-border bg-scrape-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-scrape-primary/40 hover:shadow-[0_12px_40px_-12px_rgba(79,140,255,0.25)]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-scrape-border bg-scrape-surface-2 text-scrape-primary transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-scrape-mono text-xs text-scrape-muted">
                    {count} tools
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-scrape-on-bg">
                  {cat.id}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-scrape-muted">
                  {cat.tagline}
                </p>
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <h3 className="flex items-center gap-2 font-headline-md text-xl text-scrape-on-bg">
              <Globe className="h-5 w-5 text-scrape-primary" />
              Head-to-head comparison
            </h3>
            <p className="hidden font-scrape-mono text-xs text-scrape-muted sm:block">
              sorted by category · 2025–26 pricing
            </p>
          </div>

          <div className="mt-5 overflow-x-auto rounded-xl border border-scrape-border">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-scrape-surface-2 font-scrape-mono text-xs uppercase tracking-wider text-scrape-muted">
                  <th className="px-4 py-3 font-medium">Tool</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Entry price</th>
                  <th className="px-4 py-3 font-medium">Best for</th>
                  <th className="px-4 py-3 font-medium">Skill</th>
                </tr>
              </thead>
              <tbody>
                {GLOBAL_TOOLS.map((tool) => (
                  <tr
                    key={tool.name}
                    className="group border-t border-scrape-border bg-scrape-surface transition-colors hover:bg-scrape-surface-2"
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-scrape-on-bg">{tool.name}</p>
                      <p className="font-scrape-mono text-[11px] text-scrape-muted">
                        {tool.origin}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md border border-scrape-border bg-scrape-surface-2 px-2 py-1 font-scrape-mono text-[11px] text-scrape-cyan">
                        {tool.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-scrape-mono text-xs text-scrape-on-bg">
                      {tool.pricing}
                    </td>
                    <td className="max-w-[260px] px-4 py-3.5">
                      <p className="text-[13px] leading-snug text-scrape-muted">
                        {tool.bestFor}
                      </p>
                      <p className="mt-1 text-xs leading-snug text-scrape-on-bg/70">
                        {tool.note}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 font-scrape-mono text-[11px] ${BARRIER_STYLES[tool.barrier]}`}
                      >
                        {tool.barrier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 font-scrape-mono text-xs text-scrape-muted">
            * Pricing is indicative entry-level (2025–26). Free tiers exist for
            most platforms — ideal for proving a Nepal source before you pay.
          </p>
        </div>
      </div>
    </section>
  );
}

export { SectionHeading };
