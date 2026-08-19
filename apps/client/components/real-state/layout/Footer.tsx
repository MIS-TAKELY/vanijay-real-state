import React from "react";
import { Button, Icon } from "@repo/ui";
import Image from "next/image";

import logo from "../../../public/logo.webp";
import logoText from "../../../public/logo-text.webp";

const footerLinks = {
  "The Archive": [
    { label: "Area Guides", href: "/area-guid" },
    { label: "NRN", href: "/nrn-concierge" },
    { label: "Unit Converter", href: "/convertor" },
    { label: "About", href: "/about" },
  ],
  Compliance: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Land Act Compliance", href: "#", active: true },
    { label: "Cookie Settings", href: "#" },
  ],
};

const headingClass =
  "font-label-sm text-label-sm font-bold text-gold mb-md uppercase tracking-[0.18em] text-[11px]";

export function Footer() {
  return (
    <footer className="relative z-10 w-full mt-xl border-t border-gold/20 bg-navy-deep text-white safe-bottom">
      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-lg px-gutter py-lg md:grid-cols-4 md:gap-md md:py-xl">
        <div className="col-span-1">
          <div className="mb-lg flex items-center gap-3 md:mb-md">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0.5 ring-1 ring-gold/50">
              <Image
                src={logo}
                alt="MALPOTH"
                width={40}
                height={40}
                className="h-full w-full rounded-full object-contain"
              />
            </span>
            {/* Wordmark sits on a white chip so the navy logo stays legible
                against the dark footer. */}
            <span className="flex h-9 shrink-0 items-center rounded-lg bg-white px-3 shadow-sm">
              <Image
                src={logoText}
                alt="MALPOTH"
                width={120}
                height={28}
                className="h-5.5 w-auto object-contain"
              />
            </span>
          </div>
          <p className="font-body-md text-sm leading-relaxed text-white/70">
            Nepal&apos;s first institutional land archive. Professionalizing
            real estate through rigorous field verification and legal
            transparency.
          </p>
        </div>

        <div>
          <h4 className={headingClass}>The Archive</h4>
          <div className="flex flex-col gap-base">
            {footerLinks["The Archive"].map((link) => (
              <a
                key={link.label}
                className="font-label-sm text-label-sm text-white/70 transition-colors hover:text-gold"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className={headingClass}>Compliance</h4>
          <div className="flex flex-col gap-base">
            {footerLinks.Compliance.map((link) => (
              <a
                key={link.label}
                className={`font-label-sm text-label-sm transition-colors ${
                  link.active
                    ? "font-bold text-gold underline underline-offset-4"
                    : "text-white/70 hover:text-gold"
                }`}
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className={headingClass}>Contact</h4>
          <p className="font-body-md text-sm text-white/70 mono-stat mb-lg md:mb-md">
            Durbar Marg, Kathmandu
            <br />
            info@lekhaprati.com
            <br />
            +977-1-4XXXXXX
          </p>
          <div className="flex gap-sm">
            <Button
              variant="outline"
              size="icon"
              aria-label="Email"
              className="h-10 w-10 border-white/20 text-white/80 hover:border-gold/60 hover:bg-white/5 hover:text-gold"
            >
              <Icon name="mail" className="text-data-table" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Phone"
              className="h-10 w-10 border-white/20 text-white/80 hover:border-gold/60 hover:bg-white/5 hover:text-gold"
            >
              <Icon name="phone" className="text-data-table" />
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-sm md:py-md">
        <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-sm px-gutter md:flex-row md:gap-md">
          <p className="font-label-sm text-[11px] text-white/50">
            © 2024 MALPOTH. All Rights Reserved. RAPD Unit Ref: LP-9921-X.
          </p>
          <div className="flex items-center gap-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
            <span className="mono-stat text-[11px] uppercase tracking-wider font-bold text-white/60">
              Systems Nominal: Archival v2.4
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
