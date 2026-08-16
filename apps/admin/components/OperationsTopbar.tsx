"use client";

import { useRouter } from "next/navigation";
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
  SidebarTrigger,
} from "@repo/ui";

import { useSession, signOut } from "@repo/auth/client";

/**
 * Topbar: sidebar toggle + global search + staff user menu.
 *
 * Desktop collapse and mobile drawer are both driven by SidebarTrigger /
 * SidebarProvider — no separate Sheet needed.
 */
export function OperationsTopbar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const displayName = user?.name || "Admin";
  const email = user?.email || "admin@lekhaprati.com";
  const initial = displayName.charAt(0).toUpperCase();
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-md border-b border-outline-variant bg-surface/90 px-md backdrop-blur-md">
      {/* Left: collapse/open sidebar + condensed brand */}
      <div className="flex items-center gap-sm">
        <SidebarTrigger
          aria-label="Toggle navigation"
          className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
        />

        <span className="hidden font-headline-md text-headline-md font-bold text-on-surface sm:block">
          Operations Console
        </span>
      </div>

      {/* Center: global search */}
      <div className="max-w-(--container-xl) flex-1">
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
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-headline-md font-bold text-on-primary">
                {isPending ? "…" : initial}
              </span>
              <span className="hidden sm:inline">{isPending ? "Loading" : displayName}</span>
              <Icon name="chevron_down" className="text-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-60 bg-surface text-on-surface"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{displayName}</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">
                  {email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-outline-variant" />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-outline-variant" />
            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                window.location.href = "/login";
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
