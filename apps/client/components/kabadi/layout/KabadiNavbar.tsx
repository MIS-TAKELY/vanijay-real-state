"use client";

import { BouncingAppSwitcher } from "@repo/ui";
import { Building2, Menu, Phone } from "lucide-react";
import Image from "next/image";
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
import { AppModeStrip } from "components/shared/AppModeStrip";
import logo from "../../../public/logo.webp";
import logoText from "../../../public/logo-text.webp";

export function KabadiNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-container-max items-center justify-between gap-4 px-gutter sm:h-[4.25rem]">
        {/* Brand + app switcher */}
        <div className="flex min-w-0 items-center gap-1">
          <Link
            href="/scrape"
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="MALPOTH home"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold/50 shadow-sm transition-transform duration-200 group-hover:scale-105 sm:size-11">
              <Image
                src={logo}
                alt=""
                aria-hidden
                width={44}
                height={44}
                className="h-full w-full rounded-full object-contain"
              />
            </span>
            <span className="hidden h-7 w-auto shrink-0 sm:block">
              <Image
                src={logoText}
                alt=""
                aria-hidden
                width={120}
                height={36}
                className="h-full w-auto object-contain object-left"
              />
            </span>
          </Link>

          <BouncingAppSwitcher label="Switch app">
            <p className="flex items-center gap-2 px-2 pb-2 pt-2 font-label-sm text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-gold"
              />
              Switch app
            </p>
            <AppModeStrip compact />
          </BouncingAppSwitcher>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            asChild
            className="hidden h-10 font-medium text-muted-foreground hover:text-primary md:inline-flex"
          >
            <Link href="/">
              <Building2 />
              Real Estate
            </Link>
          </Button>

          <Button
            asChild
            className="hidden h-10 bg-gold px-4! text-on-gold hover:bg-gold-deep sm:inline-flex"
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
            <SheetContent side="right" className="w-80 bg-background">
              <SheetHeader>
                <SheetTitle className="sr-only">Kabadi menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4">
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

                <Separator className="bg-border" />

                <SheetClose asChild>
                  <Button
                    asChild
                    className="w-full bg-gold! text-on-gold! hover:bg-gold-deep!"
                  >
                    <a href="#how-it-works">
                      <Phone />
                      Book a pickup
                    </a>
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button variant="ghost" asChild className="w-full">
                    <a href="#rates">Browse today&apos;s rates</a>
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
