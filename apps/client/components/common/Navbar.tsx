"use client";

import { signOut, useSession } from "@repo/auth/client";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Icon } from "@repo/ui";
import SignIn from "components/modals/SignIn";
import { navLinks } from "constants/varibles-constants";
import { LogOut, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthModalStore } from "store/auth-modal";
import { useCartStore } from "store/cart";

export function Navbar() {
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { open: openAuth } = useAuthModalStore();
  const cartCount = useCartStore((state) => state.count);
  const loadCart = useCartStore((state) => state.load);

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (!isPending) setHasLoadedOnce(true);
  }, [isPending]);

  const user = session?.user;
  const isLoggedIn = !!user;

  // Keep the cart badge in sync with the server whenever auth state settles.
  useEffect(() => {
    if (hasLoadedOnce && isLoggedIn) void loadCart();
  }, [hasLoadedOnce, isLoggedIn, loadCart]);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
    <header className="w-full top-0 sticky z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
      <nav className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16 sm:h-20">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="Lekhaprati home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm transition-transform group-hover:scale-105">
            <Icon name="domain" filled className="text-[22px]" />
          </span>
          <span className="font-display-lg text-headline-md text-primary font-bold tracking-tight">
            Lekhaprati
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-x-1">
          {navLinks.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.href) ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {item.label}
              <span
                className={`absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary transition-transform duration-300 ${
                  isActive(item.href) ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </Link>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* CTA: List a Property (desktop) */}
          <div className="hidden sm:block">
            {isLoggedIn ? (
              <Button asChild variant="default" size="sm">
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
                  <Button variant="default" size="sm">
                    List a Property
                    <Icon name="arrow_outward" className="text-data-table" />
                  </Button>
                }
              />
            )}
          </div>

          {/* Cart */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={`Cart${cartCount > 0 ? ` — ${cartCount} items` : " (empty)"}`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-on-surface hover:bg-surface-container cursor-pointer"
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

          {/* Auth area */}
          <div className="relative">
            {!hasLoadedOnce ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-outline-variant" />
            ) : isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-full bg-primary-container/15 hover:bg-primary-container/25 py-1.5 pl-1.5 pr-2 sm:pr-3 text-sm font-medium text-primary transition-all h-auto cursor-pointer"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                      {initials}
                    </span>
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
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

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-on-surface hover:bg-surface-container cursor-pointer"
          >
            <Icon
              name={mobileOpen ? "close" : "menu"}
              className="text-[26px]"
            />
          </Button>
        </div>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface">
          <div className="px-gutter py-md max-w-container-max mx-auto flex flex-col gap-1">
            {navLinks.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={`px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface hover:bg-surface-container"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-sm flex flex-col gap-sm pt-sm border-t border-outline-variant">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-3 py-3 rounded-lg text-base font-medium text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="justify-start px-3 py-3 rounded-lg text-left text-base font-medium text-error hover:bg-surface-container cursor-pointer h-auto"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setMobileOpen(false);
                      openAuth();
                    }}
                    className="h-11 rounded-lg bg-primary text-on-primary font-semibold cursor-pointer"
                  >
                    List a Property
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
