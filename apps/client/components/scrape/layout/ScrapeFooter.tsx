import { Braces } from "lucide-react";
import Link from "next/link";

const FOOTER_COLS = [
  {
    title: "Analysis",
    links: [
      { label: "Global landscape", href: "/scrape#landscape" },
      { label: "Nepal sources", href: "/scrape#nepal" },
      { label: "Anti-bot stacks", href: "/scrape#challenges" },
      { label: "The playbook", href: "/scrape#playbook" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Dashboard", href: "/scrape/dashboard" },
      { label: "Real estate", href: "/" },
      { label: "About", href: "/about" },
    ],
  },
];

export function ScrapeFooter() {
  return (
    <footer className="border-t border-scrape-border bg-scrape-surface/40">
      <div className="mx-auto max-w-container-max px-gutter py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-scrape-primary/30 bg-scrape-primary/10 text-scrape-primary">
                <Braces className="h-4.5 w-4.5" />
              </span>
              <span className="font-scrape-mono text-sm font-semibold text-scrape-on-bg">
                scrape.intel
              </span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-scrape-muted">
              An independent field analysis of the global web-scraping toolset,
              mapped against Nepal&apos;s real data sources. Updated as platforms
              and anti-bot stacks evolve.
            </p>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h3 className="font-scrape-mono text-xs uppercase tracking-wider text-scrape-primary">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-scrape-muted transition-colors hover:text-scrape-on-bg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-scrape-border pt-6 font-scrape-mono text-xs text-scrape-muted">
          <p>© {new Date().getFullYear()} Lekhaprati · Scrape Intelligence</p>
          <p>
            public data only · respect robots.txt · normalize devanagari ०-९
          </p>
        </div>
      </div>
    </footer>
  );
}
