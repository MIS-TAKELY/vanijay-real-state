import { ArrowUpRight, Braces, GitBranch, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <section className="relative overflow-hidden border-b border-scrape-border">
      <div className="scrape-grid-bg absolute inset-0 pointer-events-none" />
      <div
        className="pointer-events-none absolute -top-24 right-0 h-64 w-[36rem] rounded-full bg-scrape-primary/10 blur-[100px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-container-max px-gutter py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 font-scrape-mono text-xs uppercase tracking-[0.25em] text-scrape-primary">
              <Braces className="h-4 w-4" />
              Scrape Console · v0.1
            </p>
            <h1 className="mt-3 font-headline-md text-3xl tracking-tight text-scrape-on-bg md:text-5xl">
              Live scraping dashboard
            </h1>
            <p className="mt-4 text-base leading-relaxed text-scrape-muted">
              The first working source:{" "}
              <span className="font-scrape-mono text-scrape-on-bg">
                Hamrobazaar
              </span>{" "}
              real-estate listings, fetched server-side through their public
              products API, normalized (Devanagari digits, NPR formatting) and
              rendered here in real time.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/scrape"
              className="group inline-flex items-center gap-2 rounded-lg border border-scrape-border bg-scrape-surface px-4 py-2.5 font-scrape-mono text-xs text-scrape-on-bg transition-colors hover:border-scrape-primary/50 hover:text-scrape-primary"
            >
              <GitBranch className="h-4 w-4" />
              Back to the analysis
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <p className="flex items-center gap-1.5 font-scrape-mono text-[11px] text-scrape-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-scrape-success" />
              polite, single-request fetch · no PII stored
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
