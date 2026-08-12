import { Activity, Braces } from "lucide-react";
import Link from "next/link";

const SECTION_LINKS = [
  { label: "Landscape", href: "/scrape#landscape" },
  { label: "Nepal", href: "/scrape#nepal" },
  { label: "Challenges", href: "/scrape#challenges" },
  { label: "Playbook", href: "/scrape#playbook" },
];

export function ScrapeNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-scrape-border bg-scrape-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-container-max items-center justify-between gap-4 px-gutter py-4">
        <Link href="/scrape" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-scrape-primary/30 bg-scrape-primary/10 text-scrape-primary transition-transform group-hover:scale-105">
            <Braces className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-scrape-mono text-sm font-semibold text-scrape-on-bg">
              scrape.intel
            </span>
            <span className="font-scrape-mono text-[10px] text-scrape-muted">
              global → nepal
            </span>
          </span>
        </Link>

        {/* Desktop section links */}
        <div className="hidden items-center gap-1 md:flex">
          {SECTION_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 font-scrape-mono text-xs text-scrape-muted transition-colors hover:bg-scrape-surface hover:text-scrape-primary"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/scrape/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-scrape-border bg-scrape-surface px-3.5 py-2 font-scrape-mono text-xs font-medium text-scrape-on-bg transition-colors hover:border-scrape-primary/50 hover:text-scrape-primary"
          >
            <Activity className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg bg-scrape-primary px-3.5 py-2 font-scrape-mono text-xs font-semibold text-[#0a0e16] transition-colors hover:bg-scrape-cyan"
          >
            Real Estate
          </Link>
        </div>
      </div>
    </nav>
  );
}
