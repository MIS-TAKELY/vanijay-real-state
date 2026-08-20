"use client";

import { BouncingAppSwitcher, BrandLogo } from "@repo/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppModeStrip } from "components/shared/AppModeStrip";
import { METAL_META } from "../../constants/gold/metals";
import type { MetalId } from "../../constants/gold/metals";
import logo from "../../public/logo.webp";
import logoText from "../../public/logo-text.webp";

/** Primary navigation for the Precious Metals app (gold group). */
const NAV_LINKS: Array<{ label: string; href: string; metalId?: MetalId }> = [
  { label: "Gold", href: "/gold", metalId: "gold" },
  { label: "Silver", href: "/silver", metalId: "silver" },
  { label: "Diamond", href: "/diamond", metalId: "diamond" },
  { label: "Copper", href: "/copper", metalId: "copper" },
  { label: "Steel", href: "/steel", metalId: "steel" },
  { label: "Compare", href: "/metals/compare" },
];

export function MetalsNavbar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/metals/compare"
      ? pathname.startsWith("/metals")
      : pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-6 px-4 sm:h-20 md:px-6">
        {/* Brand + app switcher (shared bouncing dropdown) */}
        <div className="flex shrink-0 items-center gap-1">
          <BrandLogo
            logoSrc={logo}
            logoTextSrc={logoText}
            href="/gold"
            alt="Malpoth"
            ariaLabel="Malpoth Metals — home"
            variant="light"
            logoClassName="h-11 w-11 sm:h-14 sm:w-14"
            wordmarkClassName="h-8 sm:h-9"
          />
          <BouncingAppSwitcher label="Switch app">
            <p className="flex items-center gap-2 px-2 pb-2 pt-2 font-label-sm text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
              Switch app
            </p>
            <AppModeStrip compact />
          </BouncingAppSwitcher>
        </div>

        {/* Links — scrolls horizontally on small screens */}
        <nav
          aria-label="Metals"
          className="no-scrollbar flex min-w-0 flex-1 items-center justify-end gap-0.5 overflow-x-auto md:justify-center"
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#103050]/[0.07] text-[#8A6D1D]"
                    : "text-[#103050]/60 hover:text-[#103050]"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {link.metalId ? (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: METAL_META[link.metalId].accentColor,
                    }}
                    aria-hidden="true"
                  />
                ) : null}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}