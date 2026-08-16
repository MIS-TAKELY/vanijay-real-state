import React from "react";
import { Button, Icon } from "@repo/ui";

const footerLinks = {
  "The Archive": [
    { label: "Area Guides", href: "/area-guid" },
    { label: "NRN", href: "/nrn-concierge" },
    { label: "About", href: "/about" },
  ],
  Compliance: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Land Act Compliance", href: "#", active: true },
    { label: "Cookie Settings", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="w-full mt-xl bg-surface-container-low border-t border-outline-variant relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md px-gutter py-xl max-w-container-max mx-auto">
        <div className="col-span-1">
          <span className="font-headline-md text-2xl text-primary mb-md block font-bold">
            Lekhaprati
          </span>
          <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
            Nepal&apos;s first institutional land archive. Professionalizing
            real estate through rigorous field verification and legal
            transparency.
          </p>
        </div>

        <div>
          <h4 className="font-label-sm text-label-sm font-bold text-on-surface mb-md uppercase tracking-widest text-[11px]">
            The Archive
          </h4>
          <div className="flex flex-col gap-sm">
            {footerLinks["The Archive"].map((link) => (
              <a
                key={link.label}
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-label-sm text-label-sm font-bold text-on-surface mb-md uppercase tracking-widest text-[11px]">
            Compliance
          </h4>
          <div className="flex flex-col gap-sm">
            {footerLinks.Compliance.map((link) => (
              <a
                key={link.label}
                className={`font-label-sm text-label-sm transition-colors ${
                  link.active
                    ? "text-primary font-bold underline"
                    : "text-on-surface-variant hover:text-primary"
                }`}
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-label-sm text-label-sm font-bold text-on-surface mb-md uppercase tracking-widest text-[11px]">
            Contact
          </h4>
          <p className="font-body-md text-on-surface-variant text-sm mb-md mono-stat">
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
              className="w-10 h-10 border-outline-variant hover:bg-surface-container"
            >
              <Icon name="mail" className="text-outline" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Phone"
              className="w-10 h-10 border-outline-variant hover:bg-surface-container"
            >
              <Icon name="phone" className="text-outline" />
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-outline-variant py-md">
        <div className="max-w-container-max mx-auto px-gutter flex flex-col md:flex-row justify-between items-center gap-md">
          <p className="font-label-sm text-[11px] text-on-surface-variant">
            © 2024 Lekhaprati. All Rights Reserved. RAPD Unit Ref: LP-9921-X.
          </p>
          <div className="flex items-center gap-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="mono-stat text-[11px] text-outline uppercase tracking-wider font-bold">
              Systems Nominal: Archival v2.4
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
