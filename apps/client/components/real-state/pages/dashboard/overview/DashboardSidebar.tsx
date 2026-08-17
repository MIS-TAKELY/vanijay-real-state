"use client";

import { cn, Icon } from "@repo/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV_SECTIONS } from "../constants";
import { useDashboardStats } from "./useDashboardStats";

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="mono-stat text-[11px] font-bold rounded-full bg-primary text-on-primary px-1.5 py-0.5 leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const stats = useDashboardStats();

  const badgeCount = (key: "activeListings" | "openInquiries" | undefined) => {
    if (!key || !stats) return 0;
    return stats[key];
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}`);

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:w-55 md:shrink-0 md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-6rem)] md:overflow-y-auto no-scrollbar">
        <nav className="flex flex-col gap-md py-md">
          {DASHBOARD_NAV_SECTIONS.map((section) => (
            <div key={section.heading} className="flex flex-col gap-xs">
              <p className="flex items-center gap-2 px-sm font-label-sm text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
                <span className="h-px w-4 bg-gold" aria-hidden />
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
                      <NavBadge count={badgeCount(item.badgeKey)} />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

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
              <Icon name={item.icon} className="text-data-table" />
              {item.label}
              <NavBadge count={badgeCount(item.badgeKey)} />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
