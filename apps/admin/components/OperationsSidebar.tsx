import { Icon } from "@repo/ui";
import Link from "next/link";

import { AdminNavList } from "components/AdminNavList";

/**
 * Desktop-only operations sidebar.
 *
 * Distinctive choice for the archive's back-office: the navigation rail uses
 * the brand's deep forest `--primary` (#244530) — echoing the green-tiled walls
 * of a land-revenue registry office — instead of the generic dark-mode panel.
 * Green is the brand's "verified / action" color, so the whole shell reads as
 * a workspace for verification first, navigation second.
 */
export function OperationsSidebar() {
  return (
    <aside className="hidden w-[--sidebar-w] shrink-0 flex-col gap-lg bg-primary text-on-primary md:flex">
      {/* Brand rail */}
      <div className="flex h-16 items-center gap-3 border-b border-primary-container px-md">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-on-primary/10">
          <Icon
            name="account_balance"
            className="text-[20px] text-on-primary"
          />
        </span>
        <span className="font-headline-md text-headline-md text-on-primary font-bold tracking-tight">
          Lekhaprati
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AdminNavList />
            </div>

      <div className="border-t border-primary-container p-md">
        <div className="flex items-center gap-sm rounded-lg px-sm py-2 text-sm text-on-primary/80">
          <Icon name="manage_accounts" className="text-[19px]" />
          <span>Archive Staff</span>
          <span className="ml-auto mono-stat text-[11px] font-medium text-on-primary/60">
            verifiers@lekhaprati
          </span>
        </div>
      </div>
    </aside>
  );
}
