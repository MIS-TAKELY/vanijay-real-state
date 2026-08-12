import { ArrowRight, Rocket } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="scrape-grid-bg absolute inset-0 pointer-events-none" />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-scrape-accent/10 blur-[110px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-gutter text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-scrape-accent/30 bg-scrape-accent/10 text-scrape-accent">
          <Rocket className="h-7 w-7" />
        </span>
        <h2 className="mt-6 font-headline-md text-3xl tracking-tight text-scrape-on-bg md:text-5xl">
          Ready to put this analysis
          <span className="block bg-gradient-to-r from-scrape-primary via-scrape-cyan to-scrape-accent bg-clip-text text-transparent">
            to work?
          </span>
        </h2>
        <p className="mx-auto mt-5 text-base leading-relaxed text-scrape-muted">
          The dashboard is where these sources become scheduled, normalized
          datasets. Start with the lowest-friction targets from this page and
          work your way up the difficulty ladder.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/scrape/dashboard"
            className="group inline-flex items-center gap-2 rounded-lg bg-scrape-primary px-6 py-3 text-sm font-semibold text-[#0a0e16] transition-all hover:bg-scrape-cyan hover:shadow-[0_0_28px_rgba(34,211,238,0.35)]"
          >
            Open the dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-scrape-border bg-scrape-surface px-6 py-3 text-sm font-semibold text-scrape-on-bg transition-colors hover:border-scrape-primary/50 hover:text-scrape-primary"
          >
            Back to real estate
          </Link>
        </div>
      </div>
    </section>
  );
}
