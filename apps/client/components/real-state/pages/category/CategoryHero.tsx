import { Icon } from "@repo/ui";
import Link from "next/link";
import type { CategoryEntry } from "constants/category-catalog";

/**
 * Category hero — the "register cover". Left: category identity (gold eyebrow +
 * Fraunces H1 + one-line description + type chips). Right: the signature navy
 * register card with mono data rows and a gold `Verified` seal.
 *
 * Server component: the only data it needs comes from the static catalog.
 */
export function CategoryHero({ category }: { category: CategoryEntry }) {
  return (
    <header className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-container-max px-gutter pb-6 pt-6 md:pb-10 md:pt-10">
        {/* Breadcrumb — mono ledger row */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 font-data-table text-xs text-on-surface-variant"
        >
          <Link
            href="/"
            className="transition-colors hover:text-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            Home
          </Link>
          <span aria-hidden className="text-outline">
            /
          </span>
          <span className="font-medium uppercase tracking-[0.12em] text-gold-deep">
            {category.name}
          </span>
        </nav>

        {/* SEO H1 — visible, keyword-rich, matches the page title */}
        <h1 className="category-hero-title mt-4 font-headline-md text-2xl font-bold tracking-tight text-navy sm:text-3xl md:text-4xl">
          {category.title}
        </h1>

        {/* Description — visible under the H1 for context */}
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
          {category.description}
        </p>
      </div>
    </header>
  );
}