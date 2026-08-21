"use client";

import { signOut, useSession } from "@repo/auth/client";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  Input,
  ScrollArea,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui";
import SignIn from "components/real-state/modals/SignIn";
import { AppModeStrip } from "components/shared/AppModeStrip";

import { ChevronDown, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePwaInstall } from "hooks/use-pwa-install";
import { useAuthModalStore } from "store/auth-modal";
import { useCartStore } from "store/cart";

import Image from "next/image";
import logoText from "../../../public/logo-text.webp";
import logo from "../../../public/logo.webp";

const searchForm = (
  <form
    action="/search"
    role="search"
    className="flex h-8 items-center gap-1 rounded-full border border-outline-variant bg-white pl-2.5 pr-1 shadow-sm transition-shadow focus-within:border-gold/60 focus-within:ring-2 focus-within:ring-gold/30 sm:h-9 sm:gap-1.5 sm:pr-1.5"
  >
    <Icon
      name="search"
      aria-hidden="true"
      className="hidden shrink-0 text-[14px] text-on-surface-variant sm:inline"
    />
    <Input
      type="search"
      name="q"
      enterKeyHint="search"
      aria-label="Search properties"
      placeholder="Search listings…"
      className="h-7 flex-1 appearance-none border-0 !bg-white px-0 text-sm shadow-none focus-visible:ring-0 dark:!bg-white sm:h-8"
    />
    <Button
      type="submit"
      variant="ghost"
      size="icon-sm"
      aria-label="Search"
      className="shrink-0 rounded-lg text-on-surface-variant hover:bg-primary/10 hover:text-primary cursor-pointer"
    >
      <Icon name="search" className="text-[14px]" />
    </Button>
  </form>
);

/* Mobile nav — shown in the right-side Sheet. */
const MOBILE_LINKS = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Compare", href: "/compare", icon: "swap_horiz" },
  { label: "Convertor", href: "/convertor", icon: "calculate" },
  { label: "Cart", href: "/cart", icon: "add_shopping_cart" },
] as const;

const MOBILE_ACCOUNT_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: "space_dashboard" },
  { label: "My Listings", href: "/my-listings", icon: "inventory" },
  { label: "Saved Searches", href: "/saved-searches", icon: "bookmark" },
] as const;

