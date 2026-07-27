"use client";

import { signOut, useSession } from "@repo/auth/client";
import SignIn from "app/components/modals/SignIn";
import { navLinks } from "constants/varibles-constants";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function Navbar() {
  const { data: session, isPending } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = async () => {
    setDropdownOpen(false);
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

  return (
    <header className="w-full top-0 sticky z-50 bg-surface/95 backdrop-blur-sm border-b border-outline-variant">
      <nav className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-20">
        {/* Logo */}
        <div>
          <span className="font-display-lg text-headline-md text-primary font-bold">
            <Link href="/">Lekhaprati</Link>
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex gap-x-5">
          {navLinks.map((item, index) => (
            <Link
              href={item.href}
              key={index}
              className="hover:cursor-pointer hover:text-secondary hover:scale-99 hover:transition-all"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right section: Sign in or user menu */}
        <div className="relative" ref={dropdownRef}>
          {!hasLoadedOnce ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-outline-variant" />
          ) : isLoggedIn ? (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full bg-primary-container/20 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-container/40 transition-all cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                  {initials}
                </div>
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
            <SignIn />
          )}
        </div>
      </nav>
    </header>
  );
}
