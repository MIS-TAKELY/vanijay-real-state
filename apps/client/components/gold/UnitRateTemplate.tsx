import Link from "next/link";
import {
  METAL_META,
  FALLBACK_PRICES,
  convertUnit,
  formatPrice,
} from "../../constants/gold/metals";
import type { MetalId } from "../../constants/gold/metals";
import type { FenegosidaTodayRate } from "lib/fenegosida";
import { SITE_URL } from "lib/site";

/**
 * Server-rendered programmatic template for unit-rate pages
 * (/gold/tola, /gold/gram, /silver/tola, …). Targets the "X price per Y"
 * search pattern with data-driven unique value per page: live-derived
 * cross-unit price tables, the official Nepali market rate where
 * available, unit-reference facts and generated FAQs.
 *
 * Restricted to gold + silver deliberately — these are the metals quoted
 * in traditional Nepali units (tola/anna/sukhi), so every permutation has
 * genuine search demand behind it.
 */

export const UNIT_RATE_METALS = ["gold", "silver"] as const;

export interface UnitRateUnit {
  id: string;
  label: string;
  nepali?: string;
  grams: number;
}

const OZ_GRAMS = 31.1035;

export const UNIT_RATE_UNITS: UnitRateUnit[] = [
  { id: "tola", label: "Tola", nepali: "तोला", grams: 11.6638038 },
  { id: "anna", label: "Anna", nepali: "आना", grams: 11.6638038 / 16 },
  { id: "sukhi", label: "Sukhi", nepali: "सुकी", grams: 11.6638038 / 64 },
  { id: "gram", label: "Gram", grams: 1 },
  { id: "kilo", label: "Kilogram", grams: 1000 },
  { id: "oz", label: "Troy Ounce", grams: OZ_GRAMS },
];

export function isValidUnitRateCombo(
  metalId: string,
  unitId: string,
): boolean {
  return (
    (UNIT_RATE_METALS as readonly string[]).includes(metalId) &&
    UNIT_RATE_UNITS.some((u) => u.id === unitId)
  );
}

interface UnitRateTemplateProps {
  metalId: MetalId;
  unitId: string;
  /** Official Nepali market rate (Fenegosida), when available. */
  todayRate?: FenegosidaTodayRate | null;
}

