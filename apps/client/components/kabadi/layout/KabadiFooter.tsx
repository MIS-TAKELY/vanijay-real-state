import { MapPin, Phone } from "lucide-react";
import { Separator } from "@repo/ui";
import { RATES_LAST_UPDATED } from "lib/kabadi/rates";
import Image from "next/image";
import logo from "../../../public/logo.webp";
import logoText from "../../../public/logo-text.webp";

const FOOTER_COLS = [
  {
    title: "Explore",
    links: [
      { label: "Today's Rates", href: "#rates" },
      { label: "Earnings Calculator", href: "#calculator" },
      { label: "Categories", href: "#categories" },
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    title: "Popular items",
    links: [
      { label: "Copper (तामा) rates", href: "#rates" },
      { label: "Newspaper rates", href: "#rates" },
      { label: "Old mobile phones", href: "#rates" },
      { label: "Fridge & appliances", href: "#rates" },
    ],
  },
];

export function KabadiFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-container-max px-gutter py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="mb-md flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0.5 ring-1 ring-gold/50">
                <Image
                  src={logo}
                  alt="MALPOTH"
                  width={40}
                  height={40}
                  className="h-full w-full rounded-full object-contain"
                />
              </span>
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
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Nepal&apos;s transparent scrap price guide. Know what your kabadi
              is worth before you sell — then book a doorstep pickup and get
              cash on the spot, weighed on a transparent digital scale.
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              Serving Kathmandu Valley &amp; major cities
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4 text-primary" />
              9702634469
            </p>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h3 className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
                {col.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mt-10 bg-border" />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Kabadi · Sell your scrap, get paid in
            cash
          </p>
          <p>
            Indicative rates · last updated {RATES_LAST_UPDATED} · rates vary by
            condition &amp; market
          </p>
        </div>
      </div>
    </footer>
  );
}
