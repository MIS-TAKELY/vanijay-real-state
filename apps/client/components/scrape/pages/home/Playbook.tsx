import {
  ArrowLeftRight,
  Braces,
  Check,
  Database,
  Gavel,
  Hash,
  Monitor,
} from "lucide-react";
import { PLAYBOOK_STEPS, STACK_RECOMMENDATIONS } from "./data";
import { SectionHeading } from "./GlobalLandscape";

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  monitor: Monitor,
  swap: ArrowLeftRight,
  code: Braces,
  numbers: Hash,
  database: Database,
  gavel: Gavel,
};

export function Playbook() {
  return (
    <section
      id="playbook"
      className="scroll-mt-24 border-b border-scrape-border py-16 md:py-24"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <SectionHeading
          eyebrow="04 · The Playbook"
          title="A six-step pipeline built for Nepali targets"
          sub="Start with the rendered page, rotate through a clean IP pool, parse versioned selectors, then normalize the quirks before anything hits your database."
        />

        {/* Pipeline steps */}
        <ol className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PLAYBOOK_STEPS.map((step) => {
            const Icon = STEP_ICONS[step.icon] ?? Braces;
            return (
              <li
                key={step.step}
                className="group relative overflow-hidden rounded-xl border border-scrape-border bg-scrape-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-scrape-primary/40 hover:shadow-[0_16px_40px_-16px_rgba(79,140,255,0.3)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-scrape-mono text-3xl font-semibold text-scrape-primary/25 transition-colors group-hover:text-scrape-primary/50">
                    {step.step}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-scrape-border bg-scrape-surface-2 text-scrape-cyan transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-scrape-on-bg">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-scrape-muted">
                  {step.detail}
                </p>
              </li>
            );
          })}
        </ol>

        {/* Stack recommendations */}
        <div className="mt-12 rounded-2xl border border-scrape-border bg-gradient-to-br from-scrape-surface-2 to-scrape-surface p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-headline-md text-xl text-scrape-on-bg">
                Recommended stacks, by target difficulty
              </h3>
              <p className="mt-1 text-sm text-scrape-muted">
                Match the stack to the source — don&apos;t bring an ARES-killer
                to a static-HTML fight.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {STACK_RECOMMENDATIONS.map((rec) => (
              <div
                key={rec.title}
                className="rounded-xl border border-scrape-border bg-[#0b0e13] p-5 transition-colors hover:border-scrape-primary/40"
              >
                <h4 className="text-sm font-semibold text-scrape-on-bg">
                  {rec.title}
                </h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {rec.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-scrape-border bg-scrape-surface-2 px-2.5 py-1 font-scrape-mono text-[11px] text-scrape-cyan"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-scrape-muted">
                  {rec.note}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-scrape-success/25 bg-scrape-success/5 p-4">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-scrape-success" />
            <p className="text-[13px] leading-relaxed text-scrape-on-bg/80">
              <span className="font-semibold text-scrape-success">
                Compliance note:
              </span>{" "}
              scrape public, non-personal data only; respect robots.txt and
              throttling; and keep collected PII out of your pipeline. Nepal&apos;s
              data-protection regime is tightening — treat every field you don&apos;t
              need as a liability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