export function Navbar() {
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const pathname = usePathname();
  const { open: openAuth } = useAuthModalStore();
  const cartCount = useCartStore((state) => state.count);
  const loadCart = useCartStore((state) => state.load);
  const { isInstalled, install } = usePwaInstall();

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [showAttention, setShowAttention] = useState(false);

  useEffect(() => {
    if (!isPending) setHasLoadedOnce(true);
  }, [isPending]);

  // Attention-grabbing bounce on first visit — continuous until user interacts
  useEffect(() => {
    if (!hasLoadedOnce || isPending) return;
    setShowAttention(true);
  }, [hasLoadedOnce, isPending]);

  const user = session?.user;
  const isLoggedIn = !!user;

  // Keep the cart badge in sync with the server whenever auth state settles.
  useEffect(() => {
    if (hasLoadedOnce && isLoggedIn) void loadCart();
  }, [hasLoadedOnce, isLoggedIn, loadCart]);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setAppsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setMobileOpen(false);
    await signOut();
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="w-full top-0 sticky z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant safe-top">
      <nav className="flex justify-between items-center w-full px-sm sm:px-gutter max-w-container-max mx-auto h-14 sm:h-16 md:h-20">
        {/* Logo (links home) + minimal app-switcher chevron */}
        <div className="flex items-center gap-2 md:gap-0.5">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2"
            aria-label="MALPOTH home"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/50 shadow-sm transition-transform duration-200 group-hover:scale-105 sm:h-12 sm:w-12">
              <Image
                src={logo}
                alt=""
                aria-hidden
                width={46}
                height={46}
                className="h-full w-full rounded-full object-contain"
              />
            </span>
            <span className="hidden h-7 w-auto shrink-0 md:block lg:h-8">
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

          {/* Apps switcher (minimal) — a down arrow beside the logo */}
          <DropdownMenu open={appsOpen} onOpenChange={setAppsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-haspopup="menu"
                aria-expanded={appsOpen}
                aria-label="Switch app"
                className={cn(
                  "animate-gentle-float cursor-pointer rounded-full border transition-colors duration-200",
                  appsOpen
                    ? "border-gold bg-surface-container text-on-surface"
                    : "border-gold/50 text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                  showAttention && !appsOpen && "animate-bounce-ball",
                )}
              >
                <span
                  className={cn(
                    "inline-flex",
                    appsOpen ? "animate-bounce-rotate" : "rotate-0",
                  )}
                >
                  <ChevronDown className="size-4" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="w-[300px] overflow-hidden rounded-2xl border border-outline-variant bg-surface p-0 shadow-xl data-[state=open]:animate-app-switcher-in data-[state=closed]:animate-app-switcher-out sm:w-[240px]"
            >
              <p className="flex items-center gap-2 px-2 pb-2 pt-2 font-label-sm text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
                <Icon name="grid_view" className="text-[14px]" />
                Switch app
              </p>
              <AppModeStrip compact />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search bar — always visible, fills remaining space on mobile */}
        <div className="flex min-w-0 flex-1 justify-center px-2 ">
          <div className="w-full min-w-0 max-w-md">{searchForm}</div>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* CTA: List a Property (md+) — on mobile it lives in the side menu */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <Button
                asChild
                variant="default"
                size="sm"
                className="bg-gold text-white shadow-sm hover:bg-gold/90"
              >
                <Link
                  href="/my-listings/new"
                  className="inline-flex items-center gap-1.5"
                >
                  List a Property
                  <Icon name="arrow_outward" className="text-data-table" />
                </Link>
              </Button>
            ) : (
              <SignIn
                trigger={
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-gold text-on-gold shadow-sm hover:bg-gold/90"
                  >
                    List a Property
                    <Icon name="arrow_outward" className="text-data-table" />
                  </Button>
                }
              />
            )}
          </div>

          {/* Download App (md+) — PWA install button */}
          {!isInstalled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={install}
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 text-xs font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface cursor-pointer"
            >
              <Icon name="download" className="text-[16px]" />
              Get App
            </Button>
          )}

          {/* Cart (md+) — on mobile it lives in the side menu */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={`Cart${cartCount > 0 ? ` — ${cartCount} items` : " (empty)"}`}
            className="relative hidden h-10 w-10 items-center justify-center rounded-lg text-on-surface hover:bg-surface-container cursor-pointer md:inline-flex"
          >
            <Link href="/cart">
              <Icon name="add_shopping_cart" className="text-[24px]" />
              {isLoggedIn && cartCount > 0 && (
                <span className="mono-stat absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-on-primary shadow-sm">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Auth area (md+) — on mobile it lives in the side menu */}
          <div className="relative hidden md:block">
            {!hasLoadedOnce ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-outline-variant" />
            ) : isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    aria-label="Account menu"
                    className="rounded-full text-xs font-bold shadow-sm cursor-pointer hover:bg-primary/90 data-[state=open]:bg-primary"
                  >
                    {initials}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {user?.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-3">
                      <User className="h-4 w-4 text-on-surface-variant" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    variant="destructive"
                    className="flex items-center gap-3"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                onClick={() => openAuth()}
                className="hidden sm:inline-flex h-9 items-center rounded-md px-4 text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container"
              >
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile hamburger → right-side Sheet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-on-surface hover:bg-surface-container cursor-pointer touch-target"
              >
                <Icon
                  name={mobileOpen ? "close" : "Menu"}
                  className="text-[26px]"
                />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[86%] max-w-sm flex-col gap-0 bg-surface p-0"
            >
              <SheetHeader className="border-b border-outline-variant px-4 py-4 pr-12">
                {isLoggedIn ? (
                  <>
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <div className="flex items-center gap-3">
                      <Avatar size="lg" className="bg-primary">
                        <AvatarFallback className="bg-primary text-xs font-bold text-on-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-on-surface">
                          {user?.name}
                        </p>
                        <p className="truncate text-xs text-on-surface-variant">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <SheetTitle className="font-headline-md text-lg font-semibold tracking-tight text-navy">
                      Menu
                    </SheetTitle>
                    <p className="text-sm text-on-surface-variant">
                      Browse, compare and list properties.
                    </p>
                  </>
                )}
              </SheetHeader>

              <ScrollArea className="min-h-0 flex-1">
                <nav
                  aria-label="Main menu"
                  className="flex flex-col gap-0.5 p-2"
                >
                  {MOBILE_LINKS.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-surface-container",
                            active && "bg-primary/10 text-primary",
                          )}
                        >
                          <Icon
                            name={link.icon}
                            className={cn(
                              "text-[20px]",
                              active
                                ? "text-primary"
                                : "text-on-surface-variant",
                            )}
                          />
                          <span className="flex-1">{link.label}</span>
                          {link.href === "/cart" &&
                            isLoggedIn &&
                            cartCount > 0 && (
                              <Badge
                                variant="default"
                                className="min-w-5 justify-center rounded-full px-1.5 text-[10px] font-bold leading-none"
                              >
                                {cartCount > 99 ? "99+" : cartCount}
                              </Badge>
                            )}
                        </Link>
                      </SheetClose>
                    );
                  })}

                  {isLoggedIn && (
                    <>
                      <Separator className="my-2" />
                      {MOBILE_ACCOUNT_LINKS.map((link) => {
                        const active = isActive(link.href);
                        return (
                          <SheetClose asChild key={link.href}>
                            <Link
                              href={link.href}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-surface-container",
                                active && "bg-primary/10 text-primary",
                              )}
                            >
                              <Icon
                                name={link.icon}
                                className={cn(
                                  "text-[20px]",
                                  active
                                    ? "text-primary"
                                    : "text-on-surface-variant",
                                )}
                              />
                              <span className="flex-1">{link.label}</span>
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </>
                  )}

                  {/* Apps switcher (mobile) — collapsed into the side menu */}
                  <Separator className="my-2" />
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
                    Switch app
                  </p>
                  <div className="-mx-2">
                    <AppModeStrip compact />
                  </div>

                  {/* Download App (mobile) — PWA install button */}
                  {!isInstalled && (
                    <>
                      <Separator className="my-2" />
                      <SheetClose asChild>
                        <button
                          onClick={install}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-surface-container w-full"
                        >
                          <Icon
                            name="download"
                            className="text-[20px] text-on-surface-variant"
                          />
                          <span className="flex-1 text-left">Get App</span>
                          <Icon
                            name="open_in_new"
                            className="text-[14px] text-on-surface-variant/50"
                          />
                        </button>
                      </SheetClose>
                    </>
                  )}
                </nav>
              </ScrollArea>

              {/* Auth actions */}
              <div className="border-t border-outline-variant p-4">
                {isLoggedIn ? (
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="h-11 w-full justify-start rounded-lg px-3 text-base font-medium text-error hover:bg-error/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setMobileOpen(false);
                        openAuth();
                      }}
                      className="h-11 rounded-lg bg-gold text-on-gold font-semibold cursor-pointer hover:bg-gold/90"
                    >
                      List a Property
                      <Icon name="arrow_outward" className="text-data-table" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMobileOpen(false);
                        openAuth();
                      }}
                      className="h-11 rounded-lg border-outline-variant text-on-surface font-semibold cursor-pointer"
                    >
                      Sign in
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
