import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Container,
} from "@repo/ui";
import { ConvertorClient } from "components/real-state/pages/convertor/ConvertorClient";
import { formatLandNumber, LAND_UNITS } from "lib/land-units";
import { SITE_URL } from "lib/site";

const PAGE_URL = `${SITE_URL}/convertor`;

const KEYWORDS = [
  "land unit converter",
  "land unit converter Nepal",
  "convert Ropani to Aana",
  "Ropani to square feet",
  "Aana to square feet",
  "Katha to square feet",
  "Bigha to Katha",
  "Dhur to square feet",
  "square feet to Aana",
  "Nepal land measurement converter",
  "property area converter Nepal",
  "Ropani Aana Paisa Daam converter",
  "Bigha Katha Dhur converter",
];

export const metadata: Metadata = {
  title: "Land Unit Converter — Ropani, Aana, Katha to Sq. ft | MALPOTH",
  description:
    "Instantly and accurately convert Nepali land units (Ropani, Aana, Paisa, Daam, Bigha, Katha, Dhur) to international units (sq. ft, sq. m, acre, hectare). A free, minimalist land measurement converter for Nepal.",
  keywords: KEYWORDS,
  alternates: {
    canonical: "/convertor",
  },
  openGraph: {
    title: "Land Unit Converter — Ropani, Aana, Katha to Sq. ft | MALPOTH",
    description:
      "The fastest, most accurate land area converter for Nepal — Ropani, Aana, Bigha, Katha, Dhur to sq. ft, sq. m, acre and hectare. Free and instant.",
    url: PAGE_URL,
    siteName: "MALPOTH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Land Unit Converter — Ropani to Sq. ft, Katha to Sq. ft | MALPOTH",
    description:
      "Convert Ropani, Aana, Bigha, Katha and Dhur to sq. ft instantly. Nepal's most accurate land unit converter, free forever.",
  },
  robots: { index: true, follow: true },
};

/* ------------------------------------------------------------------ */
/*  FAQ — rendered both as visible content and FAQPage JSON-LD         */
/* ------------------------------------------------------------------ */

const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "How many square feet are in 1 Aana?",
    a: "1 Aana equals exactly 342.25 square feet. One Ropani equals 16 Aana (5,476 sq. ft), one Paisa equals 1/4 Aana (85.5625 sq. ft) and one Daam equals 1/16 Aana (21.390625 sq. ft).",
  },
  {
    q: "How many square feet are in 1 Katha?",
    a: "1 Katha equals exactly 364.5 square feet. One Bigha equals 20 Katha (7,290 sq. ft) and one Dhur equals 1/20 Katha (18.225 sq. ft).",
  },
  {
    q: "What is the difference between Ropani-Aana and Bigha-Katha?",
    a: "Both are Nepal's traditional land measurement systems. Ropani-Aana-Paisa-Daam is used mainly in the hilly regions (including Kathmandu Valley), while Bigha-Katha-Dhur is used in the Terai (southern plains). A Ropani is larger than a Bigha, but the two systems are not interchangeable without conversion.",
  },
  {
    q: "Are the conversions in this converter accurate?",
    a: "Yes. The converter uses the exact factors defined across the MALPOTH platform (1 Aana = 342.25 sq. ft, 1 Katha = 364.5 sq. ft, 1 sq. m = 1/0.092903 sq. ft). Results are shown to up to 10 significant digits with no misleading rounding.",
  },
  {
    q: "Which land units does the MALPOTH converter support?",
    a: "Nepali units — Ropani, Aana, Paisa, Daam, Bigha, Katha and Dhur — plus international units: square feet, square meters, square yards, acres, hectares and square kilometers.",
  },
];

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MALPOTH Land Unit Converter",
  url: PAGE_URL,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  description:
    "Instantly convert Nepali land units (Ropani, Aana, Paisa, Daam, Bigha, Katha, Dhur) to international units (sq. ft, sq. m, acre, hectare) with 100% accuracy.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: {
    "@type": "Organization",
    name: "MALPOTH",
    url: SITE_URL,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Land Unit Converter",
      item: PAGE_URL,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((i) => ({
    "@type": "Question",
    name: i.q,
    acceptedAnswer: { "@type": "Answer", text: i.a },
  })),
};

export default function ConvertorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="border-b border-outline-variant bg-surface-container-low">
          <Container>
            <div className="max-w-xl py-5 sm:py-5">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft/30 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-gold-deep">
                <span className="h-1 w-1 rounded-full bg-gold" />
                Free land measurement tool
              </p>
              <h1 className="font-display text-xl font-semibold leading-tight text-navy sm:text-2xl">
                Land Unit Converter
              </h1>
             
            </div>
          </Container>
        </section>

        {/* ── Converter ────────────────────────────────────────────── */}
        <section className="py-8 sm:py-12">
          <Container>
            <ConvertorClient />

            <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-outline-variant bg-surface-container-low/60 p-4 text-sm leading-relaxed text-on-surface-variant">
              <strong className="font-semibold text-navy">
                Built on verified figures.
              </strong>{" "}
              Factors match the exact values used across MALPOTH&apos;s land
              registry:{" "}
              <span className="mono-stat">1 Aana = 342.25 sq. ft</span>,{" "}
              <span className="mono-stat">1 Katha = 364.5 sq. ft</span>,{" "}
              <span className="mono-stat">1 sq. m = 1 / 0.092903 sq. ft</span>.
              Results are rendered to up to 10 significant digits, so exact
              conversions import cleanly with no hidden rounding.
            </div>
          </Container>
        </section>

        {/* ── Reference table ─────────────────────────────────────── */}
        <section className="border-t border-outline-variant bg-surface-container-low pb-12">
          <Container>
            <div className="mx-auto max-w-3xl pt-10 sm:pt-14">
              <h2 className="font-display text-2xl font-semibold text-navy">
                Land measurement reference
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Every unit supported by the converter, with its exact square
                foot value — the same factors used in MALPOTH land pricing.
              </p>

              <div className="mt-6 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container">
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                        Unit
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                        System
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                        Sq. ft (exact)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {LAND_UNITS.map((u, i) => (
                      <tr
                        key={u.key}
                        className={
                          i % 2 === 0
                            ? "border-b border-outline-variant/50"
                            : "border-b border-outline-variant/50 bg-surface-container/40"
                        }
                      >
                        <td className="px-4 py-2.5 font-medium text-on-surface">
                          {u.full}
                        </td>
                        <td className="px-4 py-2.5 text-on-surface-variant">
                          {u.group === "nepali-ropani"
                            ? "Nepali (hill)"
                            : u.group === "nepali-bigha"
                              ? "Nepali (Terai)"
                              : "International"}
                        </td>
                        <td className="mono-stat px-4 py-2.5 text-right font-semibold text-navy">
                          {formatLandNumber(u.sqFt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Container>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section className="py-10 sm:py-14">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-2xl font-semibold text-navy">
                Frequently asked questions
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Quick answers about Nepal&apos;s land measurement systems.
              </p>
              <Accordion type="single" collapsible className="mt-6">
                {FAQ_ITEMS.map((item, idx) => (
                  <AccordionItem
                    key={item.q}
                    value={`faq-${idx}`}
                    className="border-outline-variant"
                  >
                    <AccordionTrigger className="font-semibold text-on-surface hover:text-primary">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-on-surface-variant">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
