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
    className="flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card pl-2.5 pr-1.5 transition-shadow focus-within:ring-2 focus-within:ring-primary/25"
  >
    <Search aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
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
      className="shrink-0 rounded-lg text-muted-foreground hover:bg-accent hover:text-primary cursor-pointer"
    >
      <Search className="size-3.5" />
    </Button>
  </form>
);

export function KabadiNavbar() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-container-max items-center justify-between gap-4 px-gutter py-3.5">
        {/* Brand (links to /scrape) + app switcher chevron */}
        <div className="flex items-center gap-1">
          <Link
            href="/scrape"
            className="group flex items-center gap-2.5"
            aria-label="Kabadi home"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Recycle className="size-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display-lg text-headline-md font-bold tracking-tight text-primary">
                Kabadi
              </span>
              <span className="font-label-sm text-label-sm text-muted-foreground">
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
                className="rounded-full bg-gold text-on-gold shadow-sm transition-all duration-200 hover:scale-105 hover:bg-gold-deep hover:shadow-md data-[state=open]:rotate-180 cursor-pointer"
              >
                <ChevronDown className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[300px] overflow-hidden p-0 border-border bg-card text-foreground sm:w-[340px]"
            >
              <p className="px-4 pt-3 font-label-sm text-label-sm font-semibold uppercase tracking-widest text-muted-foreground">
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
          className="hidden font-medium text-muted-foreground hover:text-primary md:inline-flex"
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
            className="hidden bg-gold px-4! text-on-gold hover:bg-gold-deep sm:inline-flex"
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
            <SheetContent side="right" className="w-80 bg-background">
              <SheetHeader>
                <SheetTitle className="sr-only">Kabadi menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4">
                {searchForm}

                <Separator className="bg-border" />

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
                    className="mt-2 w-full bg-gold! text-on-gold! hover:bg-gold-deep!"
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
        <div className="border-t border-border bg-card/95 px-gutter py-3 md:hidden">
          {searchForm}
        </div>
      )}
    </header>
  );
}
