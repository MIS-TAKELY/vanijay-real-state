"use client";

import { signOut, useSession } from "@repo/auth/client";
import { Button, Icon } from "@repo/ui";
import SignIn from "components/modals/SignIn";
import { navLinks } from "constants/varibles-constants";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthModalStore } from "store/auth-modal";

export function Navbar() {
  const { data: session, isPending } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { open: openAuth } = useAuthModalStore();

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (!isPending) setHasLoadedOnce(true);
  }, [isPending]);

  const user = session?.user;
  const isLoggedIn = !!user;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
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
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5"
                >
                  List a Property
                  <Icon name="arrow_outward" className="text-[16px]" />
                </Link>
              </Button>
            ) : (
              <SignIn
                trigger={
                  <Button variant="default" size="sm">
                    List a Property
                    <Icon name="arrow_outward" className="text-[16px]" />
                  </Button>
                }
              />
            )}
          </div>

          {/* Auth area */}
          <div className="relative" ref={dropdownRef}>
            {!hasLoadedOnce ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-outline-variant" />
            ) : isLoggedIn ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full bg-primary-container/15 hover:bg-primary-container/25 py-1.5 pl-1.5 pr-2 sm:pr-3 text-sm font-medium text-primary transition-all cursor-pointer"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                    {initials}
                  </span>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <svg
                    className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-outline-variant bg-surface shadow-lg ring-1 ring-black/5 focus:outline-none">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-outline-variant">
                      <p className="text-sm font-medium text-on-surface truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        <User className="h-4 w-4 text-on-surface-variant" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-on-surface-variant" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => openAuth()}
                className="hidden sm:inline-flex h-9 items-center rounded-md px-4 text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
              >
                Sign in
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <Icon
              name={mobileOpen ? "close" : "menu"}
              className="text-[26px]"
            />
          </button>
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
                  <button
                    onClick={handleLogout}
                    className="px-3 py-3 rounded-lg text-left text-base font-medium text-error hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      openAuth();
                    }}
                    className="h-11 rounded-lg bg-primary text-on-primary font-semibold cursor-pointer"
                  >
                    List a Property
                  </button>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      openAuth();
                    }}
                    className="h-11 rounded-lg border border-outline-variant text-on-surface font-semibold cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
