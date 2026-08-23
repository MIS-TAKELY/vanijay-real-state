import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Container,
} from "@repo/ui";
import { ConvertorClient } from "components/real-state/pages/convertor/ConvertorClient";
import {
  CONVERSION_PAIRS,
  getConversionBySlug,
  pairFactor,
  pairFactorChain,
  pairFaq,
  pairKeywords,
  pairMetaDescription,
  pairMetaTitle,
  pairReverseFactor,
  pairTitleWords,
  relatedPairs,
  reversePair,
  type ConversionPair,
} from "lib/land-conversions";
import {
  GROUP_LABELS,
  convertLand,
  formatLandNumber,
  landValuesFromSqFt,
  systemOf,
  type UnitKey,
} from "lib/land-units";
import { buildHreflang, ogLocaleFor } from "lib/i18n";
import { SITE_URL } from "lib/site";

export const revalidate = 86400;

/** Unknown slugs 404 immediately instead of attempting a render. */
export const dynamicParams = false;

type PageProps = { params: Promise<{ pair: string }> };

const PAGE_PATH = "/convertor";

/** Values shown in the forward and reverse lookup tables. */
const TABLE_VALUES = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 25, 50, 100];

function loadPair(slug: string): ConversionPair {
  const pair = getConversionBySlug(slug);
  if (!pair) notFound();
  return pair;
}

