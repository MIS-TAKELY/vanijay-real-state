import { Button, Icon } from "@repo/ui";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative border-b border-outline-variant bg-surface">
      {/* Clipping wrapper for decorative elements only */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        {/* Subtle topographic pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #244530 1px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        />
        {/* Decorative blur orbs */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-secondary-container/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-container-max px-gutter py-xl lg:py-[96px]">
        <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Left: Hero content */}
          <div className="animate-fade-in-up">
            {/* Eyebrow badge */}
            <div className="mb-md inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Official Archive Services
            </div>

            {/* H1 — single, keyword-targeted */}
            <h1
              className="mb-md max-w-[720px] font-display-lg text-[42px] md:text-[52px] font-semibold leading-[1.1] tracking-[-0.8px] text-primary"
              style={{ fontVariationSettings: "'opsz' 48" }}
            >
              NRN Concierge — Buy Land in Nepal From Anywhere
            </h1>

            <p className="max-w-[640px] font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-lg">
              Facilitating secure, remote land acquisition for Non-Resident
              Nepalis (NRN). Our specialized desk manages cross-border
              legalities between{" "}
              <strong className="font-semibold text-on-surface">
                NCRA (Non-Resident Citizens)
              </strong>{" "}
              and{" "}
              <strong className="font-semibold text-on-surface">
                FCNO (Foreign Citizens of Nepali Origin)
              </strong>{" "}
              frameworks — so you can invest in Nepal without leaving your
              country of residence.
            </p>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center gap-md mb-lg">
              <span className="inline-flex items-center gap-xs text-sm font-medium text-on-surface">
                <Icon
                  name="verified"
                  filled
                  className="text-primary text-body-lg"
                />
                Field-Verified Plots
              </span>
              <span className="inline-flex items-center gap-xs text-sm font-medium text-on-surface">
                <Icon
                  name="gavel"
                  filled
                  className="text-primary text-body-lg"
                />
                Embassy POA Support
              </span>
              <span className="inline-flex items-center gap-xs text-sm font-medium text-on-surface">
                <Icon
                  name="security"
                  filled
                  className="text-primary text-body-lg"
                />
                Secure Escrow
              </span>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-md">
              <Button asChild size="lg">
                <Link href="#eligibility">
                  Check Your Eligibility
                  <Icon name="arrow_forward" className="text-body-lg" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#process">See How It Works</Link>
              </Button>
            </div>
          </div>

          {/* Right: Quick stat card — sticky within its grid cell */}
          <div className="lg:h-full">
            <aside
              className="animate-fade-in-up rounded-2xl border border-outline-variant bg-surface p-lg shadow-md lg:sticky lg:top-44"
              style={{ animationDelay: "120ms" }}
            >
              <p className="font-label-sm text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface-variant mb-md">
                The NRN Advantage
              </p>
              <ul className="space-y-sm">
                {[
                  { icon: "flight", text: "No travel to Nepal required" },
                  {
                    icon: "description",
                    text: "Full Lalpurja (title deed) audit",
                  },
                  { icon: "videocam", text: "Live video plot walkthroughs" },
                  {
                    icon: "account_balance",
                    text: "Escrow-protected settlement",
                  },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex items-center gap-sm text-sm text-on-surface"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon name={item.icon} filled className="text-body-lg" />
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
              <div className="mt-md border-t border-outline-variant pt-md">
                <p className="mono-stat text-[11px] uppercase tracking-widest text-on-surface-variant">
                  Desk Ref: NRN-2024-EL
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
