"use client";

import { Icon } from "@repo/ui";
import { cn } from "@repo/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV_SECTIONS } from "./constants";

/**
 * Dashboard left sub-nav (DESIGN.md §5).
 *
 * - Desktop: sticky 220px rail, grouped sections, active link highlighted
 *   with `bg-primary/10 text-primary` + filled icon.
 * - Mobile: collapses into a horizontally-scrollable tab strip below the
 *   page header (`md:hidden`).
 */
export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}`);

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden md:flex md:flex-col md:w-[220px] md:shrink-0 md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-6rem)] md:overflow-y-auto no-scrollbar">
        <nav className="flex flex-col gap-md py-md">
          {DASHBOARD_NAV_SECTIONS.map((section) => (
            <div key={section.heading} className="flex flex-col gap-xs">
              <p className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant px-sm">
                {section.heading}
              </p>
              <div className="flex flex-col gap-xs">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-sm rounded-lg px-sm py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                      )}
                    >
                      <Icon
                        name={item.icon}
                        filled={active}
                        className="text-[20px]"
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.badge ? (
                        <span className="mono-stat text-[11px] font-bold rounded-full bg-primary text-on-primary px-1.5 py-0.5 leading-none">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile horizontal tab strip */}
      <nav className="md:hidden -mx-gutter mb-md flex gap-xs overflow-x-auto no-scrollbar border-b border-outline-variant bg-surface px-gutter py-sm">
        {DASHBOARD_NAV_SECTIONS.flatMap((s) => s.items).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface",
              )}
            >
              <Icon name={item.icon} className="text-[16px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
