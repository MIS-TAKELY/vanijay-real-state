"use client";

import {
  Icon,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui";
import Image from "next/image";

import { AdminNavList } from "components/AdminNavList";
import logo from "../public/logo.webp";
import logoText from "../public/logo-text.webp";

/**
 * Desktop + mobile operations sidebar (shadcn Sidebar, icon-collapsible).
 *
 * Distinctive choice for the archive's back-office: the navigation rail uses
 * the brand's deep forest `--primary` (#244530) — echoing the green-tiled walls
 * of a land-revenue registry office — instead of the generic dark-mode panel.
 */
export function OperationsSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-12 items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          {/* Roundel + wordmark sit on white chips so they stay legible on
              the green sidebar rail. */}
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white p-0.5 shadow-sm ring-1 ring-gold/40">
            <Image
              src={logo}
              alt="MALPOTH"
              width={32}
              height={32}
              className="size-full rounded-full object-contain"
            />
          </span>
          <span className="flex h-7 shrink-0 items-center rounded-md bg-white px-2 shadow-sm group-data-[collapsible=icon]:hidden">
            <Image
              src={logoText}
              alt="MALPOTH"
              width={92}
              height={22}
              className="h-[18px] w-auto object-contain"
            />
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="no-scrollbar gap-0 py-2">
        <AdminNavList />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-sidebar-foreground/80 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Icon name="manage_accounts" className="shrink-0 text-[19px]" />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            Archive Staff
          </span>
          <span className="ml-auto mono-stat truncate text-[11px] font-medium text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
            verifiers@lekhaprati
          </span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
