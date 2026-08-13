"use client";

import { Building2, Menu, Phone, Recycle } from "lucide-react";
import Link from "next/link";
import {
  Button,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui";

const NAV_LINKS = [
  { label: "Today's Rates", href: "#rates" },
  { label: "Calculator", href: "#calculator" },
  { label: "Categories", href: "#categories" },
  { label: "How it works", href: "#how-it-works" },
];

export function KabadiNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-kabadi-border bg-kabadi-bg/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-container-max items-center justify-between gap-4 px-gutter py-3.5">
        {/* Brand */}
        <Link href="/scrape" className="group flex items-center gap-2.5">
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

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              asChild
              className="font-medium text-kabadi-muted hover:text-kabadi-primary"
            >
              <a href={link.href}>{link.label}</a>
            </Button>
          ))}
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
              <div className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Button
                      variant="ghost"
                      asChild
                      className="h-auto justify-start py-3 text-base font-medium text-kabadi-on-bg"
                    >
                      <a href={link.href}>{link.label}</a>
                    </Button>
                  </SheetClose>
                ))}

                <Separator className="my-2 bg-kabadi-border" />

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
    </header>
  );
}
