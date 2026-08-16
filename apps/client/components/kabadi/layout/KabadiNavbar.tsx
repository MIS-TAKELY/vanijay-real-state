"use client";

import {
  Building2,
  ChevronDown,
  Menu,
  Phone,
  Recycle,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui";
import { AppModeStrip } from "components/shared/AppModeStrip";

const searchForm = (
  <form
    action="#rates"
    role="search"
    className="flex h-9 items-center gap-1.5 rounded-xl border border-kabadi-border bg-kabadi-surface pl-2.5 pr-1.5 transition-shadow focus-within:ring-2 focus-within:ring-kabadi-primary/25"
  >
    <Search aria-hidden="true" className="size-3.5 shrink-0 text-kabadi-muted" />
    <Input
      type="search"
      name="q"
      aria-label="Search scrap items"
      placeholder="Search an item or Nepali name…"
      className="h-8 min-w-0 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
    />
    <Button
      type="submit"
      variant="ghost"
      size="icon-sm"
      aria-label="Search"
      className="shrink-0 rounded-lg text-kabadi-muted hover:bg-kabadi-primary-soft hover:text-kabadi-primary cursor-pointer"
    >
      <Search className="size-3.5" />
    </Button>
  </form>
);

export function KabadiNavbar() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-kabadi-border bg-kabadi-bg/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-container-max items-center justify-between gap-4 px-gutter py-3.5">
        {/* Brand (links to /scrape) + app switcher chevron */}
        <div className="flex items-center gap-1">
          <Link
            href="/scrape"
            className="group flex items-center gap-2.5"
            aria-label="Kabadi home"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-kabadi-primary text-kabadi-on-primary shadow-sm transition-transform group-hover:scale-105">
              <Recycle className="size-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display-lg text-headline-md font-bold tracking-tight text-kabadi-primary">
                Kabadi
              </span>
              <span className="font-label-sm text-label-sm text-kabadi-muted">
                sell scrap · get cash
              </span>
            </span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label="Switch app"
                className="rounded-full bg-kabadi-accent text-kabadi-on-accent shadow-sm transition-all duration-200 hover:scale-105 hover:bg-kabadi-accent-strong hover:shadow-md data-[state=open]:rotate-180 cursor-pointer"
              >
                <ChevronDown className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="kabadi-app w-[300px] overflow-hidden p-0 border-kabadi-border bg-kabadi-surface text-kabadi-on-bg sm:w-[340px]"
            >
              <p className="px-4 pt-3 font-label-sm text-label-sm font-semibold uppercase tracking-widest text-kabadi-muted">
                Switch app
              </p>
              <AppModeStrip compact />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop search bar */}
        <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-xl">{searchForm}</div>
        </div>

        {/* Back to the main app (desktop) */}
        <Button
          variant="ghost"
          asChild
          className="hidden font-medium text-kabadi-muted hover:text-kabadi-primary md:inline-flex"
        >
          <Link href="/">
            <Building2 />
            Real Estate
          </Link>
        </Button>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            className="hidden bg-kabadi-accent px-4! text-kabadi-on-accent hover:bg-kabadi-accent-strong sm:inline-flex"
          >
            <a href="#how-it-works">
              <Phone />
              Book a pickup
            </a>
          </Button>

          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon-lg"
            className="md:hidden"
            aria-label={mobileSearchOpen ? "Close search" : "Open search"}
            aria-expanded={mobileSearchOpen}
            onClick={() => setMobileSearchOpen((open) => !open)}
          >
            {mobileSearchOpen ? (
              <X className="size-6" />
            ) : (
              <Search className="size-6" />
            )}
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                className="md:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-kabadi-bg">
              <SheetHeader>
                <SheetTitle className="sr-only">Kabadi menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4">
                {searchForm}

                <Separator className="bg-kabadi-border" />

                <SheetClose asChild>
                  <Button
                    variant="outline"
                    asChild
                    className="h-auto justify-start gap-2 py-3 text-base font-medium"
                  >
                    <Link href="/">
                      <Building2 />
                      Real Estate
                    </Link>
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button
                    asChild
                    className="mt-2 w-full bg-kabadi-accent! text-kabadi-on-accent! hover:bg-kabadi-accent-strong!"
                  >
                    <a href="#how-it-works">
                      <Phone />
                      Book a pickup
                    </a>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="border-t border-kabadi-border bg-kabadi-surface/95 px-gutter py-3 md:hidden">
          {searchForm}
        </div>
      )}
    </header>
  );
}
