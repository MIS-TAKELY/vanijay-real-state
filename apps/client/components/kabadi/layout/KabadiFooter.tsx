import { MapPin, Phone, Recycle } from "lucide-react";
import { Separator } from "@repo/ui";
import { RATES_LAST_UPDATED } from "lib/kabadi/rates";

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
    <footer className="border-t border-kabadi-border bg-kabadi-surface">
      <div className="mx-auto max-w-container-max px-gutter py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-kabadi-primary text-kabadi-on-primary">
                <Recycle className="size-5" />
              </span>
              <span className="font-display-lg text-headline-md font-bold text-kabadi-primary">
                Kabadi
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-kabadi-muted">
              Nepal&apos;s transparent scrap price guide. Know what your kabadi
              is worth before you sell — then book a doorstep pickup and get
              cash on the spot, weighed on a transparent digital scale.
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm text-kabadi-muted">
              <MapPin className="size-4 text-kabadi-primary" />
              Serving Kathmandu Valley &amp; major cities
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-kabadi-muted">
              <Phone className="size-4 text-kabadi-primary" />
              9800-KABADI (9800-522234)
            </p>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h3 className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-kabadi-primary">
                {col.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-kabadi-muted transition-colors hover:text-kabadi-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mt-10 bg-kabadi-border" />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 text-xs text-kabadi-muted">
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
