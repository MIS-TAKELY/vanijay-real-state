import { Icon } from "@repo/ui";
import Link from "next/link";

/**
 * Branded 404 for the public site (rendered inside the (real-state) layout,
 * so it keeps the Navbar/Footer). Without this, Next.js shows its bare
 * default 404, which looks broken and wastes an indexing signal.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-gutter py-16 text-center">
      <p className="mb-4 font-label-sm text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
        Record Not Found
      </p>
      <h1 className="mb-3 font-display-lg text-4xl font-semibold tracking-tight text-navy md:text-5xl">
        404 — This page isn&apos;t in the archive
      </h1>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-on-surface-variant md:text-base">
        The record you&apos;re looking for may have been moved, unpublished,
        or never existed. Browse the verified archive instead.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-gold px-6 text-sm font-semibold text-on-gold shadow-sm transition-colors hover:bg-gold/90"
        >
          <Icon name="home" className="text-lg" />
          Back to Home
        </Link>
        <Link
          href="/search"
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-outline-variant bg-surface px-6 text-sm font-semibold text-on-surface transition-colors hover:border-gold/60 hover:text-gold"
        >
          <Icon name="search" className="text-lg" />
          Search Listings
        </Link>
      </div>
    </main>
  );
}