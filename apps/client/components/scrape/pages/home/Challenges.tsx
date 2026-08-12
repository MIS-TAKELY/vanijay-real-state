import {
  CalendarClock,
  Fingerprint,
  Hash,
  Languages,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import { ANTI_BOT_STACKS, LOCALIZATION_QUIRKS } from "./data";
import { SectionHeading } from "./GlobalLandscape";

const STACK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: ShieldAlert,
  cloud: Fingerprint,
  zap: ShieldAlert,
  speed: Fingerprint,
};

const QUIRK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  numbers: Hash,
  calendar: CalendarClock,
  translate: Languages,
  phone: Smartphone,
};

export function Challenges() {
  return (
    <section
      id="challenges"
      className="scroll-mt-24 border-b border-scrape-border py-16 md:py-24"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <SectionHeading
          eyebrow="03 · The Friction"
          title="What actually blocks scrapers in Nepal"
          sub="Nepali targets sit on the full spectrum of bot mitigation — from minimal protection on legacy portals to enterprise-grade fingerprinting on Daraz. Plus four localization traps that break parsers regardless of the anti-bot layer."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {/* Anti-bot stacks */}
          <div>
            <h3 className="font-scrape-mono text-sm uppercase tracking-wider text-scrape-muted">
              Anti-bot stacks · decoded
            </h3>
            <div className="mt-5 space-y-3">
              {ANTI_BOT_STACKS.map((item) => {
                const Icon = STACK_ICONS[item.icon] ?? ShieldAlert;
                return (
                  <div
                    key={item.stack}
                    className="group flex gap-4 rounded-xl border border-scrape-border bg-scrape-surface p-5 transition-all duration-300 hover:border-scrape-primary/40 hover:bg-scrape-surface-2"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-scrape-border bg-scrape-surface-2 transition-transform duration-300 group-hover:scale-110 ${item.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-scrape-on-bg">
                          {item.stack}
                        </h4>
                        <span
                          className={`rounded-md border border-scrape-border px-2 py-0.5 font-scrape-mono text-[11px] ${item.color}`}
                        >
                          {item.target}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-scrape-muted">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Localization quirks */}
          <div>
            <h3 className="font-scrape-mono text-sm uppercase tracking-wider text-scrape-muted">
              Localization traps · data-layer
            </h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {LOCALIZATION_QUIRKS.map((q) => {
                const Icon = QUIRK_ICONS[q.icon] ?? Languages;
                return (
                  <div
                    key={q.title}
                    className="group rounded-xl border border-scrape-border bg-scrape-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-scrape-accent/40"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-scrape-border bg-scrape-surface-2 text-scrape-accent transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <h4 className="mt-3 text-sm font-semibold text-scrape-on-bg">
                      {q.title}
                    </h4>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-scrape-muted">
                      {q.detail}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl border border-scrape-warning/25 bg-scrape-warning/5 p-4">
              <p className="font-scrape-mono text-xs leading-relaxed text-scrape-warning">
                Rule of thumb: if a price series silently flips between ५ and 5,
                your dataset is wrong before any block ever fires. Normalize at
                the edge, not at reporting time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
