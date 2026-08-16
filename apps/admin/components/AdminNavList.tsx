"use client";

import {
  Icon,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_SECTIONS } from "constants/operations";

/**
 * The single source of truth for admin navigation. Rendered once in the
 * desktop sidebar (and its mobile sheet), so the two never drift.
 */
export function AdminNavList() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {ADMIN_NAV_SECTIONS.map((section) => (
        <SidebarGroup key={section.heading}>
          <SidebarGroupLabel className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-sidebar-foreground/70">
            {section.heading}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground"
                    >
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (isMobile) setOpenMobile(false);
                        }}
                      >
                        <Icon
                          name={item.icon}
                          className="text-[19px]"
                          filled={active}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge className="mono-stat text-[11px] font-bold text-sidebar-foreground">
                        {item.badge}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
