import { Icon } from "@repo/ui";
import Link from "next/link";
import type { CategoryEntry } from "constants/category-catalog";

interface CategoryIndexProps {
  category: CategoryEntry;
  activeTypeKey?: string;
}

export function CategoryIndex({ category, activeTypeKey }: CategoryIndexProps) {
  return (
    <section
      aria-label="Types within this category"
      className="border-y border-outline-variant bg-surface-container-low/40"
    >
      <div className="mx-auto w-full max-w-container-max px-gutter py-6 md:py-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-label-sm text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            Within this register
          </p>
          {activeTypeKey && (
            <Link
              href={`/category/${category.slug}`}
              scroll={false}
              className="inline-flex items-center gap-1 font-label-sm text-xs font-semibold text-gold-deep hover:underline"
            >
              <span>Show all {category.name.toLowerCase()}</span>
              <Icon name="close" className="text-xs" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-5">
          {category.subTypes.map((t, i) => {
            const isActive = activeTypeKey === t.key;
            const targetHref = isActive
              ? `/category/${category.slug}`
              : `/category/${category.slug}?type=${encodeURIComponent(t.key)}`;

            return (
              <Link
                key={t.key}
                href={targetHref}
                scroll={false}
                className={`group flex items-baseline gap-2.5 rounded-md px-2.5 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  isActive
                    ? "bg-surface border border-gold/40 shadow-xs ring-1 ring-gold/20"
                    : "hover:bg-surface border border-transparent"
                }`}
              >
                <span
                  className={`font-data-table text-xs transition-colors ${
                    isActive ? "font-bold text-gold-deep" : "text-gold-deep"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate font-label-sm text-sm transition-colors ${
                    isActive
                      ? "font-bold text-navy"
                      : "font-medium text-on-surface group-hover:text-navy"
                  }`}
                >
                  {t.label}
                </span>
                <Icon
                  name={isActive ? "check" : "arrow_outward"}
                  aria-hidden
                  className={`shrink-0 text-sm transition-all duration-200 ${
                    isActive
                      ? "text-gold-deep opacity-100 scale-105"
                      : "text-outline opacity-0 group-hover:translate-x-0.5 group-hover:text-gold-deep group-hover:opacity-100"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}