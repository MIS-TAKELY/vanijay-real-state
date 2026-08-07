"use client";

import { cn, Icon } from "@repo/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_SECTIONS } from "constants/operations";

interface AdminNavListProps {
  /** Compact mode collapses padding/spacing for the mobile sheet. */
  compact?: boolean;
}

/**
 * The single source of truth for admin navigation. Rendered once in the
 * desktop sidebar and again inside the mobile drawer, so the two never drift.
 */
export function AdminNavList({ compact = false }: AdminNavListProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      className={cn(
        "flex flex-col gap-md",
        compact ? "px-xs" : "px-2",
      )}
    >
      {ADMIN_NAV_SECTIONS.map((section) => (
        <div key={section.heading}>
          <p
            className={cn(
              "font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-primary/70",
              compact ? "px-xs pb-xs" : "px-sm pb-xs",
            )}
          >
            {section.heading}
          </p>
          <div className={cn("flex flex-col gap-xs", compact && "gap-0.5")}>
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-sm rounded-lg text-sm font-medium transition-colors",
                    compact ? "px-sm py-2" : "px-sm py-2",
                    active
                      ? "bg-primary-container text-on-primary"
                      : "text-on-primary/80 hover:bg-primary-container/60 hover:text-on-primary",
                  )}
                >
                  <Icon
                    name={item.icon}
                    className="text-[19px]"
                    filled={active}
                  />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto mono-stat text-[11px] font-bold leading-tight text-on-primary">
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
  );
}
