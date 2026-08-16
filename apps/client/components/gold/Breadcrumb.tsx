"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol
        className="flex flex-wrap items-center gap-1 text-xs text-white/40"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight
                className="h-3 w-3 text-white/20"
                aria-hidden="true"
              />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-white/70 focus:outline-none focus-visible:text-[#C9A84C]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-white/60" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