export function UnitRateTemplate({
  metalId,
  unitId,
  todayRate,
}: UnitRateTemplateProps) {
  const meta = METAL_META[metalId];
  const unit = UNIT_RATE_UNITS.find((u) => u.id === unitId)!;

  // Live-anchored spot price in NPR per troy ounce (the feed's base unit).
  // FALLBACK_PRICES is the same server-side anchor MetalPageTemplate uses,
  // so the server HTML always carries real numbers for crawlers; the client
  // template then takes over with the live ticker.
  const spotNprPerOz = FALLBACK_PRICES[metalId];
  const pricePerUnit = convertUnit(spotNprPerOz, "oz", unit.id);

  const officialPerTola = todayRate?.perTola ?? null;
  const officialPerUnit =
    officialPerTola != null
      ? convertUnit(officialPerTola, "tola", unit.id)
      : null;

  const metalUrl = `${SITE_URL}/${metalId}`;
  const pagePath = `/${metalId}/${unit.id}`;
  const pageUrl = `${SITE_URL}${pagePath}`;

  const faqs = [
    {
      q: `What is the current ${meta.name.toLowerCase()} price per ${unit.label.toLowerCase()}?`,
      a:
        officialPerUnit != null
          ? `The official Nepali market rate equals ${formatPrice(officialPerUnit)} per ${unit.label.toLowerCase()} today (published ${todayRate?.date}). The live international spot equivalent is around ${formatPrice(pricePerUnit)} per ${unit.label.toLowerCase()}. Rates refresh continuously during trading hours.`
          : `The live international spot rate is around ${formatPrice(pricePerUnit)} per ${unit.label.toLowerCase()} right now. Prices update continuously — check the live ${meta.name} page for the latest ticker.`,
    },
    {
      q: `How many grams are in a ${unit.label.toLowerCase()}?`,
      a:
        unit.nepali
          ? `One ${unit.label} (${unit.nepali}) equals exactly ${unit.grams.toFixed(4)} grams. Nepal's bullion market quotes rates per tola (11.6638 g), with 1 tola = 16 anna and 1 anna = 4 sukhi.`
          : `One ${unit.label} equals ${unit.grams.toLocaleString("en-US")} grams. Use the conversion table above to see ${meta.name.toLowerCase()} prices across all supported units.`,
    },
    {
      q: `Is the ${meta.name.toLowerCase()} rate per ${unit.label.toLowerCase()} the same across Nepal?`,
      a: `The official rate published by NEFEJ/Fenegosida-associated traders applies nationwide, but individual jewellers may add small premiums for making charges or offer slightly different rates for bulk investment bars. Always confirm the final billed amount before purchase.`,
    },
    {
      q: `How do I convert ${meta.name.toLowerCase()} prices per ${unit.label.toLowerCase()} to other units?`,
      a: `Divide or multiply by each unit's gram weight — the reference table on this page lists exact conversions. For example, at today's rate, 1 gram of ${meta.name.toLowerCase()} costs about ${formatPrice(convertUnit(spotNprPerOz, "oz", "gram"))}, so a full tola (11.6638 g) works out to roughly ${formatPrice(convertUnit(spotNprPerOz, "oz", "tola"))}.`,
    },
  ];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: meta.name,
        item: metalUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Per ${unit.label}`,
        item: pageUrl,
      },
    ],
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: `${meta.name} Price per ${unit.label} Today`,
    description: `Live ${meta.name.toLowerCase()} price per ${unit.label.toLowerCase()} in NPR — spot-derived and official Nepali market rates.`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    inLanguage: "en",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <main className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto w-full max-w-[1280px] px-4 pt-6 pb-4 sm:px-6 md:pt-12 md:pb-10">
        {/* Hero */}
        <section className="mb-8">
          <p
            className="mb-2 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-gold-deep"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className="h-px w-6 bg-gold/60" aria-hidden="true" />
            {meta.name} · Per {unit.label}
            {unit.nepali ? ` (${unit.nepali})` : ""}
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {meta.name} Price per {unit.label} Today
          </h1>
          <p
            className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Live international spot rate for {meta.name.toLowerCase()} quoted
            per {unit.label.toLowerCase()}, alongside the official Nepali
            market rate where published. All conversions use exact metric
            definitions of the traditional units.
          </p>
          <p
            className="mono-stat mt-6 text-4xl font-semibold tracking-tight text-on-surface"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatPrice(pricePerUnit)}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            per {unit.label} · live NPR equivalent, refreshed continuously
          </p>
        </section>

        {/* Cross-unit price table */}
        <section className="mb-8">
          <h2
            className="mb-4 text-xl font-semibold tracking-tight text-on-surface"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {meta.name} Price Across Units
          </h2>
          <div className="overflow-hidden rounded-xl border border-outline-variant">
            <table className="w-full text-left text-sm" style={{ fontFamily: "var(--font-body)" }}>
              <thead className="bg-surface-container text-xs uppercase tracking-[0.5px] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">Unit</th>
                  <th className="px-4 py-3 font-semibold">Grams</th>
                  <th className="px-4 py-3 text-right font-semibold">Spot Rate (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {UNIT_RATE_UNITS.map((u) => (
                  <tr
                    key={u.id}
                    className={
                      u.id === unit.id
                        ? "bg-gold/[0.06] font-medium text-on-surface"
                        : "text-on-surface-variant hover:bg-surface-container/60"
                    }
                  >
                    <td className="px-4 py-3">
                      {u.id === unit.id ? (
                        <span>
                          {u.label}
                          {u.nepali ? ` (${u.nepali})` : ""} — current
                        </span>
                      ) : (
                        <Link
                          href={`/${metalId}/${u.id}`}
                          className="transition-colors hover:text-primary hover:underline"
                        >
                          {u.label}
                          {u.nepali ? ` (${u.nepali})` : ""}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {u.grams.toLocaleString("en-US", {
                        maximumFractionDigits: 4,
                      })} g
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatPrice(convertUnit(spotNprPerOz, "oz", u.id))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Official Nepal rate callout */}
        {officialPerTola != null && (
          <section className="mb-8 rounded-xl border border-gold/30 bg-gold/[0.04] p-5">
            <h2
              className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-gold-deep"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Official Nepali Market Rate
            </h2>
            <p
              className="text-sm leading-relaxed text-on-surface-variant"
              style={{ fontFamily: "var(--font-body)" }}
            >
              The officially published rate for {""}
              {new Date(todayRate?.date ?? Date.now()).toLocaleDateString(
                "en-US",
                { month: "long", day: "numeric", year: "numeric" },
              )}{" "}
              works out to{" "}
              <strong className="text-on-surface">
                {formatPrice(officialPerUnit ?? 0)} per {unit.label.toLowerCase()}
              </strong>{" "}
              ({formatPrice(officialPerTola)} per tola). Jewellers across Nepal
              benchmark their retail rates against this figure.
            </p>
          </section>
        )}

        {/* Unit reference facts */}
        <section className="mb-8">
          <h2
            className="mb-4 text-xl font-semibold tracking-tight text-on-surface"
            style={{ fontFamily: "var(--font-display)" }}
          >
            About the {unit.label} Unit
          </h2>
          <div
            className="rounded-xl border border-outline-variant bg-surface-container/40 p-5 text-sm leading-relaxed text-on-surface-variant"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {unit.id === "tola" && (
              <p>
                One tola (तोला) equals exactly 11.6638038 grams — 180 troy
                grains. It is the standard quoting unit in Nepal&apos;s
                bullion and jewellery market: 1 tola = 16 anna = 64 sukhi.
                Investment bars and jewellery are almost always priced and
                billed per tola.
              </p>
            )}
            {unit.id === "anna" && (
              <p>
                One anna (आना) is one-sixteenth of a tola — approximately
                0.7290 grams. It is used for smaller ornaments and precise
                weight breakdowns in Nepali gold shops.
              </p>
            )}
            {unit.id === "sukhi" && (
              <p>
                One sukhi (सुकी) is one sixty-fourth of a tola — approximately
                0.1822 grams. It is the smallest traditional unit, used for
                tiny jewellery pieces and stone weights.
              </p>
            )}
            {unit.id === "gram" && (
              <p>
                The gram is the international metric standard for small-quantity
                precious-metal trading. Investment coins and small bars are
                commonly sold in 1 g, 5 g, 10 g, 20 g and 100 g weights.
              </p>
            )}
            {unit.id === "kilo" && (
              <p>
                The kilogram (1,000 g) is used for bulk bullion trades and
                institutional settlement. At today&apos;s spot rate, one
                kilogram of {meta.name.toLowerCase()} is worth roughly{" "}
                {formatPrice(convertUnit(spotNprPerOz, "oz", "kilo"))}.
              </p>
            )}
            {unit.id === "oz" && (
              <p>
                The troy ounce (31.1035 g) is the global spot-market quoting
                unit for {meta.name.toLowerCase()} — the XAU/XAG ticker prices
                you see on financial media are always per troy ounce.
              </p>
            )}
          </div>
        </section>

        {/* FAQ (mirrors FAQPage schema above) */}
        <section className="mb-8">
          <h2
            className="mb-4 text-xl font-semibold tracking-tight text-on-surface"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {meta.name} per {unit.label} — FAQs
          </h2>
          <div className="flex flex-col divide-y divide-outline-variant rounded-xl border border-outline-variant">
            {faqs.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none text-sm font-medium text-on-surface marker:hidden">
                  {f.q}
                </summary>
                <p
                  className="mt-3 text-sm leading-relaxed text-on-surface-variant"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Cross-links */}
        <section
          className="border-t border-outline-variant pt-6 text-sm"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <p className="text-on-surface-variant">
            Track the live ticker on the{" "}
            <Link
              href={`/${metalId}`}
              className="font-medium text-primary hover:underline"
            >
              {meta.name} market page
            </Link>
            {", or compare across assets in the "}
            <Link
              href="/metals/compare"
              className="font-medium text-primary hover:underline"
            >
              metal comparison tool
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
