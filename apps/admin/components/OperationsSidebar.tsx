"use client";

import {
  Icon,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui";

import { AdminNavList } from "components/AdminNavList";

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
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-foreground/10">
            <Icon
              name="account_balance"
              className="text-[20px] text-sidebar-foreground"
            />
          </span>
          <span className="font-headline-md truncate text-lg font-bold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Lekhaprati
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
