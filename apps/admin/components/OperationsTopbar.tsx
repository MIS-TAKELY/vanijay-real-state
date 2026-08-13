"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  Input,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@repo/ui";

import { AdminNavList } from "components/AdminNavList";

/**
 * Topbar: mobile nav trigger + global search + staff user menu.
 *
 * The mobile drawer reuses <AdminNavList /> so the desktop and mobile nav are
 * guaranteed to stay in sync.
 */
export function OperationsTopbar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-md border-b border-outline-variant bg-surface/90 px-md backdrop-blur-md">
      {/* Left: mobile menu + condensed brand */}
      <div className="flex items-center gap-sm">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Open navigation"
              className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface md:hidden"
            >
              <span className="flex flex-col gap-0.5 h-4 w-5 justify-center">
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-3 rounded bg-current" />
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[--sidebar-w] border-r border-outline-variant p-0 bg-primary text-on-primary"
          >
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
            <div className="py-md">
              <AdminNavList compact />
            </div>
          </SheetContent>
        </Sheet>

        <span className="hidden sm:block font-headline-md text-headline-md text-on-surface font-bold">
          Operations Console
        </span>
      </div>

      {/* Center: global search */}
      <div className="flex-1 max-w-(--container-xl)">
        <form onSubmit={(e) => e.preventDefault()} role="search" className="relative">
          <label htmlFor="admin-search" className="sr-only">
            Search listings and documents
          </label>
          <Input
            id="admin-search"
            type="search"
            placeholder="Search by plot code, district, or case ID…"
            className="peer w-full bg-surface pl-10 text-data-table"
            aria-label="Search the archive"
          />
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 peer-focus:text-primary"
          />
        </form>
      </div>

      {/* Right: user menu */}
      <div className="flex items-center gap-sm">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Inbox"
          className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
        >
          <Icon name="mail" className="text-[20px]" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-sm rounded-lg px-sm py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary font-headline-md font-bold">
                A
              </span>
              <span className="hidden sm:inline">Archivist</span>
              <Icon name="chevron_down" className="text-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-52 bg-surface text-on-surface"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">Archivist</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">
                  verifiers@lekhaprati
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-outline-variant" />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-outline-variant" />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