export function generateStaticParams(): Array<{ pair: string }> {
  return CONVERSION_PAIRS.map((p) => ({ pair: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pair: slug } = await params;
  const pair = loadPair(slug);
  const path = `${PAGE_PATH}/${pair.slug}`;
  const title = pairMetaTitle(pair);
  const description = pairMetaDescription(pair);

  return {
    title,
    description,
    keywords: pairKeywords(pair),
    alternates: {
      canonical: path,
      languages: buildHreflang(path),
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: "MALPOTH",
      type: "website",
      ...ogLocaleFor(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/* ------------------------------------------------------------------ */
/*  JSON-LD                                                            */
/* ------------------------------------------------------------------ */

function schemasFor(pair: ConversionPair) {
  const path = `${PAGE_PATH}/${pair.slug}`;
  const url = `${SITE_URL}${path}`;
  const { from, to } = pairTitleWords(pair);
  const name = `${from.title} to ${to.title} Converter`;
  const faq = pairFaq(pair);

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name,
      url,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      description: pairMetaDescription(pair),
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      provider: { "@type": "Organization", name: "MALPOTH", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Land Unit Converter",
          item: `${SITE_URL}${PAGE_PATH}`,
        },
        { "@type": "ListItem", position: 3, name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((i) => ({
        "@type": "Question",
        name: i.q,
        acceptedAnswer: { "@type": "Answer", text: i.a },
      })),
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
      <span aria-hidden="true" className="h-px w-7 bg-gold" />
      {children}
    </p>
  );
}

function ConversionTable({
  heading,
  caption,
  leftLabel,
  rightLabel,
  rows,
}: {
  heading: string;
  caption: string;
  leftLabel: string;
  rightLabel: string;
  rows: Array<[string, string]>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
      <div className="border-b border-outline-variant px-4 py-3">
        <h3 className="font-display text-base font-semibold text-navy">
          {heading}
        </h3>
        <p className="mt-0.5 text-xs leading-relaxed text-on-surface-variant">
          {caption}
        </p>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container">
            <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
              {leftLabel}
            </th>
            <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
              {rightLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([left, right], i) => (
            <tr
              key={left}
              className={
                i % 2 === 0
                  ? "border-b border-outline-variant/50"
                  : "border-b border-outline-variant/50 bg-surface-container/40"
              }
            >
              <td className="mono-stat px-4 py-2.5 font-medium text-on-surface">
                {left}
              </td>
              <td className="mono-stat px-4 py-2.5 text-right font-semibold text-navy">
                {right}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function ConversionPairPage({ params }: PageProps) {
  const { pair: slug } = await params;
  const pair = loadPair(slug);
  const { from, to } = pairTitleWords(pair);
  const factor = pairFactor(pair);
  const reverseFactor = pairReverseFactor(pair);
  const faq = pairFaq(pair);
  const related = relatedPairs(pair, 6);

  // "1 from in every unit" strip — computed from the exact factors.
  const oneFromSqFt = convertLand(1, pair.from, "sqft");
  const everyUnit = landValuesFromSqFt(oneFromSqFt).filter(
    ({ unit }) => unit.key !== pair.from,
  );

  const groupLabel =
    pair.group === "within-hill" || pair.group === "cross-system"
      ? systemOf(pair.from) === "BIGHA"
        ? GROUP_LABELS["nepali-bigha"]
        : GROUP_LABELS["nepali-ropani"]
      : pair.group === "within-terai"
        ? GROUP_LABELS["nepali-bigha"]
        : GROUP_LABELS.international;

  const forwardRows: Array<[string, string]> = TABLE_VALUES.map((v) => [
    `${formatLandNumber(v)} ${from.title}`,
    formatLandNumber(convertLand(v, pair.from, pair.to)),
  ]);
  const reverseRows: Array<[string, string]> = TABLE_VALUES.map((v) => [
    formatLandNumber(v),
    formatLandNumber(convertLand(v, pair.to, pair.from)),
  ]);

  const schemas = schemasFor(pair);

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <main>
        {/* ── Hero + answer block ─────────────────────────────────── */}
        <section className="border-b border-outline-variant bg-surface-container-low">
          <Container>
            <div className="max-w-xl py-5 sm:py-6">
              <nav aria-label="Breadcrumb" className="mb-3">
                <ol className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-on-surface-variant">
                  <li>
                    <Link href="/" className="hover:text-primary">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={PAGE_PATH} className="hover:text-primary">
                      Land Unit Converter
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page" className="text-gold-deep">
                    {from.title} → {to.title}
                  </li>
                </ol>
              </nav>

              <h1 className="font-display text-xl font-semibold leading-tight text-navy sm:text-2xl">
                {from.title} to {to.title} Converter
              </h1>

              {/* Featured-snippet answer */}
              <div className="mt-4 inline-flex flex-col rounded-xl border border-gold/40 bg-surface px-5 py-4 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  Exact answer
                </span>
                <span className="mono-stat mt-1 text-lg font-bold text-navy sm:text-xl">
                  1 {from.title} = {factor} {to.plural}
                </span>
                <span className="mt-1 text-xs font-medium text-on-surface-variant">
                  …and 1 {to.title} = {reverseFactor} {from.plural}
                </span>
              </div>
            </div>
          </Container>
        </section>

        {/* ── Interactive converter ────────────────────────────────── */}
        <section className="py-8 sm:py-12">
          <Container>
            <ConvertorClient
              initialFrom={pair.from as UnitKey}
              initialTo={pair.to as UnitKey}
            />

            <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-outline-variant bg-surface-container-low/60 p-4 text-sm leading-relaxed text-on-surface-variant">
              <strong className="font-semibold text-navy">
                How this conversion works.
              </strong>{" "}
              {pairFactorChain(pair)}
            </div>
          </Container>
        </section>

        {/* ── Lookup tables ─────────────────────────────────────────── */}
        <section className="border-t border-outline-variant bg-surface-container-low pb-12">
          <Container>
            <div className="mx-auto max-w-4xl pt-10 sm:pt-14">
              <SectionEyebrow>Lookup tables</SectionEyebrow>
              <h2 className="font-display text-2xl font-semibold text-navy">
                {from.title} to {to.title} conversion table
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Common values precomputed with the exact factor — no rounding
                beyond the digits shown. The reverse direction is included so
                you can check deed figures either way.
              </p>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <ConversionTable
                  heading={`${from.title} → ${to.title}`}
                  caption={`Multiply ${from.plural.toLowerCase()} by ${factor}.`}
                  leftLabel={`${from.title} (${groupLabel})`}
                  rightLabel={to.title}
                  rows={forwardRows}
                />
                <ConversionTable
                  heading={`${to.title} → ${from.title}`}
                  caption={`Multiply by ${reverseFactor} for the reverse direction.`}
                  leftLabel={to.title}
                  rightLabel={from.title}
                  rows={reverseRows}
                />
              </div>

              {/* Every-unit strip */}
              <div className="mt-10 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
                <div className="border-b border-outline-variant px-4 py-3">
                  <h3 className="font-display text-base font-semibold text-navy">
                    1 {from.title} in every supported unit
                  </h3>
                </div>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 px-4 py-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
                  {everyUnit.map(({ unit, value }) => (
                    <li
                      key={unit.key}
                      className="flex items-baseline justify-between gap-2 border-b border-outline-variant/40 py-1.5 last:border-b-0"
                    >
                      <span className="text-xs font-medium text-on-surface-variant">
                        {unit.label}
                      </span>
                      <span className="mono-stat truncate text-right text-sm font-semibold text-navy">
                        {formatLandNumber(value)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <section className="py-10 sm:py-14">
          <Container>
            <div className="mx-auto max-w-3xl">
              <SectionEyebrow>FAQ</SectionEyebrow>
              <h2 className="font-display text-2xl font-semibold text-navy">
                {from.title} to {to.title} questions
              </h2>
              <Accordion type="single" collapsible className="mt-6">
                {faq.map((item, idx) => (
                  <AccordionItem
                    key={item.q}
                    value={`faq-${idx}`}
                    className="border-outline-variant"
                  >
                    <AccordionTrigger className="text-left font-semibold text-on-surface hover:text-primary">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="leading-relaxed text-on-surface-variant">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Container>
        </section>

        {/* ── Related conversions ───────────────────────────────────── */}
        <section className="border-t border-outline-variant bg-surface-container-low py-10 sm:py-14">
          <Container>
            <div className="mx-auto max-w-3xl">
              <SectionEyebrow>Related conversions</SectionEyebrow>
              <h2 className="font-display text-2xl font-semibold text-navy">
                More {from.title} conversions
              </h2>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {related.map((r) => {
                  const rw = pairTitleWords(r);
                  const active = r.slug === reversePair(pair)?.slug;
                  return (
                    <Link
                      key={r.slug}
                      href={`/convertor/${r.slug}`}
                      className={
                        "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors duration-150 hover:border-primary/40 hover:bg-primary/5 " +
                        (active
                          ? "border-gold/50 bg-gold-soft/30"
                          : "border-outline-variant bg-surface")
                      }
                    >
                      <span className="text-sm font-medium text-on-surface">
                        {rw.from.title} to {rw.to.title}
                      </span>
                      <span className="mono-stat shrink-0 text-xs font-semibold text-gold-deep">
                        1 = {pairFactor(r)}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* CTA into verified inventory */}
              <div className="mt-8 rounded-xl border border-gold/40 bg-gradient-to-br from-gold-soft/30 to-transparent p-5">
                <p className="font-display text-base font-semibold text-navy">
                  Checking a plot size against a real listing?
                </p>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                  Every MALPOTH listing shows its area in both traditional and
                  international units, cross-checked against the cadastral
                  record before publication.
                </p>
                <Link
                  href="/category/land"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-opacity duration-150 hover:opacity-90"
                >
                  Browse verified land for sale
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
